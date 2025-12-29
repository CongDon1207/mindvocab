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
      words: words || [],
      total: total || 0,
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

/**
 * Enrich một từ đơn lẻ bằng AI
 * Param: :id
 */
export async function enrichWord(req, res) {
  try {
    const wordId = req.params.id;
    
    const word = await Word.findById(wordId);
    if (!word) {
      return res.status(404).json({ error: 'Không tìm thấy từ.' });
    }

    // Import provider chain
    const { buildProviderChain } = await import('../services/aiProviders.js');
    const providers = buildProviderChain();
    
    if (providers.length === 0) {
      return res.status(500).json({ error: 'Không có AI provider nào được cấu hình.' });
    }

    // Prepare data for enrichment
    const item = {
      id: 0,
      word: word.word,
      meaning_vi: word.meaning_vi,
      pos: word.pos || '',
      ipa: word.ipa || '',
      note: word.note || '',
      examples: [],
      tags: word.tags || [],
    };
    
    // Add existing examples
    if (word.ex1?.en && word.ex1?.vi) {
      item.examples.push({ en: word.ex1.en, vi: word.ex1.vi, source: word.ex1.source || 'user' });
    }
    if (word.ex2?.en && word.ex2?.vi) {
      item.examples.push({ en: word.ex2.en, vi: word.ex2.vi, source: word.ex2.source || 'user' });
    }

    // Call AI provider
    let enrichedData = null;
    let lastError = null;
    
    for (const provider of providers) {
      try {
        const results = await provider.instance.enrich([item]);
        if (results && results.length > 0) {
          enrichedData = results[0];
          break;
        }
      } catch (err) {
        lastError = err;
        console.error(`[enrich] Provider ${provider.name} failed:`, err.message);
      }
    }

    if (!enrichedData) {
      return res.status(500).json({ 
        error: 'AI không thể xử lý từ này.',
        detail: lastError?.message 
      });
    }

    // Apply enriched data
    const updates = {};
    
    if (enrichedData.pos && !word.pos) {
      updates.pos = enrichedData.pos;
    }
    if (enrichedData.ipa && !word.ipa) {
      updates.ipa = enrichedData.ipa.replace(/\//g, '').trim();
    }
    if (enrichedData.note && !word.note) {
      updates.note = enrichedData.note.slice(0, 220);
    }
    
    // Handle examples
    if (Array.isArray(enrichedData.examples) && enrichedData.examples.length > 0) {
      const wordRegex = new RegExp(`\\b${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
      if (!word.ex1?.en && enrichedData.examples[0]?.en && enrichedData.examples[0]?.vi) {
        if (wordRegex.test(enrichedData.examples[0].en)) {
          updates.ex1 = {
            en: enrichedData.examples[0].en,
            vi: enrichedData.examples[0].vi,
            source: 'inferred'
          };
        }
      }
      
      if (!word.ex2?.en && enrichedData.examples[1]?.en && enrichedData.examples[1]?.vi) {
        if (wordRegex.test(enrichedData.examples[1].en)) {
          updates.ex2 = {
            en: enrichedData.examples[1].en,
            vi: enrichedData.examples[1].vi,
            source: 'inferred'
          };
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.json({ 
        message: 'Từ đã có đầy đủ thông tin, không cần bổ sung.',
        word 
      });
    }

    const updatedWord = await Word.findByIdAndUpdate(wordId, updates, { new: true });
    
    return res.json({ 
      message: 'Đã bổ sung thông tin cho từ.',
      word: updatedWord,
      enrichedFields: Object.keys(updates)
    });
  } catch (err) {
    console.error('[enrichWord] Error:', err);
    return res.status(500).json({
      error: 'Enrich từ thất bại.',
      detail: err.message
    });
  }
}
