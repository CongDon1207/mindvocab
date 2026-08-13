import Folder from '../model/Folder.js'
import Word from '../model/Word.js'
import { buildProgress } from '../services/srsService.js'

export async function createFolder(req, res) {
  try {
    const name = (req.body?.name || '').trim()
    if (!name) return res.status(400).json({ error: 'Folder name is required.' })
    return res.status(201).json(await Folder.create({ name, description: (req.body?.description || '').trim() }))
  } catch (error) {
    return res.status(500).json({ error: 'Could not create folder.', detail: error.message })
  }
}

export async function listFolders(_req, res, next) {
  try {
    const folders = await Folder.find().sort({ createdAt: -1 }).lean()
    const wordsByFolder = new Map()
    for (const word of await Word.find().lean()) {
      const words = wordsByFolder.get(String(word.folderId)) || []
      words.push(word)
      wordsByFolder.set(String(word.folderId), words)
    }
    return res.json(folders.map((folder) => ({ ...folder, stats: buildProgress(wordsByFolder.get(String(folder._id)) || []) })))
  } catch (error) {
    return next(error)
  }
}

export async function getFolderById(req, res) {
  try {
    const folder = await Folder.findById(req.params.id)
    if (!folder) return res.status(404).json({ error: 'Folder not found.' })
    return res.json({ ...folder.toObject(), stats: buildProgress(await Word.find({ folderId: folder._id })) })
  } catch (error) {
    return res.status(400).json({ error: 'Could not get folder.', detail: error.message })
  }
}

export async function updateFolder(req, res) {
  try {
    const name = (req.body?.name || '').trim()
    if (!name) return res.status(400).json({ error: 'Folder name is required.' })
    const update = { name, description: (req.body?.description || '').trim() }
    if (req.body?.nextReviewDate !== undefined) {
      if (req.body.nextReviewDate) {
        const date = new Date(req.body.nextReviewDate)
        if (Number.isNaN(date.getTime())) return res.status(400).json({ error: 'nextReviewDate must be a valid date.' })
        update.nextReviewDate = date
      } else update.nextReviewDate = null
    }
    const folder = await Folder.findByIdAndUpdate(req.params.id, update)
    if (!folder) return res.status(404).json({ error: 'Folder not found.' })
    return res.json(folder)
  } catch (error) {
    return res.status(500).json({ error: 'Could not update folder.', detail: error.message })
  }
}

export async function deleteFolder(req, res) {
  try {
    const folder = await Folder.findByIdAndDelete(req.params.id)
    if (!folder) return res.status(404).json({ error: 'Folder not found.' })
    return res.json({ message: 'Folder deleted.' })
  } catch (error) {
    return res.status(400).json({ error: 'Could not delete folder.', detail: error.message })
  }
}

export async function resetFolderProgress(req, res) {
  try {
    if (!await Folder.findById(req.params.id)) return res.status(404).json({ error: 'Folder not found.' })
    const result = await Word.updateMany({ folderId: req.params.id }, { $set: {
      'meta.lastSeenAt': null, 'meta.stage': 0, 'meta.difficulty': 0, 'meta.interval': 0,
      'meta.nextReviewDate': null, 'meta.correctCount': 0, 'meta.incorrectCount': 0,
    } })
    return res.json({ message: 'Learning progress reset.', resetCount: result.modifiedCount, totalWords: result.matchedCount })
  } catch (error) {
    return res.status(500).json({ error: 'Could not reset progress.', detail: error.message })
  }
}
