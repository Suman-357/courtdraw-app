const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  teamA: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  teamB: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  winnerTeamId: {
    type: String, // String ID mapping to the temporary teamId in Session
    required: true
  }
}, {
  timestamps: true
});

matchSchema.index({ sessionId: 1 });
matchSchema.index({ groupId: 1 });

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;
