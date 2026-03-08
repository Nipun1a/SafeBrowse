require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { ensureRedisConnection } = require('./config/redis');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
    await connectDB();
    await ensureRedisConnection();

    server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

// handle unhandled promise rejections

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    if (server) {
        server.close(() => process.exit(1));
        return;
    }

    process.exit(1);
});

startServer().catch((error) => {
    console.error('Startup Error:', error.message);
    process.exit(1);
});
