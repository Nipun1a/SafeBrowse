const calculateScore = (googleResult) => {
    let score = 100;

    if (googleResult === "malware") {
        score -= 70;
    }

    if (googleResult === "unknown") {
        score -= 20;
    }

    return score;
};

module.exports = calculateScore;