require('dotenv').config();

const app = require('../app');
const connectDB = require('../config/db');
const { ensureRedisConnection } = require('../config/redis');

module.exports = async (req, res) => {
  try {
    await connectDB();
    await ensureRedisConnection();
    return app(req, res);
  } catch (error) {
    console.error('Serverless startup error:', error.message);
    return res.status(500).json({ error: 'Server initialization failed' });
  }
};
