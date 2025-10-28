// models/Session.js
const mongoose = require('mongoose');

const StepEnum = ['FLASHCARDS','QUIZ_PART1','QUIZ_PART2','SPELLING','FILL_BLANK','SUMMARY'];

const QuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['VN2EN','EN2VI','SPELLING','FILL'], required: true },
  wordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Word', required: true },
  prompt: { type: String, required: true },     // meaning_vi hoặc câu có chỗ trống
  options: { type: [String], default: [] },     // A-D cho quiz
  answer: { type: String, required: true },     // đáp án đúng (từ EN hoặc nghĩa VI tùy type)
  bank: { type: [String], default: [] },        // word bank cho FILL
}, { _id:false });

const SessionSchema = new mongoose.Schema({
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  wordIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'Word', required: true }, // lô 10 từ
  step: { type: String, enum: StepEnum, default: 'FLASHCARDS' },
  wrongSet: { type: [mongoose.Schema.Types.ObjectId], ref: 'Word', default: [] },
  reviewNotes: { type: [String], default: [] },
  quizP1: { questions: { type: [QuestionSchema], default: [] }, score: { type: Number, default: 0 } },
  quizP2: { questions: { type: [QuestionSchema], default: [] }, score: { type: Number, default: 0 } },
  spelling: {
    rounds: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    maxRounds: { type: Number, default: 3 }
  },
  fillBlank: { questions: { type: [QuestionSchema], default: [] }, score: { type: Number, default: 0 } },
  seed: { type: Number, default: () => Math.floor(Math.random()*1e9) }, // tái lập ngẫu nhiên
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
