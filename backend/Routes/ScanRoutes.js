const virusTotalScan = require('../Services/virusTotal');


// Run both APIs in parallel
const [googleResult, virusTotalResult] = await Promise.all([
    googleSafeBrowsing(url),
    virusTotalScan(url)
]);

// Calculate score
const score = calculateScore(googleResult, virusTotalResult);

// Save
const newScan = await ScanResult.create({
    url,
    domain,
    score,
    threatDetails: {
        googleSafeBrowsing: googleResult,
        virusTotal: virusTotalResult
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
});