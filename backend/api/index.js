require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/database');

let isConnected = false;

module.exports = async (req, res) => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
