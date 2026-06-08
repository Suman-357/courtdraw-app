const crypto = require('crypto');
const Group = require('../models/Group');
const User = require('../models/User');
const PlayerStat = require('../models/PlayerStat');
const asyncWrapper = require('../utils/asyncWrapper');
const { AppError } = require('../utils/errorHandler');

exports.createGroup = asyncWrapper(async (req, res, next) => {
  const { name } = req.body;
  
  // Generate random 6-char code
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();

  const newGroup = await Group.create({
    name,
    code,
    adminId: req.user._id
  });

  // Update user's groupId and set role to superadmin or admin
  await User.findByIdAndUpdate(req.user._id, { 
    groupId: newGroup._id,
    role: 'superadmin' 
  });

  res.status(201).json({
    status: 'success',
    data: {
      group: newGroup
    }
  });
});

exports.joinGroup = asyncWrapper(async (req, res, next) => {
  const { code } = req.body;

  const group = await Group.findOne({ code: code.toUpperCase() });
  
  if (!group) {
    return next(new AppError('Invalid invite code.', 404));
  }

  const user = await User.findByIdAndUpdate(req.user._id, {
    groupId: group._id,
    role: 'member'
  }, { new: true });

  res.status(200).json({
    status: 'success',
    data: {
      group,
      user
    }
  });
});

exports.getGroup = asyncWrapper(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  
  if (!group) {
    return next(new AppError('No group found with that ID', 404));
  }

  // Find all members in this group
  const members = await User.find({ groupId: group._id }).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      group,
      members
    }
  });
});

exports.addMemberManually = asyncWrapper(async (req, res, next) => {
  const { name, username, password, isGuest } = req.body;
  
  const newMember = await User.create({
    name,
    username,
    password: password || 'defaultPass123',
    email: `${username.replace(/\s+/g, '').toLowerCase()}@temp.com`,
    groupId: req.params.id,
    role: 'member',
    isActive: true,
    isGuest: isGuest || false
  });

  res.status(201).json({
    status: 'success',
    data: {
      member: newMember
    }
  });
});

exports.toggleMemberStatus = asyncWrapper(async (req, res, next) => {
  const { memberId } = req.params;

  const member = await User.findById(memberId);
  if (!member) {
    return next(new AppError('No member found with that ID', 404));
  }

  member.isActive = !member.isActive;
  await member.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      member
    }
  });
});

exports.updateGroupSettings = asyncWrapper(async (req, res, next) => {
  const { defaultPenaltyAmount } = req.body;
  
  const group = await Group.findByIdAndUpdate(req.params.id, {
    defaultPenaltyAmount
  }, { new: true, runValidators: true });

  if (!group) {
    return next(new AppError('No group found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      group
    }
  });
});

exports.getGroupLedger = asyncWrapper(async (req, res, next) => {
  const stats = await PlayerStat.find({ groupId: req.params.id })
    .populate('userId', 'name username isActive')
    .sort('-finesPaid');
    
  res.status(200).json({
    status: 'success',
    data: {
      ledger: stats
    }
  });
});
