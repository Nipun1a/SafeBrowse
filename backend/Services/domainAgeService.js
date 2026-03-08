let whoisClient;

const loadWhoisClient = async () => {
    if (whoisClient) {
        return whoisClient;
    }

    try {
        whoisClient = require('whois-json');
        return whoisClient;
    } catch (error) {
        if (error.code !== 'ERR_REQUIRE_ESM') {
            throw error;
        }

        const module = await import('whois-json');
        whoisClient = module.default || module;
        return whoisClient;
    }
};

const withTimeout = (promise, timeoutMs) => {
    let timer;
    const timeoutPromise = new Promise((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

const checkDomainAge = async (domain) => {
    try {
        const whois = await loadWhoisClient();
        const data = await withTimeout(whois(domain), 6000);

        if (!data) {
            return { ageInYears: 0 };
        }

        if (!data.creationDate) {
            return { ageInYears: 0 };
        }

        const creationDate = new Date(data.creationDate);
        const now = new Date();
        const ageInYears = (now - creationDate) / (1000 * 60 * 60 * 24 * 365);

        return { ageInYears: Math.floor(ageInYears) };

    } catch (error) {
        console.error('Domain age check failed:', error.message);
        return { ageInYears: 0 };
    }
};

module.exports = checkDomainAge;
