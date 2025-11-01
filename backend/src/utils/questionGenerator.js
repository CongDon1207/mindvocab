// utils/questionGenerator.js
// Deterministic question generator với PRNG từ seed

import Word from '../model/Word.js';
import natural from 'natural';

// Khởi tạo tokenizer để tách câu thành các từ
const tokenizer = new natural.WordTokenizer();

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

// ========== Helper: Tìm và thay thế từ với các dạng biến thể ==========
/**
 * Tìm từ trong câu (kể cả dạng biến thể) và thay thế bằng '_____'
 * @param {string} sentence - Câu ví dụ
 * @param {string} targetWord - Từ gốc cần tìm
 * @returns {{found: boolean, matchedWord: string, clozeSentence: string}} 
 *          - found: true nếu tìm thấy
 *          - matchedWord: Dạng từ thực tế trong câu (e.g., "called")
 *          - clozeSentence: Câu đã được đục lỗ
 */
function findAndReplaceWordVariant(sentence, targetWord) {
  const tokens = tokenizer.tokenize(sentence);
  if (!tokens) {
    return { found: false, matchedWord: targetWord, clozeSentence: sentence };
  }

  const targetLower = targetWord.toLowerCase();

  for (const token of tokens) {
    const tokenLower = token.toLowerCase();

    // 1. So sánh trực tiếp
    if (tokenLower === targetLower) {
      const clozeSentence = sentence.replace(new RegExp(`\\b${token}\\b`, 'i'), '_____');
      return { found: true, matchedWord: token, clozeSentence };
    }

    // 2. Xử lý các phrasal verbs (e.g., "call off")
    // Nếu targetWord là "call off", ta tìm "called off"
    if (targetLower.includes(' ')) {
        const targetParts = targetLower.split(' ');
        const firstPart = targetParts[0]; // "call"
        const rest = targetParts.slice(1).join(' '); // "off"

        // Logic tìm biến thể cho phần đầu của phrasal verb
        const stem1 = tokenLower.endsWith('ed') ? tokenLower.slice(0, -2) : null; // called -> call
        const stem2 = tokenLower.endsWith('ing') ? tokenLower.slice(0, -3) : null; // calling -> call
        const stem3 = tokenLower.endsWith('s') ? tokenLower.slice(0, -1) : null; // calls -> call

        if (stem1 === firstPart || stem2 === firstPart || stem3 === firstPart) {
            // Kiểm tra xem các phần sau có khớp không
            const nextTokens = tokens.slice(tokens.indexOf(token) + 1, tokens.indexOf(token) + 1 + targetParts.length - 1).join(' ');
            if (nextTokens.toLowerCase() === rest) {
                const fullPhrase = `${token} ${nextTokens}`;
                const clozeSentence = sentence.replace(fullPhrase, '_____');
                return { found: true, matchedWord: fullPhrase, clozeSentence };
            }
        }
    }


    // 3. Xử lý các biến thể đơn giản (-s, -ed, -ing)
    const stem_s = tokenLower.endsWith('s') ? tokenLower.slice(0, -1) : null;
    const stem_ed = tokenLower.endsWith('ed') ? tokenLower.slice(0, -2) : null;
    const stem_d = tokenLower.endsWith('d') ? tokenLower.slice(0, -1) : null; // cho các từ kết thúc bằng 'e'
    const stem_ing = tokenLower.endsWith('ing') ? tokenLower.slice(0, -3) : null;

    if (stem_s === targetLower || stem_ed === targetLower || stem_d === targetLower || stem_ing === targetLower) {
        const clozeSentence = sentence.replace(new RegExp(`\\b${token}\\b`, 'i'), '_____');
        return { found: true, matchedWord: token, clozeSentence };
    }
  }

  // Không tìm thấy
  return { found: false, matchedWord: targetWord, clozeSentence: sentence };
}


// ========== Fill Blank: Cloze sentences (10 câu + word bank) ==========
export async function generateFillBlank(session, words) {
  const questions = [];
  const rng = new SeededRandom(session.seed + 3);

  const matchedWords = [];
  const finalQuestions = [];

  for (const word of words) {
    let sentence = null;
    let isInferred = false;

    if (word.ex1?.en) {
      sentence = word.ex1.en;
      isInferred = word.ex1.source === 'inferred';
    } else if (word.ex2?.en) {
      sentence = word.ex2.en;
      isInferred = word.ex2.source === 'inferred';
    }

    let result;
    if (sentence) {
      result = findAndReplaceWordVariant(sentence, word.word);
    } else {
      // Không có câu ví dụ, tự tạo câu placeholder
      const placeholderSentence = `The word is _____.`;
      result = { 
        found: true, 
        matchedWord: word.word, 
        clozeSentence: placeholderSentence.replace('_____', `[${word.meaning_vi}]`) 
      };
      isInferred = true;
      console.warn(`[FILL_BLANK] Word ${word.word} không có ví dụ, dùng placeholder`);
    }
    
    // Nếu không tìm thấy biến thể, thử lại với regex gốc để đảm bảo không bỏ sót
    if (!result.found && sentence) {
        const targetRegex = new RegExp(`\\b${word.word}\\b`, 'gi');
        if(targetRegex.test(sentence)){
            result.found = true;
            result.matchedWord = word.word;
            result.clozeSentence = sentence.replace(targetRegex, '_____');
        }
    }

    matchedWords.push(result.matchedWord);
    finalQuestions.push({
      type: 'FILL',
      wordId: word._id,
      prompt: result.clozeSentence,
      options: [],
      answer: result.matchedWord, // Answer là từ đã match
      bank: [], // Sẽ điền sau
      isInferred,
    });
  }

  // Word bank = tất cả các từ đã match, shuffle deterministic
  const wordBank = rng.shuffle(matchedWords);

  // Gán wordBank cho tất cả câu hỏi
  finalQuestions.forEach(q => {
    q.bank = wordBank;
  });

  return finalQuestions;
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
