import Folder from '../model/Folder.js'
import Word from '../model/Word.js'
import { buildProgress, startOfTomorrow } from '../services/srsService.js'

function buildForecast(words, now) {
  const forecast = { overdue: 0, today: 0, tomorrow: 0, next3Days: 0, nextWeek: 0, next2Weeks: 0, nextMonth: 0, later: 0 }
  const boundaries = [1, 2, 3, 7, 14, 30].map((days) => { const date = startOfTomorrow(now); date.setDate(date.getDate() + days - 1); return date })
  for (const word of words) {
    if (!word.meta?.lastSeenAt || !word.meta?.nextReviewDate) continue
    const review = new Date(word.meta.nextReviewDate)
    if (Number.isNaN(review.getTime())) continue
    if (review < now) forecast.overdue += 1
    else if (review < boundaries[0]) forecast.today += 1
    else if (review < boundaries[1]) forecast.tomorrow += 1
    else if (review < boundaries[2]) forecast.next3Days += 1
    else if (review < boundaries[3]) forecast.nextWeek += 1
    else if (review < boundaries[4]) forecast.next2Weeks += 1
    else if (review < boundaries[5]) forecast.nextMonth += 1
    else forecast.later += 1
  }
  return forecast
}

export async function getFolderStats(req, res) {
  try {
    const folder = await Folder.findById(req.params.id)
    if (!folder) return res.status(404).json({ error: 'Folder not found.' })
    const words = await Word.find({ folderId: folder._id })
    const progress = buildProgress(words)
    return res.json({ folderName: folder.name, ...progress, forecast: buildForecast(words, new Date()) })
  } catch (error) {
    return res.status(500).json({ error: 'Could not get folder statistics.', detail: error.message })
  }
}

export async function getReviewDashboard(_req, res) {
  try {
    const folders = await Folder.find().lean()
    const words = await Word.find().lean()
    const grouped = new Map()
    for (const word of words) {
      const group = grouped.get(String(word.folderId)) || []
      group.push(word)
      grouped.set(String(word.folderId), group)
    }
    const now = new Date()
    const dashboard = folders.map((folder) => {
      const folderWords = grouped.get(String(folder._id)) || []
      const progress = buildProgress(folderWords, now)
      const dates = folderWords.filter((word) => word.meta?.lastSeenAt && word.meta?.nextReviewDate).map((word) => new Date(word.meta.nextReviewDate)).filter((date) => !Number.isNaN(date.getTime()))
      const earliestReview = folder.nextReviewDate || (dates.length ? new Date(Math.min(...dates)) : null)
      if (!earliestReview && !folder.nextReviewDate) return null
      const diffDays = Math.ceil((new Date(earliestReview) - now) / 86400000)
      return { folderId: folder._id, folderName: folder.name, totalWords: progress.totalWords, masteredWords: progress.mastered, earliestReview, diffDays, category: diffDays <= 0 ? 'overdue' : diffDays <= 3 ? '3days' : diffDays <= 7 ? '7days' : diffDays <= 14 ? '14days' : diffDays <= 30 ? '30days' : 'safe', isManualSchedule: Boolean(folder.nextReviewDate) }
    }).filter(Boolean).sort((left, right) => left.diffDays - right.diffDays)
    return res.json(dashboard)
  } catch (error) {
    return res.status(500).json({ error: 'Could not get review dashboard.', detail: error.message })
  }
}
