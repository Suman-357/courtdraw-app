const mongoose = require('mongoose');

const playerStatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  sessionsPlayed: {
    type: Number,
    default: 0
  },
  totalWins: {
    type: Number,
    default: 0
  },
  totalLosses: {
    type: Number,
    default: 0
  },
  finesPaid: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Composite index for fast lookups per group per user
playerStatSchema.index({ userId: 1, groupId: 1 }, { unique: true });

const PlayerStat = mongoose.model('PlayerStat', playerStatSchema);
module.exports = PlayerStat;
