const calculateScore = (googleResult, virusTotalResult) => {
    let score = 100;

    // Google penalty
    if (googleResult === "malware") {
        score -= 60;
    }

    if (googleResult === "unknown") {
        score -= 10;
    }

    // VirusTotal penalty
    if (virusTotalResult.malicious > 0) {
        score -= virusTotalResult.malicious * 5;
    }

    if (virusTotalResult.suspicious > 0) {
        score -= virusTotalResult.suspicious * 3;
    }

    if (score < 0) score = 0;

    return score;
};

module.exports = calculateScore;