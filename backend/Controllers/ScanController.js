const { getDomain } = require('tldts');
const checkOpenPhish = require('../Services/openPhish');
const checkDomainAge = require('../Services/domainAgeService');
const { collectSignals, trancoStatus } = require('../Services/urlSignals');
const { cacheSeconds, thresholds, scores, feed } = require('../config/risk');
const { createHash } = require('node:crypto');
const ScanResult = require('../Models/ScanResults');
const googleSafeBrowsing = require('../Services/googleSafeBrowsing');
const virusTotalScan = require('../Services/virusTotal');
const calculateScore = require('../Services/scoreService');
const checkSSL = require('../Services/sslService');
const { checkDNS } = require('../Services/dnsService');
const redis = require('../config/redis');
const connectDB = require('../config/db');

const version = 4;
const inFlight = new Map();
const recent = new Map();

async function scan(parsed, { useVirusTotal = true, connectToTarget = true, useFeed = true } = {}) {
    const url = parsed.href;
    const domain = parsed.hostname;
    const host = domain.replace(/\.$/, '');
    const dns = await checkDNS(host);
    const restricted = dns.status === 'non_public';
    const skipped = { status: 'unknown', reason: 'non_public_dns' };
    const [google, virusTotal, ssl, age, openPhish] = await Promise.all([
        restricted ? skipped : googleSafeBrowsing(url),
        restricted ? skipped : useVirusTotal ? virusTotalScan(url, {
            allowSubmission: connectToTarget && dns.status === 'public'
        }) : { status: 'unknown', reason: 'evaluation_disabled' },
        connectToTarget ? checkSSL(parsed, dns) : { status: 'not_checked' },
        dns.status === 'public' ? checkDomainAge(getDomain(host)) : skipped,
        useFeed ? checkOpenPhish(url) : { status: 'disabled' }
    ]);
    const reasons = collectSignals({ url: parsed, google, vt: virusTotal, tls: ssl, dns, age });
    if (openPhish.status === 'match') {
        reasons.push({ id: 'openphish_match', weight: scores.malicious, explanation: 'OpenPhish listed this exact URL.' });
    }
    const result = calculateScore(google, virusTotal, reasons);
    const now = Date.now();
    const vtExpires = virusTotal.status === 'completed' ? +virusTotal.analyzedAt +
        thresholds.staleReportDays * 86400000 : Infinity;
    const feedRefresh = openPhish.status === 'disabled' ? Infinity : now + feed.refreshMs;
    const expiry = Math.min(now + cacheSeconds[result.verdict] * 1000, google.expiresAt ?? Infinity,
        openPhish.expiresAt ?? Infinity, feedRefresh, vtExpires);
    const { redirectChain, finalUrl, ...report } = virusTotal;

    return {
        url, domain, ...result, reasons, scanVersion: version,
        status: 'completed', scannedAt: new Date(now), expiresAt: new Date(expiry),
        threatDetails: {
            googleSafeBrowsing: google.status,
            googleReason: google.reason,
            googleThreatTypes: google.types ?? [],
            googleProvider: google.provider,
            virusTotal: { ...report, redirectCount: redirectChain?.length,
                finalHost: URL.canParse(finalUrl) ? new URL(finalUrl).hostname : undefined },
            sslValid: ssl.status === 'valid',
            sslStatus: ssl.status,
            certificate: ssl,
            dnsStatus: dns.status,
            domainAge: age,
            trancoStatus,
            openPhish
        }
    };
}

function isCurrent(data, url) {
    return data?.scanVersion === version && data.url === url && Date.parse(data.expiresAt) > Date.now();
}

async function readMongo(url) {
    if (!process.env.MONGO_URI) return null;
    let timer;
    try {
        return await Promise.race([
            connectDB().then(() => ScanResult.findOne({
                url, scanVersion: version, expiresAt: { $gt: new Date() }
            }).sort({ expiresAt: -1 }).maxTimeMS(750).lean()),
            new Promise(resolve => { timer = setTimeout(() => resolve(null), 1000); })
        ]);
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

async function loadScan(parsed) {
    const url = parsed.href;
    const key = `scan:v${version}:${createHash('sha256').update(url).digest('hex')}`;
    const serialized = await redis.get(key).catch(() => null);
    if (serialized) {
        try {
            const data = JSON.parse(serialized);
            if (isCurrent(data, url)) return { source: 'redis-cache', data };
        } catch {
            // Refresh a corrupt cache entry.
        }
    }

    const cached = await readMongo(url);
    if (isCurrent(cached, url)) return { source: 'cache', data: cached };

    const data = await scan(parsed);
    const ttl = Math.floor((+data.expiresAt - Date.now()) / 1000);
    if (ttl > 0) {
        await Promise.allSettled([
            redis.setEx(key, ttl, JSON.stringify(data)),
            process.env.MONGO_URI && ScanResult.db.readyState === 1 ? ScanResult.create(data) : undefined
        ]);
    }
    return { source: 'live-scan', data };
}

module.exports = async (req, res) => {
    const parsed = req.scanUrl;
    const url = parsed.href;
    const cached = recent.get(url);
    if (isCurrent(cached, url)) return res.json({ source: 'memory-cache', data: cached });

    try {
        if (!inFlight.has(url)) {
            inFlight.set(url, loadScan(parsed).then(result => {
                recent.delete(url);
                if (recent.size >= 256) recent.delete(recent.keys().next().value);
                if (isCurrent(result.data, url)) recent.set(url, result.data);
                return result;
            }).finally(() => inFlight.delete(url)));
        }
        return res.json(await inFlight.get(url));
    } catch (error) {
        console.error('Scan failed:', error.code || error.name);
        return res.status(500).json({ error: 'Unable to complete the scan' });
    }
};

module.exports.scan = scan;
