// controllers/sessionController.js
import Session from '../model/Session.js';
import Attempt from '../model/Attempt.js';
import Word from '../model/Word.js';
import Folder from '../model/Folder.js';
import { generateAllQuestions } from '../utils/questionGenerator.js';

const STEP_ORDER = ['FLASHCARDS', 'QUIZ_PART1', 'QUIZ_PART2', 'SPELLING', 'FILL_BLANK', 'SUMMARY'];

// Helper: Lấy danh sách từ unique đã được sort (alphabet + createdAt)
const getUniqueFolderWords = async (folderId) => {
  const allWords = await Word.find({ folderId }).sort({ word: 1, createdAt: 1 });

  const uniqueWordsMap = new Map();
  for (const word of allWords) {
    const key = word.word.toLowerCase().trim();
    if (!uniqueWordsMap.has(key)) {
      uniqueWordsMap.set(key, word);
    }
  }

  return Array.from(uniqueWordsMap.values());
};

// ========== POST /api/sessions - Tạo session mới ==========
export const createSession = async (req, res) => {
  try {
    const { folderId } = req.body;

    if (!folderId) {
      return res.status(400).json({ error: 'folderId là bắt buộc' });
    }

    // Validate folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: 'Không tìm thấy folder' });
    }

    // Idempotency guard: check for recent session (created within last 5 seconds)
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const recentSession = await Session.findOne({
      folderId,
      createdAt: { $gte: fiveSecondsAgo }
    });

    if (recentSession) {
      console.log(`[SESSION] Idempotency guard: returning existing session ${recentSession._id}`);
      return res.status(200).json(recentSession);
    }

    // 1. Get words due for review or new (stage 0)
    const srsWords = await Word.find({
      folderId,
      $or: [
        { "meta.nextReviewDate": { $lte: new Date() } },
        { "meta.stage": { $exists: false } },
        { "meta.stage": 0 }
      ]
    })
      .sort({ "meta.nextReviewDate": 1, "meta.stage": 1, createdAt: 1 })
      .limit(10);

    const selectedWords = [...srsWords];

    // 2. If less than 10, fill with remaining words in folder (starting from oldest lastSeenAt)
    if (selectedWords.length < 10) {
      const existingIds = selectedWords.map(w => w._id);
      const needed = 10 - selectedWords.length;

      const fillWords = await Word.find({
        folderId,
        _id: { $nin: existingIds }
      })
        .sort({ "meta.lastSeenAt": 1, createdAt: 1 })
        .limit(needed);

      selectedWords.push(...fillWords);
    }

    if (selectedWords.length === 0) {
      return res.status(400).json({ error: 'Folder không có từ vựng nào' });
    }

    const wordIds = selectedWords.map(w => w._id);

    // Create session
    const session = new Session({
      folderId,
      wordIds,
      step: 'FLASHCARDS',
      wrongSet: [],
      reviewNotes: [],
      quizP1: { questions: [], score: 0 },
      quizP2: { questions: [], score: 0 },
      spelling: { rounds: 0, correct: 0, maxRounds: 3 },
      fillBlank: { questions: [], score: 0 },
      seed: Math.floor(Math.random() * 1e9)
    });

    await session.save();

    console.log(`[SESSION] Created session ${session._id} with ${wordIds.length} words (seed: ${session.seed})`);

    res.status(201).json(session);
  } catch (err) {
    console.error('[SESSION] Error creating session:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo session', details: err.message });
  }
};

// ========== POST /api/sessions/next - Tạo session 10 từ tiếp theo ==========
export const createNextSession = async (req, res) => {
  try {
    const { previousSessionId } = req.body;

    if (!previousSessionId) {
      return res.status(400).json({ error: 'previousSessionId là bắt buộc' });
    }

    const previousSession = await Session.findById(previousSessionId);
    if (!previousSession) {
      return res.status(404).json({ error: 'Không tìm thấy session trước đó' });
    }

    const folderId = previousSession.folderId;
    const uniqueWords = await getUniqueFolderWords(folderId);

    if (uniqueWords.length === 0) {
      return res.status(400).json({ error: 'Folder không có từ vựng nào' });
    }

    // Map wordId -> index trong danh sách đã sort
    const idToIndex = new Map(
      uniqueWords.map((word, index) => [word._id.toString(), index])
    );

    const previousIndices = previousSession.wordIds
      .map(word => {
        const id = word?._id ? word._id : word;
        return idToIndex.get(id.toString());
      })
      .filter(index => typeof index === 'number');

    if (previousIndices.length === 0) {
      return res.status(400).json({ error: 'Không xác định được vị trí từ trong session trước' });
    }

    const lastIndex = Math.max(...previousIndices);
    const startIndex = lastIndex + 1;

    if (startIndex >= uniqueWords.length) {
      return res.status(400).json({ error: 'Đã học hết từ trong folder này' });
    }

    const nextWords = uniqueWords.slice(startIndex, startIndex + 10);
    const nextWordIds = nextWords.map(word => word._id);

    // Idempotency guard: tránh tạo trùng trong vòng 5 giây
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const existingSession = await Session.findOne({
      folderId,
      createdAt: { $gte: fiveSecondsAgo },
      wordIds: nextWordIds
    });

    if (existingSession) {
      console.log(`[SESSION] Idempotency guard: returning existing next session ${existingSession._id}`);
      return res.status(200).json(existingSession);
    }

    const session = new Session({
      folderId,
      wordIds: nextWordIds,
      step: 'FLASHCARDS',
      wrongSet: [],
      reviewNotes: [],
      quizP1: { questions: [], score: 0 },
      quizP2: { questions: [], score: 0 },
      spelling: { rounds: 0, correct: 0, maxRounds: 3 },
      fillBlank: { questions: [], score: 0 },
      seed: Math.floor(Math.random() * 1e9)
    });

    await session.save();

    console.log(`[SESSION] Created next session ${session._id} với ${nextWordIds.length} từ (bắt đầu từ index ${startIndex})`);

    res.status(201).json(session);
  } catch (err) {
    console.error('[SESSION] Error creating next session:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo session tiếp theo', details: err.message });
  }
};

// ========== GET /api/sessions/:id - Lấy session theo ID ==========
export const getSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate('folderId', 'name description stats')
      .populate('wordIds', 'word pos meaning_vi ipa note ex1 ex2');

    if (!session) {
      return res.status(404).json({ error: 'Không tìm thấy session' });
    }

    // Generate questions nếu chưa có (lazy generation)
    let needsSave = false;

    if (!session.quizP1.questions || session.quizP1.questions.length === 0 ||
      !session.quizP2.questions || session.quizP2.questions.length === 0 ||
      !session.fillBlank.questions || session.fillBlank.questions.length === 0) {

      console.log(`[SESSION] Generating questions for session ${id} (seed: ${session.seed})`);

      const questions = await generateAllQuestions(session, session.wordIds);

      session.quizP1.questions = questions.quizP1;
      session.quizP2.questions = questions.quizP2;
      session.fillBlank.questions = questions.fillBlank;

      needsSave = true;
    }

    // Save nếu có thay đổi
    if (needsSave) {
      await session.save();
      console.log(`[SESSION] Saved generated questions for session ${id}`);
    }

    // Enrich response with folderName and totalWords for frontend header
    const response = {
      ...session.toObject(),
      folderName: session.folderId?.name || 'Unknown Folder',
      totalWords: session.wordIds?.length || 0
    };

    console.log(`[SESSION] Retrieved session ${id} (step: ${session.step}, questions: Q1=${session.quizP1.questions.length}, Q2=${session.quizP2.questions.length}, FB=${session.fillBlank.questions.length})`);

    res.status(200).json(response);
  } catch (err) {
    console.error('[SESSION] Error getting session:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy session', details: err.message });
  }
};

// ========== PUT /api/sessions/:id - Cập nhật session ==========
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ error: 'Không tìm thấy session' });
    }

    const currentStepIndex = STEP_ORDER.indexOf(session.step);

    // Validation: chỉ cho phép tiến bước (không lùi/nhảy)
    if (updates.step) {
      const newStepIndex = STEP_ORDER.indexOf(updates.step);

      if (newStepIndex === -1) {
        return res.status(400).json({ error: `Step không hợp lệ: ${updates.step}` });
      }

      if (newStepIndex < currentStepIndex) {
        return res.status(400).json({
          error: 'Không được phép lùi bước',
          currentStep: session.step,
          requestedStep: updates.step
        });
      }

      if (newStepIndex > currentStepIndex + 1) {
        return res.status(400).json({
          error: 'Không được phép nhảy bước',
          currentStep: session.step,
          requestedStep: updates.step
        });
      }
    }

    // Allow updates to: step, wrongSet, quizP1.score, quizP2.score, spelling, fillBlank.score, reviewNotes
    const allowedFields = [
      'step',
      'wrongSet',
      'reviewNotes',
      'quizP1.score',
      'quizP2.score',
      'spelling.rounds',
      'spelling.correct',
      'fillBlank.score'
    ];

    Object.keys(updates).forEach(key => {
      // Handle wrongSet: merge unique
      if (key === 'wrongSet' && Array.isArray(updates.wrongSet)) {
        const existingWrongSet = session.wrongSet.map(id => id.toString());
        const newWrongSet = updates.wrongSet.map(id => id.toString());
        const mergedSet = Array.from(new Set([...existingWrongSet, ...newWrongSet]));
        session.wrongSet = mergedSet;
      }
      // Handle nested fields (e.g., quizP1.score)
      else if (key.includes('.')) {
        const [parent, child] = key.split('.');
        if (allowedFields.includes(key)) {
          if (!session[parent]) session[parent] = {};
          session[parent][child] = updates[key];
        }
      } else if (allowedFields.includes(key)) {
        session[key] = updates[key];
      }
    });

    await session.save();

    console.log(`[SESSION] Updated session ${id} (step: ${session.step})`);

    res.status(200).json(session);
  } catch (err) {
    console.error('[SESSION] Error updating session:', err);
    res.status(500).json({ error: 'Lỗi server khi cập nhật session', details: err.message });
  }
};

// ========== POST /api/attempts - Ghi log attempt ==========
export const createAttempt = async (req, res) => {
  try {
    const { sessionId, step, wordId, userAnswer, isCorrect } = req.body;

    // Validation
    if (!sessionId || !step || !wordId) {
      return res.status(400).json({
        error: 'sessionId, step, và wordId là bắt buộc'
      });
    }

    // Verify session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Không tìm thấy session' });
    }

    // Verify wordId is in session.wordIds
    const wordIdStr = wordId.toString();
    const isWordInSession = session.wordIds.some(id => id.toString() === wordIdStr);
    if (!isWordInSession) {
      return res.status(400).json({
        error: 'wordId không thuộc session này',
        sessionWordIds: session.wordIds
      });
    }

    // Create attempt
    const attempt = new Attempt({
      sessionId,
      step,
      wordId,
      userAnswer: userAnswer || '',
      isCorrect: isCorrect || false
    });

    await attempt.save();

    console.log(`[ATTEMPT] Created attempt for session ${sessionId}, step ${step}, word ${wordId}, correct: ${isCorrect}`);

    res.status(201).json(attempt);
  } catch (err) {
    console.error('[ATTEMPT] Error creating attempt:', err);
    res.status(500).json({ error: 'Lỗi server khi ghi attempt', details: err.message });
  }
};

// ========== GET /api/sessions/:id/attempts - Lấy attempts của session ==========
export const getSessionAttempts = async (req, res) => {
  try {
    const { id } = req.params;
    const { step } = req.query;

    // Verify session exists
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ error: 'Không tìm thấy session' });
    }

    const query = { sessionId: id };
    if (step) {
      query.step = step;
    }

    const attempts = await Attempt.find(query)
      .populate('wordId', 'word meaning_vi')
      .sort({ createdAt: 1 });

    console.log(`[ATTEMPT] Retrieved ${attempts.length} attempts for session ${id}${step ? ` (step: ${step})` : ''}`);

    res.status(200).json({
      sessionId: id,
      step: step || 'all',
      total: attempts.length,
      attempts
    });
  } catch (err) {
    console.error('[ATTEMPT] Error getting attempts:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy attempts', details: err.message });
  }
};

// ========== POST /api/sessions/:id/complete - Cập nhật mastery sau khi hoàn thành session ==========
export const completeSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id).populate('wordIds');
    if (!session) {
      return res.status(404).json({ error: 'Không tìm thấy session' });
    }

    // Quy tắc mastery: Đạt ≥80% tổng quiz và không có trong wrongSet
    const totalQuizQuestions = 20; // P1 + P2
    const totalQuizScore = session.quizP1.score + session.quizP2.score;
    const quizPercentage = (totalQuizScore / totalQuizQuestions) * 100;

    let masteredCount = 0;

    // SRS Intervals (in days)
    const SRS_INTERVALS = [0, 3, 7, 14, 30, 90];

    // Lặp qua tất cả words trong session
    for (const wordObj of session.wordIds) {
      const word = await Word.findById(wordObj._id || wordObj);
      if (!word) continue;

      // Cập nhật tình trạng chung
      word.meta.lastSeenAt = new Date();

      const isInWrongSet = session.wrongSet.some(wId => wId.toString() === word._id.toString());

      if (isInWrongSet) {
        // Nếu sai: Giảm stage và đặt lịch review ngay lập tức
        word.meta.difficulty = Math.min(word.meta.difficulty + 1, 4);
        word.meta.stage = Math.max(0, word.meta.stage - 1);
        word.meta.nextReviewDate = new Date(); // Review ASAP
      } else {
        // Nếu đúng: Tăng stage và tính ngày review tiếp theo
        word.meta.difficulty = Math.max(word.meta.difficulty - 1, 0);
        word.meta.stage = Math.min(5, word.meta.stage + 1);

        const daysToAdd = SRS_INTERVALS[word.meta.stage] || 3;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        word.meta.nextReviewDate = nextDate;
      }

      await word.save();
    }

    // Đếm số từ mastered: ≥80% quiz và không trong wrongSet
    if (quizPercentage >= 80) {
      const wrongSetIds = session.wrongSet.map(id => id.toString());
      for (const wordObj of session.wordIds) {
        const wordId = (wordObj._id || wordObj).toString();
        if (!wrongSetIds.includes(wordId)) {
          masteredCount++;
        }
      }
    }

    // Cập nhật folder stats dựa trên dữ liệu thực tế trong DB
    const folder = await Folder.findById(session.folderId);
    if (folder) {
      const totalWordsCount = await Word.countDocuments({ folderId: session.folderId });
      // "Đã thuộc" được tính là những từ đã từng xuất hiện trong session học (có lastSeenAt)
      const learnedWordsCount = await Word.countDocuments({
        folderId: session.folderId,
        "meta.lastSeenAt": { $ne: null }
      });

      folder.stats.totalWords = totalWordsCount;
      folder.stats.mastered = learnedWordsCount;
      await folder.save();

      console.log(`[SESSION] Updated folder ${folder._id} stats: ${learnedWordsCount}/${totalWordsCount}`);
    }

    console.log(`[SESSION] Completed session ${id}: mastered ${masteredCount}/${session.wordIds.length} words`);

    res.status(200).json({
      message: 'Mastery updated successfully',
      masteredCount,
      totalWords: session.wordIds.length,
      quizPercentage: Math.round(quizPercentage)
    });
  } catch (err) {
    console.error('[SESSION] Error completing session:', err);
    res.status(500).json({ error: 'Lỗi server khi cập nhật mastery', details: err.message });
  }
};
