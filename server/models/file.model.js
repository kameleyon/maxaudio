const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  size: {
    type: Number,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  duration: {
    type: Number
  },
  tags: [{
    type: String
  }],
  favorite: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transcription: {
    type: String
  },
  tone: String,
  voice: String,
  path: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Add text index for search
fileSchema.index({ title: 'text', tags: 'text' });

const File = mongoose.model('File', fileSchema);

module.exports = File;
