require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// connect to MongoDB first 
connectDB();

//start server

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// handle unhandled promise rejections

process.on('unhandledRejection', (err) => {

    console.error('Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
});

