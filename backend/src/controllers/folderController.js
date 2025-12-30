// src/controllers/folderController.js
import Folder from '../model/Folder.js';
import Word from '../model/Word.js';

/**
 * Tạo thư mục mới
 * Body: { name: string, description?: string }
 */
export async function createFolder(req, res) {
  try {
    const name = (req.body?.name || '').trim();
    const description = (req.body?.description || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'Tên thư mục (name) là bắt buộc.' });
    }

    const doc = await Folder.create({ name, description });
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(500).json({
      error: 'Tạo thư mục thất bại.',
      detail: err.message,
    });
  }
}

/**
 * Lấy danh sách thư mục (mới nhất trước)
 */
export async function listFolders(_req, res) {
  try {
    const docs = await Folder.find().sort({ createdAt: -1 });

    // Đếm số từ cho mỗi folder
    const foldersWithStats = await Promise.all(
      docs.map(async (folder) => {
        const totalWords = await Word.countDocuments({ folderId: folder._id });
        const mastered = await Word.countDocuments({
          folderId: folder._id,
          "meta.lastSeenAt": { $ne: null }
        });
        return {
          ...folder.toObject(),
          stats: {
            totalWords,
            mastered
          }
        };
      })
    );

    return res.json(foldersWithStats);
  } catch (err) {
    return res.status(500).json({
      error: 'Không lấy được danh sách thư mục.',
      detail: err.message,
    });
  }
}

/**
 * Lấy chi tiết 1 thư mục theo id (bao gồm stats.totalWords)
 * Param: :id
 */
export async function getFolderById(req, res) {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Không tìm thấy thư mục.' });
    }

    // Đếm số từ vựng trong folder
    const totalWords = await Word.countDocuments({ folderId: folder._id });
    const mastered = await Word.countDocuments({
      folderId: folder._id,
      "meta.lastSeenAt": { $ne: null }
    });

    // Trả về folder + stats
    return res.json({
      ...folder.toObject(),
      stats: {
        totalWords,
        mastered
      }
    });
  } catch (err) {
    return res.status(400).json({
      error: 'ID không hợp lệ hoặc truy vấn lỗi.',
      detail: err.message,
    });
  }
}

export async function updateFolder(req, res) {
  try {
    const id = req.params.id;
    const name = (req.body?.name || '').trim();
    const description = (req.body?.description || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'Tên thư mục (name) là bắt buộc.' });
    }

    const updatedFolder = await Folder.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!updatedFolder) {
      return res.status(404).json({ error: 'Không tìm thấy thư mục để cập nhật.' });
    }
    return res.json(updatedFolder);
  } catch (error) {
    return res.status(500).json({
      error: 'Cập nhật thư mục thất bại.',
      detail: error.message,
    });
  }
}
/**
 * Xóa thư mục theo id
 * Param: :id
 */
export async function deleteFolder(req, res) {
  try {
    const deletedFolder = await Folder.findByIdAndDelete(req.params.id);
    if (!deletedFolder) {
      return res.status(404).json({ error: 'Không tìm thấy thư mục để xóa.' });
    }
    return res.json({ message: 'Thư mục đã được xóa thành công.' });
  } catch (err) {
    return res.status(400).json({
      error: 'ID không hợp lệ hoặc xóa thất bại.',
      detail: err.message,
    });
  }
}
/**
 * Lấy thống kê chi tiết của một folder (SRS distribution và Review forecast)
 * Param: :id
 */
export async function getFolderStats(req, res) {
  try {
    const folderId = req.params.id;
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: 'Không tìm thấy thư mục.' });
    }

    const words = await Word.find({ folderId });
    const now = new Date();

    // 1. Phân bố theo Stage (0-5)
    const stageDistribution = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };

    // 2. Dự báo lịch ôn (Forecast)
    const forecast = {
      overdue: 0,
      today: 0,
      tomorrow: 0,
      next3Days: 0,
      nextWeek: 0,
      later: 0
    };

    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setHours(24, 0, 0, 0);

    const in3Days = new Date(now);
    in3Days.setDate(now.getDate() + 3);
    in3Days.setHours(24, 0, 0, 0);

    const in7Days = new Date(now);
    in7Days.setDate(now.getDate() + 7);
    in7Days.setHours(24, 0, 0, 0);

    for (const word of words) {
      // Đếm stage
      const stage = word.meta?.stage || 0;
      stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;

      // Tính forecast (chỉ dành cho từ đã bắt đầu học - stage > 0)
      if (stage > 0 && word.meta?.nextReviewDate) {
        const nextReview = new Date(word.meta.nextReviewDate);

        if (nextReview < now) {
          forecast.overdue++;
        } else if (nextReview < tomorrow) {
          forecast.today++;
        } else if (nextReview < dayAfterTomorrow) {
          forecast.tomorrow++;
        } else if (nextReview < in3Days) {
          forecast.next3Days++;
        } else if (nextReview < in7Days) {
          forecast.nextWeek++;
        } else {
          forecast.later++;
        }
      }
    }

    return res.json({
      folderName: folder.name,
      totalWords: words.length,
      stageDistribution,
      forecast
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Lấy thống kê thất bại.',
      detail: err.message
    });
  }
}
/**
 * Lấy dữ liệu tổng quan cho dashboard ôn tập (tất cả folder)
 */
/**
 * Lấy dữ liệu Dashboard cho các Folder đã thuộc 100%
 * Phân loại theo thời gian cần ôn lại (Retention Intervals)
 */
export async function getReviewDashboard(req, res) {
  try {
    const folders = await Folder.find().lean();
    const words = await Word.find().select('folderId meta.lastSeenAt meta.nextReviewDate').lean();

    // 1. Group words by folder
    const folderWords = {};
    words.forEach(w => {
      const fId = w.folderId.toString();
      if (!folderWords[fId]) folderWords[fId] = [];
      folderWords[fId].push(w);
    });

    // 2. Identify 100% mastered folders and calculate min interval
    const retentionData = [];
    const now = new Date();

    folders.forEach(folder => {
      const fId = folder._id.toString();
      const fWords = folderWords[fId] || [];
      const total = fWords.length;

      if (total === 0) return;

      const mastered = fWords.filter(w => w.meta && w.meta.lastSeenAt).length;

      // Chỉ lấy folder đã thuộc 100%
      if (mastered === total) {
        // Tìm ngày review sớm nhất của folder này
        // Nếu không có nextReviewDate (hiếm), mặc định là now
        let earliestReview = null;

        fWords.forEach(w => {
          if (w.meta && w.meta.nextReviewDate) {
            const date = new Date(w.meta.nextReviewDate);
            if (!earliestReview || date < earliestReview) {
              earliestReview = date;
            }
          }
        });

        if (!earliestReview) earliestReview = now;

        // Tính khoảng cách ngày (Gap)
        const diffMs = earliestReview - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // Có thể âm nếu overdue

        let category = '';
        if (diffDays <= 0) category = 'overdue';
        else if (diffDays <= 3) category = '3days';
        else if (diffDays <= 7) category = '7days';
        else if (diffDays <= 14) category = '14days';
        else if (diffDays <= 30) category = '30days';
        else category = 'safe';

        retentionData.push({
          folderId: folder._id,
          folderName: folder.name,
          totalWords: total,
          earliestReview,
          diffDays,
          category
        });
      }
    });

    // 3. Sort by urgency (overdue first, then nearest future date)
    retentionData.sort((a, b) => a.diffDays - b.diffDays);

    return res.json(retentionData);

  } catch (err) {
    return res.status(500).json({
      error: 'Lấy dashboard ôn tập thất bại.',
      detail: err.message
    });
  }
}
