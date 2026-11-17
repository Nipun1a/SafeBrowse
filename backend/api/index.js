require('dotenv').config({ path: require('node:path').join(__dirname, '../.env'), quiet: true });

const app = require('../app');
if (process.env.VERCEL === '1') app.set('trust proxy', 1);

module.exports = async (req, res) => {
    await require('../config/redis').checkStartup();
    return app(req, res);
};
