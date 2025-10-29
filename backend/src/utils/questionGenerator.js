// utils/questionGenerator.js
// Deterministic question generator với PRNG từ seed

import Word from '../model/Word.js';

// ========== PRNG (Pseudo-Random Number Generator) từ seed ==========
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  // Linear Congruential Generator (LCG)
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Trả về integer trong range [min, max)
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min)) + min;
  }

  // Fisher-Yates shuffle deterministic
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

// ========== Helper: Lấy distractor candidates ==========
async function getDistractors(folderId, targetWordId, targetPOS, count = 3) {
  try {
    // Ưu tiên từ cùng POS
    let candidates = await Word.find({
      folderId,
      _id: { $ne: targetWordId },
      pos: targetPOS
    }).limit(count * 2); // Lấy nhiều hơn để có buffer

    // Nếu không đủ, mở rộng ra toàn folder
    if (candidates.length < count) {
      const additional = await Word.find({
        folderId,
        _id: { $ne: targetWordId },
        pos: { $ne: targetPOS }
      }).limit(count * 2);

      candidates = [...candidates, ...additional];
    }

    return candidates;
  } catch (err) {
    console.error('[DISTRACTOR] Error getting distractors:', err);
    return [];
  }
}

// ========== Quiz Part 1: VN → EN (4 choices) ==========
export async function generateQuizP1(session, words) {
  const questions = [];
  const rng = new SeededRandom(session.seed + 1); // offset +1 để khác Quiz P2

  for (const word of words) {
    // Lấy 3 nhiễu
    const distractors = await getDistractors(session.folderId, word._id, word.pos, 3);

    if (distractors.length < 3) {
      console.warn(`[QUIZ_P1] Không đủ distractors cho word ${word.word} (chỉ có ${distractors.length})`);
    }

    // Tạo options: đáp án + 3 nhiễu (hoặc ít hơn nếu không đủ)
    const options = [
      word.word,
      ...distractors.slice(0, 3).map(d => d.word)
    ];

    // Shuffle options deterministic
    const shuffledOptions = rng.shuffle(options);

    questions.push({
      type: 'VN2EN',
      wordId: word._id,
      prompt: word.meaning_vi, // Hiển thị nghĩa tiếng Việt
      options: shuffledOptions,
      answer: word.word,        // Đáp án là từ tiếng Anh
      bank: []
    });
  }

  return questions;
}

// ========== Quiz Part 2: EN → VI (4 choices) ==========
export async function generateQuizP2(session, words) {
  const questions = [];
  const rng = new SeededRandom(session.seed + 2); // offset +2

  for (const word of words) {
    // Lấy 3 nhiễu
    const distractors = await getDistractors(session.folderId, word._id, word.pos, 3);

    if (distractors.length < 3) {
      console.warn(`[QUIZ_P2] Không đủ distractors cho word ${word.word} (chỉ có ${distractors.length})`);
    }

    // Tạo options: đáp án + 3 nhiễu
    const options = [
      word.meaning_vi,
      ...distractors.slice(0, 3).map(d => d.meaning_vi)
    ];

    // Shuffle options deterministic
    const shuffledOptions = rng.shuffle(options);

    questions.push({
      type: 'EN2VI',
      wordId: word._id,
      prompt: word.word,           // Hiển thị từ tiếng Anh
      options: shuffledOptions,
      answer: word.meaning_vi,      // Đáp án là nghĩa tiếng Việt
      bank: []
    });
  }

  return questions;
}

// ========== Fill Blank: Cloze sentences (10 câu + word bank) ==========
export async function generateFillBlank(session, words) {
  const questions = [];
  const rng = new SeededRandom(session.seed + 3); // offset +3

  // Word bank = tất cả 10 từ, shuffle deterministic
  const wordBank = rng.shuffle(words.map(w => w.word));

  for (const word of words) {
    // Ưu tiên ex1, fallback ex2, fallback inferred flag
    let sentence = null;
    let isInferred = false;

    if (word.ex1?.en) {
      sentence = word.ex1.en;
      isInferred = word.ex1.source === 'inferred';
    } else if (word.ex2?.en) {
      sentence = word.ex2.en;
      isInferred = word.ex2.source === 'inferred';
    }

    // Nếu không có ví dụ, tạo câu placeholder
    if (!sentence) {
      sentence = `Use the word ${word.word} in a sentence.`;
      isInferred = true;
      console.warn(`[FILL_BLANK] Word ${word.word} không có ví dụ, dùng placeholder`);
    }

    // Chuyển thành cloze: thay từ target bằng _____
    const targetRegex = new RegExp(`\\b${word.word}\\b`, 'gi');
    const clozeSentence = sentence.replace(targetRegex, '_____');

    questions.push({
      type: 'FILL',
      wordId: word._id,
      prompt: clozeSentence,
      options: [],               // Fill không dùng options
      answer: word.word,
      bank: wordBank,            // Word bank giống nhau cho tất cả câu
      isInferred                 // Flag để frontend hiển thị [Inferred]
    });
  }

  return questions;
}

// ========== Main Generator: Sinh tất cả questions ==========
export async function generateAllQuestions(session, words) {
  try {
    console.log(`[GENERATOR] Generating questions for session ${session._id} (seed: ${session.seed})`);

    // Sinh 3 loại câu hỏi song song
    const [quizP1Questions, quizP2Questions, fillBlankQuestions] = await Promise.all([
      generateQuizP1(session, words),
      generateQuizP2(session, words),
      generateFillBlank(session, words)
    ]);

    console.log(`[GENERATOR] Generated ${quizP1Questions.length} Quiz P1, ${quizP2Questions.length} Quiz P2, ${fillBlankQuestions.length} Fill Blank`);

    return {
      quizP1: quizP1Questions,
      quizP2: quizP2Questions,
      fillBlank: fillBlankQuestions
    };
  } catch (err) {
    console.error('[GENERATOR] Error generating questions:', err);
    throw err;
  }
}
