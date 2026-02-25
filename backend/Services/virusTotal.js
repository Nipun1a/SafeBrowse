const axios = require('axios');

const virusTotalScan = async (url) => {
    try {
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

        const analysisId = response.data.data.id;

        // Fetch analysis result
        const analysisResponse = await axios.get(
            `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
            {
                headers: {
                    'x-apikey': process.env.VIRUSTOTAL_API_KEY
                }
            }
        );

        const stats = analysisResponse.data.data.attributes.stats;

        return {
            malicious: stats.malicious,
            harmless: stats.harmless,
            suspicious: stats.suspicious
        };

    } catch (error) {
        console.error("VirusTotal Error:", error.response?.data || error.message);
        return {
            malicious: 0,
            harmless: 0,
            suspicious: 0
        };
    }
};

module.exports = virusTotalScan;