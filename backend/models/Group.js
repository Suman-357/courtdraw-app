const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A group must have a name'],
    trim: true,
    maxlength: [100, 'A group name must have less or equal than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'A group must have a unique invite code'],
    unique: true,
    uppercase: true,
    minlength: [6, 'Invite code must be at least 6 characters'],
    maxlength: [10, 'Invite code must be at most 10 characters']
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A group must have an admin']
  },
  defaultPenaltyAmount: {
    type: Number,
    default: 5
  },
  settings: {
    tieRule: {
      type: String,
      enum: ['all_pay', 'lowest_wins', 'none'],
      default: 'all_pay'
    },
    defaultCourtCount: {
      type: Number,
      default: 3
    },
    fineAmount: {
      type: Number,
      default: 5
    }
  }
}, {
  timestamps: true
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
