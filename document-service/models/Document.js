const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
  pageCount: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);