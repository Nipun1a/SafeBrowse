const axios = require('axios');
const options = () => ({ timeout: 4000, signal: AbortSignal.timeout(4000), maxRedirects: 0 });

module.exports = async url => {
    const webRiskKey = process.env.GOOGLE_WEB_RISK_API_KEY;
    const legacyKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    if (!webRiskKey && !legacyKey) return { status: 'unknown', reason: 'missing_api_key' };

    try {
        let types;
        let expiresAt;
        if (!legacyKey) {
            const params = new URLSearchParams({ uri: url, key: webRiskKey });
            for (const type of ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE']) {
                params.append('threatTypes', type);
            }
            const { data } = await axios.get('https://webrisk.googleapis.com/v1/uris:search', {
                ...options(), params
            });
            if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
            types = data.threat ? data.threat.threatTypes : [];
            expiresAt = Date.parse(data.threat?.expireTime);
        } else {
            const { data } = await axios.post('https://safebrowsing.googleapis.com/v4/threatMatches:find', {
                client: { clientId: 'safebrowse', clientVersion: '2.0.0' },
                threatInfo: {
                    threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
                    platformTypes: ['ANY_PLATFORM'],
                    threatEntryTypes: ['URL'],
                    threatEntries: [{ url }]
                }
            }, { ...options(), params: { key: legacyKey } });
            if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
            const matches = data.matches === undefined ? [] : data.matches;
            types = matches.map(match => match.threatType);
            expiresAt = Date.now() + Math.min(...matches.map(match => {
                const duration = /^(\d+(?:\.\d+)?)s$/.exec(match.cacheDuration);
                return duration ? Number(duration[1]) * 1000 : 0;
            }));
        }

        if (!Array.isArray(types) || types.some(type => typeof type !== 'string' || !type)) throw new Error();
        const provider = legacyKey ? 'safe_browsing_v4' : 'web_risk';
        if (!types.length) return { status: 'no_match', provider };
        return { status: 'match', types: [...new Set(types)], provider,
            expiresAt: Number.isFinite(expiresAt) ? expiresAt : Date.now() };
    } catch (error) {
        const reason = error.response?.status === 429 ? 'quota_exceeded'
            : ['ECONNABORTED', 'ETIMEDOUT', 'ERR_CANCELED'].includes(error.code) ? 'timeout'
            : error.response ? 'http_error' : 'network_or_invalid_response';
        return { status: 'unknown', reason };
    }
};
