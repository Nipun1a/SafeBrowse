const axios = require('axios');

const googleSafeBrowsing = async (url) => {
    try {
        const response = await axios.post(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
            {
                client: {
                    clientId: "url-scanner",
                    clientVersion: "1.0.0"
                },
                threatInfo: {
                    threatTypes: [
                        "MALWARE",
                        "SOCIAL_ENGINEERING",
                        "UNWANTED_SOFTWARE",
                        "POTENTIALLY_HARMFUL_APPLICATION"
                    ],
                    platformTypes: ["ANY_PLATFORM"],
                    threatEntryTypes: ["URL"],
                    threatEntries: [{ url }]
                }
            }
        );

        // If matches exist → site is dangerous
        if (response.data.matches) {
            return "malware";
        }

        return "clean";

    } catch (error) {
        console.error("Google Safe Browsing Error:", error.response?.data || error.message);
        return "unknown"; // fail-safe
    }
};

module.exports = googleSafeBrowsing;