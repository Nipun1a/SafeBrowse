require('dotenv').config({ path: require('node:path').join(__dirname, '../.env'), quiet: true });
const { readFileSync } = require('node:fs');
const { setTimeout: wait } = require('node:timers/promises');

const [badPath, trancoPath, option] = process.argv.slice(2);
if (!badPath || !trancoPath || (option && option !== '--with-vt')) {
    console.error('Usage: node backend/scripts/evaluate.js OPENPHISH_TXT TRANCO_CSV [--with-vt]');
    process.exit(1);
}
process.env.TRANCO_LIST_PATH = trancoPath;
const { normalizeUrl } = require('../Middleware/validateUrl');
const { scan } = require('../Controllers/ScanController');

function sample(path, toUrl) {
    const unique = new Map();
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
        if (!line.trim() || line.startsWith('#')) continue;
        try {
            const url = normalizeUrl(toUrl(line.trim()));
            unique.set(url.href, url);
            if (unique.size === 100) break;
        } catch {
            // The scanner only accepts public HTTP(S) domain URLs.
        }
    }
    return [...unique.values()];
}

async function main() {
    if (!process.env.GOOGLE_SAFE_BROWSING_API_KEY && !process.env.GOOGLE_WEB_RISK_API_KEY) {
        throw new Error('Google reputation key is required for evaluation');
    }
    const useVirusTotal = option === '--with-vt';
    const bad = sample(badPath, line => line);
    const benign = sample(trancoPath, line => 'https://' + line.split(',').at(-1) + '/');
    if (!bad.length || !benign.length) throw new Error('Both labeled datasets must contain valid URLs');
    const labeled = Array.from({ length: Math.max(bad.length, benign.length) }, (_, index) =>
        [[bad[index], 'bad'], [benign[index], 'popular']].filter(([url]) => url)).flat();
    const counts = { bad: {}, popular: {} };
    const google = { bad: {}, popular: {} };
    const lowerThresholds = [15, 20].map(threshold => ({ threshold, bad: 0, popular: 0 }));
    const increment = (bucket, label) => { bucket[label] = (bucket[label] || 0) + 1; };
    let next = 0;
    async function worker() {
        while (next < labeled.length) {
            const [url, label] = labeled[next++];
            const result = await scan(url, { useVirusTotal, connectToTarget: false, useFeed: false });
            increment(counts[label], result.verdict);
            const { googleSafeBrowsing, googleReason, virusTotal } = result.threatDetails;
            const observed = googleSafeBrowsing === 'no_match' || virusTotal.status === 'completed';
            const totalWeight = result.reasons.reduce((total, reason) => total + reason.weight, 0);
            const detected = ['MALICIOUS', 'SUSPICIOUS'].includes(result.verdict);
            for (const candidate of lowerThresholds) {
                if (detected || (observed && totalWeight >= candidate.threshold)) candidate[label]++;
            }
            increment(google[label], googleReason ? `${googleSafeBrowsing}:${googleReason}` : googleSafeBrowsing);
            if (useVirusTotal && next < labeled.length) await wait(15200);
        }
    }
    await Promise.all(Array.from({ length: useVirusTotal ? 1 : 3 }, worker));

    const positives = outcomes => (outcomes.MALICIOUS || 0) + (outcomes.SUSPICIOUS || 0);
    const rate = (n, d) => +(100 * n / d).toFixed(2);
    console.log(JSON.stringify({
        testedAt: new Date().toISOString(), useVirusTotal, targetConnections: false, openPhishLookup: false,
        sampleSize: { bad: bad.length, popular: benign.length },
        counts, google,
        lowerThresholds: lowerThresholds.map(({ threshold, bad: detected, popular: flagged }) => ({
            threshold,
            falsePositiveRatePercent: rate(flagged, benign.length),
            falseNegativeRatePercent: rate(bad.length - detected, bad.length)
        })),
        falsePositiveRatePercent: rate(positives(counts.popular), benign.length),
        falseNegativeRatePercent: rate(bad.length - positives(counts.bad), bad.length),
        unknownRatePercent: {
            bad: rate(counts.bad.UNKNOWN || 0, bad.length),
            popular: rate(counts.popular.UNKNOWN || 0, benign.length)
        }
    }, null, 2));
}

main().catch(error => {
    console.error('Evaluation failed:', error.code || error.name);
    process.exitCode = 1;
});
