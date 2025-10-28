// models/Attempt.js
const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true, required: true },
  step: { type: String, required: true },     // QUIZ_PART1/2, SPELLING, FILL
  wordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Word', required: true },
  userAnswer: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);
