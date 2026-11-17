const { readFile, stat } = require('node:fs/promises');
const { normalizeUrl } = require('../Middleware/validateUrl');
const { feed } = require('../config/risk');

let cached;
let nextCheck = 0;

async function load(path) {
    try {
        const info = await stat(path);
        if (info.size > feed.maxBytes) return { status: 'unknown', reason: 'feed_too_large' };
        const expiresAt = info.mtimeMs + feed.maxAgeMs;
        if (expiresAt <= Date.now()) return { status: 'unknown', reason: 'stale_feed' };
        const urls = new Set();
        const lines = (await readFile(path, { encoding: 'utf8', signal: AbortSignal.timeout(1000) })).split(/\r?\n/);
        for (const line of lines) {
            try {
                if (line.trim()) urls.add(normalizeUrl(line).href);
            } catch {
                // Ignore entries outside the scanner's supported URL format.
            }
        }
        if (!urls.size) return { status: 'unknown', reason: 'empty_feed' };
        return { status: 'ready', urls, expiresAt };
    } catch {
        return { status: 'unknown', reason: 'feed_unavailable' };
    }
}

module.exports = async url => {
    const path = process.env.OPENPHISH_FEED_PATH;
    if (!path) return { status: 'disabled' };
    if (cached?.path !== path || Date.now() >= nextCheck) {
        nextCheck = Date.now() + feed.refreshMs;
        cached = { path, result: load(path) };
    }

    const { status, reason, urls, expiresAt } = await cached.result;
    if (status !== 'ready') return { status, reason };
    if (expiresAt <= Date.now()) return { status: 'unknown', reason: 'stale_feed' };
    return { status: urls.has(url) ? 'match' : 'no_match', expiresAt };
};
