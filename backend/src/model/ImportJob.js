// models/ImportJob.js
const mongoose = require('mongoose');

const ImportJobSchema = new mongoose.Schema({
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  filename: { type: String },
  status: { type: String, enum: ['PENDING','PARSING','ENRICHING','SAVING','DONE','FAILED'], default: 'PENDING' },
  report: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('ImportJob', ImportJobSchema);
