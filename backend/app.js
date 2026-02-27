const express = require('express');
const cors = require('cors');

const scanRoutes = require('./Routes/ScanRoutes');
const limiter = require("./Middleware/rateLimiter");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(limiter);

// Routes
app.use('/api', scanRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
