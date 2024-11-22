const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  current: {
    charactersUsed: {
      type: Number,
      default: 0
    },
    requestsThisMinute: {
      type: Number,
      default: 0
    },
    voiceClones: {
      type: Number,
      default: 0
    }
  },
  history: [{
    date: {
      type: Date,
      required: true
    },
    requests: {
      type: Number,
      default: 0
    },
    storage: {
      type: Number,
      default: 0
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create TTL index on lastUpdated field to automatically remove old usage records
usageSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // 30 days

const Usage = mongoose.model('Usage', usageSchema);

module.exports = {
  Usage
};
