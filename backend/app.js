const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const authRouter = require('./routes/authRoutes');
const groupRouter = require('./routes/groupRoutes');
const sessionRouter = require('./routes/sessionRoutes');
const { errorHandler } = require('./utils/errorHandler');

const app = express();

// 1. GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow any origin
    callback(null, true);
  },
  credentials: true
}));
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 1000, // 1000 requests
  windowMs: 60 * 60 * 1000, // per hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 2. ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/groups', groupRouter);
app.use('/api/v1/sessions', sessionRouter);

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// 3. GLOBAL ERROR HANDLER
app.use(errorHandler);

module.exports = app;
