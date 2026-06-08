const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  presentPlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  courtCount: {
    type: Number,
    default: 3
  },
  teams: [{
    teamId: String,
    players: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    wins: {
      type: Number,
      default: 0
    }
  }],
  matchups: [{
    matchId: String,
    teamA: String, // teamId reference
    teamB: String, // teamId reference
    winnerTeamId: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'pending'
    },
    courtNumber: {
      type: Number,
      default: null
    }
  }],
  fines: [{
    teamId: String,
    players: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    amount: Number,
    reason: String
  }]
}, {
  timestamps: true
});

sessionSchema.index({ groupId: 1, status: 1 });

sessionSchema.pre(/^find/, function() {
  this.populate({
    path: 'presentPlayers teams.players fines.players',
    select: 'name username _id'
  });
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
