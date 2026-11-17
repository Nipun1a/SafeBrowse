const axios = require('axios');
const { thresholds } = require('../config/risk');

let registry;
let registryExpires = 0;
const cache = new Map();
const options = () => ({ signal: AbortSignal.timeout(1800), maxRedirects: 0, maxContentLength: 1024 * 1024 });

async function getServices() {
    if (!registry || Date.now() >= registryExpires) {
        registryExpires = Date.now() + 86400000;
        registry = axios.get('https://data.iana.org/rdap/dns.json', options())
            .then(response => response.data.services)
            .catch(error => {
                registryExpires = Date.now() + 30000;
                throw error;
            });
    }
    return registry;
}

async function lookup(domain) {
    try {
        const services = await getServices();
        const tld = domain.split('.').at(-1);
        const entry = services.find(([suffixes]) => suffixes.includes(tld));
        const base = entry?.[1].find(url => url.startsWith('https://'));
        if (!base) return { status: 'unknown', reason: 'registry_unavailable' };
        const { data } = await axios.get(new URL('domain/' + domain, base.replace(/\/?$/, '/')).href, options());
        const registration = data.events?.find(event => event.eventAction === 'registration');
        const ageDays = Math.floor((Date.now() - Date.parse(registration?.eventDate)) / 86400000);
        if (!Number.isFinite(ageDays) || ageDays < 0) return { status: 'unknown', reason: 'missing_registration' };
        return { status: 'available', ageDays, registeredAt: registration.eventDate,
            young: ageDays < thresholds.newDomainDays };
    } catch {
        return { status: 'unknown', reason: 'rdap_unavailable' };
    }
}

module.exports = domain => {
    if (!domain) return Promise.resolve({ status: 'unknown', reason: 'no_registered_domain' });
    const hit = cache.get(domain);
    if (hit && hit.expires > Date.now()) return hit.result;
    if (cache.size >= 256) cache.delete(cache.keys().next().value);

    const entry = { expires: Date.now() + 30000 };
    entry.result = lookup(domain).then(result => {
        if (result.status === 'available') entry.expires = Date.now() + 3600000;
        return result;
    });
    cache.set(domain, entry);
    return entry.result;
};
