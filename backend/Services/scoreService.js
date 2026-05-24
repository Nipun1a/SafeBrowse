const calculateScore = (googleResult, virusTotalResult, sslResult, domainAge) => {
    let score = 100;

    const googleStatus = googleResult?.status || 'unknown';
    if (googleStatus === 'malware') score -= 70;
    else if (googleStatus === 'phishing') score -= 75;
    else if (googleStatus === 'unknown') score -= 15;

    const vtStatus = virusTotalResult?.status || 'unknown';
    const vtMalicious = virusTotalResult?.malicious || 0;
    const vtSuspicious = virusTotalResult?.suspicious || 0;

    if (vtMalicious > 0) {
        score -= Math.min(45, vtMalicious * 9);
    } else if (vtSuspicious > 0) {
        score -= Math.min(25, vtSuspicious * 5);
    } else if (vtStatus !== 'completed') {
        score -= 12;
    }

    if (!sslResult?.valid) score -= 20;

    const ageInYears = domainAge?.ageInYears;
    if (typeof ageInYears !== 'number' || Number.isNaN(ageInYears)) {
        score -= 8;
    } else if (ageInYears < 1) {
        score -= 20;
    }

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return score;
};

module.exports = calculateScore;
