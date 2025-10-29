// models/Word.js
import mongoose from 'mongoose';

const ExampleSchema = new mongoose.Schema({
  en: { type: String, default: '' },
  vi: { type: String, default: '' },
  source: { type: String, enum: ['user', 'inferred'], default: 'user' } // [Suy luận] -> inferred
}, { _id: false });

const WordSchema = new mongoose.Schema({
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', index: true, required: true },
  word: { type: String, required: true, index: true },
  pos: { type: String, required: true },           // noun/verb/adj...
  meaning_vi: { type: String, required: true },    // nghĩa tiếng Việt
  ipa: { type: String, default: '' },              // khuyến nghị
  note: { type: String, default: '' },             // mẹo nhớ/collocation
  ex1: { type: ExampleSchema, default: () => ({}) },
  ex2: { type: ExampleSchema, default: () => ({}) },
  tags: { type: [String], default: [] },
  sources: {
    meaning_vi: { type: String, enum: ['user', 'inferred'], default: 'user' },
    pos: { type: String, enum: ['user', 'inferred'], default: 'user' },
    ipa: { type: String, enum: ['user', 'inferred'], default: 'user' },
    note: { type: String, enum: ['user', 'inferred'], default: 'user' },
  },
  meta: {
    difficulty: { type: Number, default: 0 },      // 0–2–4 ...
    lastSeenAt: { type: Date },
    createdBy: { type: String, default: 'user' }
  }
}, { timestamps: true });

export default mongoose.model('Word', WordSchema);
