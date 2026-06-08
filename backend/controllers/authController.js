const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');
const { AppError } = require('../utils/errorHandler');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  });
};

const createSendToken = async (user, statusCode, res) => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true
  };
  
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', refreshToken, cookieOptions);

  // Remove password and refreshToken from output
  user.password = undefined;
  user.refreshToken = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.register = asyncWrapper(async (req, res, next) => {
  const { name, username, email, password } = req.body;

  const newUser = await User.create({
    name,
    username,
    email,
    password
  });

  await createSendToken(newUser, 201, res);
});

exports.login = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;

  // 1) Check if email/username and password exist
  if (!username || !password) {
    return next(new AppError('Please provide username and password!', 400));
  }
  
  // 2) Check if user exists && password is correct
  // We can login by username or email
  const user = await User.findOne({ 
    $or: [{ username: username }, { email: username }] 
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect username or password', 401));
  }

  // 3) If everything ok, send token to client
  await createSendToken(user, 200, res);
});

exports.logout = asyncWrapper(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  // Optionally remove the refresh token from DB if user id is known
  // In a real scenario, we'd want the user ID from the request or refresh token
  
  res.status(200).json({ status: 'success' });
});

exports.refresh = asyncWrapper(async (req, res, next) => {
  const refreshToken = req.cookies.jwt;
  
  if (!refreshToken) {
    return next(new AppError('No refresh token provided. Please log in again.', 401));
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  // Find user and check if token matches
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid refresh token. Please log in again.', 401));
  }

  // Issue new tokens
  await createSendToken(user, 200, res);
});
