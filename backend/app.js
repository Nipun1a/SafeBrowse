const express = require('express');
const cors = require('cors');

const scanRoutes = require('./Routes/ScanRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', scanRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
