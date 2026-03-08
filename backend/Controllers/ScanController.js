const ScanResult = require('../Models/ScanResults');
const googleSafeBrowsing = require('../Services/googleSafeBrowsing');
const virusTotalScan = require('../Services/virusTotal');
const calculateScore = require('../Services/scoreService');
const checkSSL = require('../Services/sslService');
const checkDomainAge = require('../Services/domainAgeService');
const redisClient = require('../config/redis');
const connectDB = require('../config/db');

const scanController = async (req, res) => {
    try {
        await connectDB();

        const { url } = req.body;
        const domain = req.domain;

        // 1) Redis cache check
        const cached = await redisClient.get(domain);
        if (cached) {
            return res.status(200).json({
                source: 'redis-cache',
                data: JSON.parse(cached)
            });
        }

        // 2) Mongo cache check
        const existingScan = await ScanResult.findOne({
            domain,
            expiresAt: { $gt: new Date() }
        });

        if (existingScan) {
            return res.status(200).json({
                source: 'cache',
                data: existingScan
            });
        }

        // 3) Run checks in parallel
        const [googleResult, virusTotalResult, sslResult, domainAge] = await Promise.all([
            googleSafeBrowsing(url),
            virusTotalScan(url),
            checkSSL(domain),
            checkDomainAge(domain)
        ]);

        const score = calculateScore(googleResult, virusTotalResult, sslResult, domainAge);

        const newScan = await ScanResult.create({
            url,
            domain,
            score,
            threatDetails: {
                googleSafeBrowsing: googleResult,
                virusTotal: {
                    malicious: virusTotalResult?.malicious || 0,
                    harmless: virusTotalResult?.harmless || 0
                },
                sslValid: !!sslResult?.valid
            },
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        // 4) Save to Redis for 24h
        await redisClient.setEx(domain, 24 * 60 * 60, JSON.stringify(newScan));

        return res.status(200).json({
            source: 'live-scan',
            data: newScan
        });
    } catch (error) {
        console.error('Scan Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = scanController;
