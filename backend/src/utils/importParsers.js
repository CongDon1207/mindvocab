import fs from 'fs/promises'
import path from 'path'
import xlsx from 'xlsx'

const HEADER_ALIASES = {
  word: ['word', 'từ', 'english', 'en'],
  meaning_vi: ['meaning_vi', 'meaning', 'definition_vi', 'nghĩa', 'vi', 'vietnamese'],
  pos: ['pos', 'part_of_speech', 'loại từ', 'speech'],
  ipa: ['ipa', 'phonetic', 'phiên âm'],
  note: ['note', 'ghi chú', 'tips', 'hint'],
  ex1_en: ['ex1_en', 'example1_en', 'example_en', 'ví dụ 1 en'],
  ex1_vi: ['ex1_vi', 'example1_vi', 'example_vi', 'ví dụ 1 vi'],
  ex2_en: ['ex2_en', 'example2_en'],
  ex2_vi: ['ex2_vi', 'example2_vi'],
  tags: ['tags', 'tag', 'nhãn'],
}

function normalizeHeader(value) {
  if (!value) return ''
  const key = value.toString().trim().toLowerCase()
  return key.replace(/\s+/g, '_')
}

function mapHeader(cell) {
  const normalized = normalizeHeader(cell)
  for (const [target, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.includes(normalized)) {
      return target
    }
  }
  return normalized
}

function baseRecord({ folderId, word, meaning_vi }) {
  const normalizedWord = word.trim()
  const wordDisplay = normalizedWord
  const lower = normalizedWord.toLowerCase()

  return {
    folderId,
    word: wordDisplay,
    normalizedWord: lower,
    meaning_vi: meaning_vi.trim(),
    pos: '',
    ipa: '',
    note: '',
    examples: [],
    tags: [],
    fieldSources: {
      meaning_vi: 'user',
      pos: 'inferred',
      ipa: 'inferred',
      note: 'inferred',
    },
    missing: {
      pos: true,
      ipa: true,
      note: true,
      ex1: true,
      ex2: true,
    },
  }
}

function applyOptionalFields(record, payload) {
  if (payload.pos) {
    record.pos = payload.pos.trim()
    record.fieldSources.pos = 'user'
    record.missing.pos = false
  }
  if (payload.ipa) {
    record.ipa = payload.ipa.trim()
    record.fieldSources.ipa = 'user'
    record.missing.ipa = false
  }
  if (payload.note) {
    record.note = payload.note.trim()
    record.fieldSources.note = 'user'
    record.missing.note = !record.note
  }
  if (Array.isArray(payload.examples) && payload.examples.length > 0) {
    record.examples = payload.examples.map((ex) => ({
      en: ex.en?.trim() || '',
      vi: ex.vi?.trim() || '',
      source: 'user',
    }))
    if (record.examples[0]?.en && record.examples[0]?.vi) {
      record.missing.ex1 = false
    }
    if (record.examples[1]?.en && record.examples[1]?.vi) {
      record.missing.ex2 = false
    }
  }
  if (Array.isArray(payload.tags) && payload.tags.length > 0) {
    record.tags = payload.tags
  }
  return record
}

export async function parseTxtFile(filePath, { folderId }) {
  const raw = await fs.readFile(filePath, 'utf-8')
  const lines = raw.split(/\r?\n/)
  const records = []
  const errors = []
  const duplicates = []
  const seen = new Set()

  lines.forEach((line, index) => {
    const lineNumber = index + 1
    if (!line || !line.trim()) {
      return
    }
    const cleaned = line.trim().replace(/^\d+[\.\)]\s*/, '')
    const normalized = cleaned.replace(/\s+[–—-]\s+/g, ': ')
    const parts = normalized.split(':')
    if (parts.length < 2) {
      errors.push({
        stage: 'parse',
        message: 'Không nhận diện được cặp word/meaning',
        location: `line ${lineNumber}`,
      })
      return
    }
    const word = parts.shift().trim()
    const meaning = parts.join(':').trim()
    if (!word || !meaning) {
      errors.push({
        stage: 'parse',
        message: 'Thiếu word hoặc meaning',
        location: `line ${lineNumber}`,
      })
      return
    }

    const record = baseRecord({ folderId, word, meaning_vi: meaning })
    const key = record.normalizedWord
    if (seen.has(key)) {
      duplicates.push(word)
      return
    }
    seen.add(key)
    records.push(record)
  })

  return {
    type: 'txt',
    totalLines: lines.length,
    records,
    duplicates,
    errors,
  }
}

function extractExamples(rowMap) {
  const examples = []
  if (rowMap.ex1_en || rowMap.ex1_vi) {
    examples.push({
      en: (rowMap.ex1_en || '').toString(),
      vi: (rowMap.ex1_vi || '').toString(),
    })
  }
  if (rowMap.ex2_en || rowMap.ex2_vi) {
    examples.push({
      en: (rowMap.ex2_en || '').toString(),
      vi: (rowMap.ex2_vi || '').toString(),
    })
  }
  return examples
}

export async function parseXlsxFile(filePath, { folderId }) {
  const workbook = xlsx.readFile(filePath)
  const [firstSheetName] = workbook.SheetNames
  if (!firstSheetName) {
    return {
      type: 'xlsx',
      totalLines: 0,
      records: [],
      duplicates: [],
      errors: [
        { stage: 'parse', message: 'File không có sheet nào', location: 'sheet 1' },
      ],
    }
  }

  const sheet = workbook.Sheets[firstSheetName]
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' })

  if (!rows.length) {
    return {
      type: 'xlsx',
      totalLines: 0,
      records: [],
      duplicates: [],
      errors: [
        { stage: 'parse', message: 'Sheet đầu tiên không có dữ liệu', location: firstSheetName },
      ],
    }
  }

  const headerRow = rows[0].map(mapHeader)
  const requiredHeaders = ['word', 'meaning_vi']
  const hasRequired = requiredHeaders.every((header) => headerRow.includes(header))
  if (!hasRequired) {
    return {
      type: 'xlsx',
      totalLines: rows.length - 1,
      records: [],
      duplicates: [],
      errors: [
        {
          stage: 'parse',
          message: 'Không tìm thấy cột word/meaning_vi sau khi chuẩn hoá header',
          location: firstSheetName,
        },
      ],
    }
  }

  const records = []
  const errors = []
  const duplicates = []
  const seen = new Set()

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2
    if (!Array.isArray(row)) return

    const rowMap = {}
    headerRow.forEach((header, idx) => {
      rowMap[header] = row[idx]
    })

    const word = (rowMap.word || '').toString().trim()
    const meaning = (rowMap.meaning_vi || '').toString().trim()

    if (!word && !meaning) {
      return
    }

    if (!word || !meaning) {
      errors.push({
        stage: 'parse',
        message: 'Dòng thiếu word hoặc meaning_vi',
        location: `row ${rowNumber}`,
      })
      return
    }

    const record = baseRecord({ folderId, word, meaning_vi: meaning })
    const key = record.normalizedWord
    if (seen.has(key)) {
      duplicates.push(word)
      return
    }
    seen.add(key)

    const payload = {
      pos: (rowMap.pos || '').toString(),
      ipa: (rowMap.ipa || '').toString(),
      note: (rowMap.note || '').toString(),
      examples: extractExamples(rowMap).map((example) => ({
        ...example,
      })),
      tags: typeof rowMap.tags === 'string'
        ? rowMap.tags
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
        : Array.isArray(rowMap.tags)
          ? rowMap.tags
          : [],
    }

    applyOptionalFields(record, payload)
    records.push(record)
  })

  return {
    type: 'xlsx',
    totalLines: rows.length - 1,
    records,
    duplicates,
    errors,
  }
}

export async function parseImportFile(filePath, options) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.txt') {
    return parseTxtFile(filePath, options)
  }
  if (ext === '.xlsx') {
    return parseXlsxFile(filePath, options)
  }
  throw new Error('Định dạng file không hỗ trợ')
}

