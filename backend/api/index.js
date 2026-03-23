require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/database');

let connectionPromise;

module.exports = async (req, res) => {
  try {
    if (!connectionPromise) {
      connectionPromise = connectDB();
    }
    await connectionPromise;

    return app(req, res);
  } catch (error) {
    // Allow retry on next invocation if the first connection attempt failed.
    connectionPromise = undefined;
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
