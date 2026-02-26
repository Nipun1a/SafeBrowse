const whois = require('whois-json');

const checkDomainAge = async (domain) => {
    try {
        const data = await whois(domain);

        if (!data.creationDate) {
            return { ageInYears: 0 };
        }

        const creationDate = new Date(data.creationDate);
        const now = new Date();
        const ageInYears = (now - creationDate) / (1000 * 60 * 60 * 24 * 365);

        return { ageInYears: Math.floor(ageInYears) };

    } catch (error) {
        return { ageInYears: 0 };
    }
};

module.exports = checkDomainAge;