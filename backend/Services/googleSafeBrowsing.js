const axios = require('axios');

const googleSafeBrowsing = async (url) => {
    try {
        if (!process.env.GOOGLE_SAFE_BROWSING_API_KEY) {
            return { status: 'unknown', reason: 'missing_api_key' };
        }

        const response = await axios.post(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
            {
                client: {
                    clientId: 'url-scanner',
                    clientVersion: '1.0.0'
                },
                threatInfo: {
                    threatTypes: [
                        'MALWARE',
                        'SOCIAL_ENGINEERING',
                        'UNWANTED_SOFTWARE',
                        'POTENTIALLY_HARMFUL_APPLICATION'
                    ],
                    platformTypes: ['ANY_PLATFORM'],
                    threatEntryTypes: ['URL'],
                    threatEntries: [{ url }]
                }
            }
        );

        if (Array.isArray(response.data.matches) && response.data.matches.length > 0) {
            const hasPhishing = response.data.matches.some((match) => match.threatType === 'SOCIAL_ENGINEERING');
            return {
                status: hasPhishing ? 'phishing' : 'malware',
                matches: response.data.matches.length
            };
        }

        return { status: 'clean', matches: 0 };
    } catch (error) {
        console.error('Google Safe Browsing Error:', error.response?.data || error.message);
        return { status: 'unknown', reason: 'request_failed' };
    }
};

module.exports = googleSafeBrowsing;
