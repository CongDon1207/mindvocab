// src/controllers/wordController.js
import Word from '../model/Word.js';
import Folder from '../model/Folder.js';

/**
 * Lấy danh sách từ vựng trong 1 folder
 * Query: skip, limit, q (search), pos (filter by part of speech)
 */
export async function getWordsInFolder(req, res) {
  try {
    const folderId = req.params.id;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const searchQuery = req.query.q || '';
    const posFilter = req.query.pos || '';

    // Kiểm tra folder có tồn tại không
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: 'Không tìm thấy folder.' });
    }

    // Xây dựng query filter
    const filter = { folderId };
    if (searchQuery) {
      filter.word = { $regex: searchQuery, $options: 'i' };
    }
    if (posFilter) {
      filter.pos = posFilter;
    }

    // Lấy danh sách từ + tổng số
    const [words, total] = await Promise.all([
      Word.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Word.countDocuments(filter)
    ]);

    return res.json({
      words,
      total,
      skip,
      limit
    });
  } catch (err) {
    return res.status(400).json({
      error: 'Không thể lấy danh sách từ.',
      detail: err.message
    });
  }
}

/**
 * Thêm từ mới vào folder
 * Body: { folderId, word, pos, meaning_vi, ipa?, note?, ex1?, ex2?, tags? }
 */
export async function createWord(req, res) {
  try {
    const { folderId, word, pos, meaning_vi } = req.body;

    // Validate required fields
    if (!folderId || !word || !pos || !meaning_vi) {
      return res.status(400).json({ 
        error: 'Thiếu thông tin bắt buộc: folderId, word, pos, meaning_vi.' 
      });
    }

    // Kiểm tra folder có tồn tại
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: 'Không tìm thấy folder.' });
    }

    // Tạo từ mới
    const newWord = await Word.create(req.body);
    return res.status(201).json(newWord);
  } catch (err) {
    return res.status(500).json({
      error: 'Tạo từ thất bại.',
      detail: err.message
    });
  }
}

/**
 * Cập nhật từ vựng
 * Param: :id
 * Body: { word?, pos?, meaning_vi?, ipa?, note?, ex1?, ex2?, tags? }
 */
export async function updateWord(req, res) {
  try {
    const wordId = req.params.id;
    const updates = req.body;

    // Không cho phép cập nhật folderId
    delete updates.folderId;

    const updatedWord = await Word.findByIdAndUpdate(wordId, updates, { 
      new: true,
      runValidators: true 
    });

    if (!updatedWord) {
      return res.status(404).json({ error: 'Không tìm thấy từ để cập nhật.' });
    }

    return res.json(updatedWord);
  } catch (err) {
    return res.status(400).json({
      error: 'Cập nhật từ thất bại.',
      detail: err.message
    });
  }
}

/**
 * Xóa từ vựng
 * Param: :id
 */
export async function deleteWord(req, res) {
  try {
    const wordId = req.params.id;

    const deletedWord = await Word.findByIdAndDelete(wordId);
    if (!deletedWord) {
      return res.status(404).json({ error: 'Không tìm thấy từ để xóa.' });
    }

    return res.json({ message: 'Từ đã được xóa thành công.' });
  } catch (err) {
    return res.status(400).json({
      error: 'Xóa từ thất bại.',
      detail: err.message
    });
  }
}
