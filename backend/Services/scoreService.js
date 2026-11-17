const { thresholds, scores } = require('../config/risk');

module.exports = (google, vt, reasons = []) => {
    const googleMatch = google.status === 'match';
    const feedMatch = reasons.some(reason => reason.id === 'openphish_match');
    const freshReport = vt.status === 'completed';
    const hasFlags = (vt.malicious || 0) + (vt.suspicious || 0) > 0;
    const googleAnswered = google.status === 'no_match';
    const score = Math.min(99, reasons.reduce((sum, reason) => sum + reason.weight, 0));

    if (googleMatch || feedMatch || vt.malicious >= thresholds.maliciousEngines) {
        return { verdict: 'MALICIOUS', score: scores.malicious, confidence: googleMatch || feedMatch || freshReport ? 'HIGH' : 'MEDIUM' };
    }
    if (hasFlags || ((googleAnswered || freshReport) && score >= thresholds.suspicious)) {
        return { verdict: 'SUSPICIOUS', score: Math.max(score, scores.minimumSuspicious),
            confidence: freshReport || googleAnswered ? 'MEDIUM' : 'LOW' };
    }
    if (!googleAnswered || !freshReport) {
        return { verdict: 'UNKNOWN', score: Math.max(score, scores.unknown),
            confidence: googleAnswered || freshReport ? 'LOW' : 'NONE' };
    }
    return { verdict: 'NO_KNOWN_THREATS', score, confidence: 'HIGH' };
};
