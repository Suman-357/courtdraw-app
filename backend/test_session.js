require('dotenv').config();
const mongoose = require('mongoose');
const Session = require('./models/Session');
const User = require('./models/User'); // Load User model

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const sessions = await Session.find({});
    console.log('Success:', sessions);
  } catch(e) {
    console.error('Crash!', e.message, e.stack);
  }
  mongoose.disconnect();
}
run();
