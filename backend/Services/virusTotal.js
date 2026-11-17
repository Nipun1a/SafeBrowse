const axios = require('axios');
const { setTimeout: wait } = require('node:timers/promises');
const reserveQuota = require('./vtQuota');
const { vt, thresholds } = require('../config/risk');

const urlId = url => Buffer.from(url).toString('base64url');

function report(stats, timestamp, attributes = {}) {
    const { malicious, suspicious, harmless, undetected } = stats || {};
    if (![malicious, suspicious, harmless, undetected].every(count => Number.isSafeInteger(count) && count >= 0) ||
        malicious + suspicious + harmless === 0) return { status: 'unknown', reason: 'no_engine_verdicts' };

    const date = new Date(timestamp * 1000);
    const ageMs = Date.now() - +date;
    const stale = !Number.isFinite(ageMs) || ageMs < -60000 || ageMs >= thresholds.staleReportDays * 86400000;
    return {
        status: stale ? 'stale' : 'completed', reason: stale ? 'stale_report' : undefined,
        malicious, suspicious, harmless, undetected, analyzedAt: Number.isFinite(+date) ? date : undefined,
        categories: attributes.categories, reputation: attributes.reputation,
        finalUrl: attributes.last_final_url, redirectChain: attributes.redirection_chain
    };
}

async function virusTotalScan(url, { allowSubmission = true } = {}) {
    const key = process.env.VIRUSTOTAL_API_KEY;
    if (!key) return { status: 'unknown', reason: 'missing_api_key' };

    const root = 'https://www.virustotal.com/api/v3';
    const signal = AbortSignal.timeout(vt.totalMs);
    let submitted = false;
    const request = async (path, data) => {
        if (signal.aborted) throw Object.assign(new Error(), { code: 'ETIMEDOUT' });
        if (!await reserveQuota(key)) throw Object.assign(new Error(), { code: 'LOCAL_QUOTA' });

        const options = { headers: { 'x-apikey': key }, timeout: vt.requestMs, signal, maxRedirects: 0 };
        const response = data ? await axios.post(root + path, data, options) : await axios.get(root + path, options);
        return response.data?.data;
    };

    try {
        try {
            const { attributes } = (await request('/urls/' + urlId(url))) || {};
            return report(attributes?.last_analysis_stats, attributes?.last_analysis_date, attributes);
        } catch (error) {
            if (error.response?.status !== 404) throw error;
        }
        if (!allowSubmission || process.env.VIRUSTOTAL_SUBMIT_UNKNOWN === 'false') {
            return { status: 'unknown', reason: 'no_report' };
        }
        const submission = await request('/urls', new URLSearchParams({ url }));
        submitted = true;
        if (typeof submission?.id !== 'string' || !submission.id) {
            return { status: 'pending', reason: 'analysis_id_missing' };
        }

        for (const delay of [400, 800, 1600, 2000]) {
            await wait(delay, undefined, { signal });
            const { attributes } = (await request('/analyses/' + encodeURIComponent(submission.id))) || {};
            if (attributes?.status === 'completed') {
                return report(attributes.stats, attributes.date ?? Math.floor(Date.now() / 1000));
            }
        }
        return { status: 'pending', reason: 'analysis_pending' };
    } catch (error) {
        const response = error.response?.status;
        const reason = response === 429 || error.code === 'LOCAL_QUOTA' ? 'quota_exceeded'
            : signal.aborted || ['ECONNABORTED', 'ETIMEDOUT', 'ERR_CANCELED'].includes(error.code) ? 'timeout'
            : response ? 'http_error' : 'network_error';
        return { status: submitted ? 'pending' : 'unknown', reason };
    }
}

module.exports = virusTotalScan;
module.exports.urlId = urlId;
