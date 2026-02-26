const ScanResult = require('../Models/ScanResults');
const googleSafeBrowsing = require('../Services/googleSafeBrowsing');
const virusTotalScan = require('../Services/virusTotal');
const calculateScore = require('../Services/scoreService');

const scanController = async (req, res) => {
    try {
        const { url } = req.body;
        const domain = req.domain;

        // Check if already scanned and not expired
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

        // Run scanners in parallel
        const [googleResult, virusTotalResult] = await Promise.all([
            googleSafeBrowsing(url),
            virusTotalScan(url)
        ]);

        // Calculate score
        const score = calculateScore(googleResult, virusTotalResult);

        // Save result to database
        const newScan = await ScanResult.create({
            url,
            domain,
            score,
            threatDetails: {
                googleSafeBrowsing: googleResult,
                virusTotal: {
                    malicious: virusTotalResult.malicious || 0,
                    harmless: virusTotalResult.harmless || 0
                }
            },
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        // Send response
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
