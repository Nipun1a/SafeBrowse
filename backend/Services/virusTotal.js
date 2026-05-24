const axios = require('axios');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getUnknownResult = (reason) => ({
    malicious: 0,
    harmless: 0,
    suspicious: 0,
    status: 'unknown',
    reason
});

const virusTotalScan = async (url) => {
    try {
        if (!process.env.VIRUSTOTAL_API_KEY) {
            return getUnknownResult('missing_api_key');
        }

        const response = await axios.post(
            'https://www.virustotal.com/api/v3/urls',
            new URLSearchParams({ url }),
            {
                headers: {
                    'x-apikey': process.env.VIRUSTOTAL_API_KEY,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const analysisId = response.data?.data?.id;
        if (!analysisId) {
            return getUnknownResult('analysis_id_missing');
        }

        // Analysis can be queued; poll briefly instead of assuming all-zero safe stats.
        for (let attempt = 0; attempt < 4; attempt += 1) {
            if (attempt > 0) {
                await wait(1500);
            }

            const analysisResponse = await axios.get(
                `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
                {
                    headers: {
                        'x-apikey': process.env.VIRUSTOTAL_API_KEY
                    }
                }
            );

            const attributes = analysisResponse.data?.data?.attributes || {};
            const stats = attributes.stats || {};
            const analysisStatus = attributes.status;

            if (analysisStatus === 'completed') {
                return {
                    malicious: stats.malicious || 0,
                    harmless: stats.harmless || 0,
                    suspicious: stats.suspicious || 0,
                    status: 'completed'
                };
            }
        }

        return getUnknownResult('analysis_timeout');
    } catch (error) {
        console.error('VirusTotal Error:', error.response?.data || error.message);
        return getUnknownResult('request_failed');
    }
};

module.exports = virusTotalScan;
