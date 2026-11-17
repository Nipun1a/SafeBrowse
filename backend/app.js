const express = require('express');
const cors = require('cors');

const scanRoutes = require('./Routes/ScanRoutes');
const limiter = require("./Middleware/rateLimiter");

const app = express();

// CORS configuration
app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Express 5 + path-to-regexp throws on "*" in app.options().
// app.use(cors(...)) already handles preflight for all routes.

// Middlewares
app.use(express.json({ limit: '32kb' }));


// Routes
app.use('/api', limiter, scanRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
