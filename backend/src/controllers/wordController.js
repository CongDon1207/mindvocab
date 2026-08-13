import Word from '../model/Word.js'
import Folder from '../model/Folder.js'
import { normalizeWordInput, validateWordInput } from '../utils/wordContent.js'

export async function getWordsInFolder(req, res) {
  try {
    const { id: folderId } = req.params
    const skip = Number.parseInt(req.query.skip, 10) || 0; const limit = Number.parseInt(req.query.limit, 10) || 20
    if (!await Folder.findById(folderId)) return res.status(404).json({ error: 'Folder not found.' })
    const filter = { folderId }; if (req.query.q) filter.word = { $regex: req.query.q, $options: 'i' }; if (req.query.pos) filter.pos = req.query.pos
    const [words, total] = await Promise.all([Word.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }), Word.countDocuments(filter)])
    return res.json({ words, total, skip, limit })
  } catch (error) { return res.status(400).json({ error: 'Could not get words.', detail: error.message }) }
}

export async function createWord(req, res) {
  try {
    if (!req.body?.folderId) return res.status(400).json({ error: 'folderId is required.' })
    if (!await Folder.findById(req.body.folderId)) return res.status(404).json({ error: 'Folder not found.' })
    const { value, errors } = validateWordInput(req.body); if (errors.length) return res.status(400).json({ error: errors[0], errors })
    return res.status(201).json(await Word.create({ folderId: req.body.folderId, normalizedWord: value.word.toLowerCase(), ...value }))
  } catch (error) { return res.status(500).json({ error: 'Could not create word.', detail: error.message }) }
}

export async function updateWord(req, res) {
  try {
    const existing = await Word.findById(req.params.id); if (!existing) return res.status(404).json({ error: 'Word not found.' })
    const candidate = { ...existing.toObject(), ...(req.body || {}), ex1: { ...existing.ex1, ...(req.body?.ex1 || {}), en: req.body?.ex1_en ?? req.body?.ex1?.en ?? existing.ex1.en, vi: req.body?.ex1_vi ?? req.body?.ex1?.vi ?? existing.ex1.vi }, ex2: { ...existing.ex2, ...(req.body?.ex2 || {}), en: req.body?.ex2_en ?? req.body?.ex2?.en ?? existing.ex2.en, vi: req.body?.ex2_vi ?? req.body?.ex2?.vi ?? existing.ex2.vi }, fillExample: { ...existing.fillExample, ...(req.body?.fillExample || {}), en: req.body?.fill_en ?? req.body?.fillExample?.en ?? existing.fillExample.en } }
    const { value, errors } = validateWordInput(candidate); if (errors.length) return res.status(400).json({ error: errors[0], errors })
    const normalized = normalizeWordInput(value)
    return res.json(await Word.findByIdAndUpdate(req.params.id, { ...normalized, normalizedWord: normalized.word.toLowerCase() }, { new: true }))
  } catch (error) { return res.status(400).json({ error: 'Could not update word.', detail: error.message }) }
}

export async function deleteWord(req, res) {
  try { if (!await Word.findByIdAndDelete(req.params.id)) return res.status(404).json({ error: 'Word not found.' }); return res.json({ message: 'Word deleted.' }) }
  catch (error) { return res.status(400).json({ error: 'Could not delete word.', detail: error.message }) }
}
