import { escapeRegex } from '../utils/regex.js'

const POS_WHITELIST = new Set(['noun', 'verb', 'adj', 'adv', 'prep', 'phrase', 'idiom', 'other'])
const IPA_REGEX =
  /^[a-zA-Zəɜːɔːæʌɪʊθðʃʒŋˈˌːɒɑẽũɛɚɝɾsʔːɡɫɣʫʧʤʰʲʷɾɨɤɯɹɻɾɭɳɲʎçʍɳɽɰʑɕβð]+[ːa-zA-Zəɜːɔːæʌɪʊθðʃʒŋˈˌːɒɑẽũɛɚɝɾsʔɡɫɣʫʧʤʰʲʷɾɨɤɯɹɻɭɳɲʎçʍɳɽɰʑɕβð\/\s]*$/u

const BATCH_SIZE = Number(process.env.IMPORT_ENRICH_BATCH || 20)
const RETRY_LIMIT = Number(process.env.AI_RETRY_LIMIT || 2)

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildCacheKey(record) {
  return `${record.normalizedWord}::${record.meaning_vi.toLowerCase()}`
}

function applyAiPayload(record, payload, jobState) {
  let improved = false

  if (payload.pos && record.missing.pos) {
    const normalizedPos = payload.pos.toString().toLowerCase().trim()
    if (POS_WHITELIST.has(normalizedPos)) {
      record.pos = normalizedPos
      record.fieldSources.pos = 'inferred'
      record.missing.pos = false
      improved = true
    } else {
      jobState.addError({
        stage: 'enrich',
        message: `POS không hợp lệ: ${payload.pos}`,
        location: record.word,
      })
    }
  }

  if (payload.ipa && record.missing.ipa) {
    const ipa = payload.ipa.toString().replace(/\//g, '').trim()
    if (ipa && IPA_REGEX.test(ipa)) {
      record.ipa = ipa
      record.fieldSources.ipa = 'inferred'
      record.missing.ipa = false
      improved = true
    } else {
      jobState.addError({
        stage: 'enrich',
        message: `IPA không hợp lệ: ${payload.ipa}`,
        location: record.word,
      })
    }
  }

  if (payload.note && record.missing.note) {
    const note = payload.note.toString().trim()
    if (note.length > 0) {
      record.note = note.slice(0, 220)
      record.fieldSources.note = 'inferred'
      record.missing.note = false
      improved = true
    }
  }

  if (Array.isArray(payload.examples)) {
    const accepted = []
    payload.examples.forEach((example) => {
      if (!example?.en || !example?.vi) return
      const en = example.en.toString().trim()
      const vi = example.vi.toString().trim()
      const wordRegex = new RegExp(`\\b${escapeRegex(record.word)}\\b`, 'i')
      if (!wordRegex.test(en)) {
        jobState.addError({
          stage: 'enrich',
          message: 'Ví dụ không chứa đúng từ khoá',
          location: record.word,
        })
        return
      }
      accepted.push({
        en,
        vi,
        source: 'inferred',
      })
    })

    if (accepted.length && record.missing.ex1) {
      record.examples = [...record.examples, ...accepted].slice(0, 2)
      if (record.examples[0]?.en && record.examples[0]?.vi) {
        record.missing.ex1 = false
      }
      if (record.examples[1]?.en && record.examples[1]?.vi) {
        record.missing.ex2 = false
      }
      improved = true
    }
  }

  if (Array.isArray(payload.tags) && record.tags.length === 0) {
    const tags = payload.tags
      .map((tag) => tag.toString().trim())
      .filter(Boolean)
      .slice(0, 5)
    if (tags.length) {
      record.tags = tags
      improved = true
    }
  }

  return improved
}

async function callProviders(batch, providers, jobState) {
  let lastError = null
  for (const providerEntry of providers) {
    for (let attempt = 0; attempt < RETRY_LIMIT; attempt += 1) {
      try {
        return await providerEntry.instance.enrich(batch)
      } catch (error) {
        lastError = error
        const backoff = Math.min(2000 * (attempt + 1), 8000)
        await delay(backoff)
      }
    }
  }
  if (lastError) {
    jobState.addError({
      stage: 'enrich',
      message: lastError.message,
      location: 'batch',
    })
  }
  return null
}

export async function processEnrichment(records, providers, jobState) {
  const needsEnrich = records.filter(
    (record) =>
      record.missing.pos ||
      record.missing.ipa ||
      record.missing.note ||
      record.missing.ex1 ||
      record.missing.ex2
  )

  if (!needsEnrich.length) {
    return { enrichedCount: 0 }
  }

  if (!providers.length) {
    jobState.addError({
      stage: 'enrich',
      message: 'Không có AI provider khả dụng',
      location: 'system',
    })
    return { enrichedCount: 0 }
  }

  const cache = new Map()
  let enrichedCount = 0

  for (let i = 0; i < needsEnrich.length; i += BATCH_SIZE) {
    const batchRecords = needsEnrich.slice(i, i + BATCH_SIZE)
    const cached = []
    const uncached = []

    batchRecords.forEach((record) => {
      const key = buildCacheKey(record)
      if (cache.has(key)) {
        cached.push({ record, payload: cache.get(key) })
      } else {
        uncached.push(record)
      }
    })

    cached.forEach(({ record, payload }) => {
      if (applyAiPayload(record, payload, jobState)) {
        enrichedCount += 1
      }
    })

    if (!uncached.length) {
      continue
    }

    const providerPayload = uncached.map((record) => ({
      word: record.word,
      meaning_vi: record.meaning_vi,
      pos: record.pos,
      ipa: record.ipa,
      note: record.note,
      examples: record.examples,
      tags: record.tags,
    }))

    const enrichedResponse = await callProviders(providerPayload, providers, jobState)

    // Logging quan sát độ lớn phản hồi theo từng batch (không log nội dung)
    try {
      const size = Array.isArray(enrichedResponse) ? enrichedResponse.length : 0
      console.log(
        `[import][enrich] batch=${uncached.length} items, responseItems=${size}`
      )
    } catch (_) {
      // ignore logging error
    }

    if (!enrichedResponse) {
      uncached.forEach((record) =>
        jobState.addError({
          stage: 'enrich',
          message: 'Không thể enrich bản ghi',
          location: record.word,
        })
      )
      continue
    }

    enrichedResponse.forEach((payload, index) => {
      const record = uncached[index]
      if (!record) return
      const improved = applyAiPayload(record, payload, jobState)
      if (improved) {
        enrichedCount += 1
      }
      cache.set(buildCacheKey(record), payload)
    })
  }

  return { enrichedCount }
}
