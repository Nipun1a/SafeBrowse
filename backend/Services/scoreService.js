const calculateScore = (googleResult, virusTotalResult, sslResult, domainAge) => {
    let score = 100;

    if (googleResult === 'malware') score -= 60;

    if ((virusTotalResult?.malicious || 0) > 0) {
        score -= virusTotalResult.malicious * 5;
    }

    if (!sslResult?.valid) score -= 15;

    if ((domainAge?.ageInYears || 0) < 1) score -= 20;

    if (score < 0) score = 0;

    return score;
};

module.exports = calculateScore;
