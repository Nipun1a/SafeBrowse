require('dotenv').config({ path: require('node:path').join(__dirname, '.env'), quiet: true });
const app = require('./app');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
    void require('./config/redis').checkStartup();
    server = app.listen(PORT, error => {
        if (error) {
            console.error('Startup error:', error.code || error.name);
            process.exitCode = 1;
            return;
        }
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

if (require.main === module) {
    startServer().catch((error) => {
        console.error('Startup Error:', error.message);
        process.exit(1);
    });
}

module.exports = app;
