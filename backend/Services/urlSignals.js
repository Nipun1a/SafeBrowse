const { readFileSync } = require('node:fs');
const { domainToUnicode } = require('node:url');
const { parse, getDomain } = require('tldts');
const { thresholds, weights, watchTlds, scores } = require('../config/risk');

const topDomains = new Set();
const trancoPath = process.env.TRANCO_LIST_PATH;
if (trancoPath) {
    try {
        for (const line of readFileSync(trancoPath, 'utf8').split(/\r?\n/, 1001)) {
            const domain = line.split(',').at(-1)?.trim().toLowerCase();
            if (domain && /^[-.a-z0-9]+$/.test(domain)) topDomains.add(domain);
        }
    } catch {
        console.warn('[Scanner] Tranco list unavailable');
    }
}

const brands = new Map();
for (const domain of topDomains) {
    const { domainWithoutSuffix: label, publicSuffix } = parse(domain);
    if (label?.length >= 5 && !brands.has(label)) brands.set(label, { domain, publicSuffix });
}

function differsByOne(a, b) {
    if (Math.abs(a.length - b.length) > 1 || a === b) return false;
    if (a.length > b.length) [a, b] = [b, a];
    let offset = 0;
    while (a[offset] === b[offset]) offset++;
    if (a.length < b.length) return a.slice(offset) === b.slice(offset + 1);
    return a.slice(offset + 1) === b.slice(offset + 1) ||
        (a[offset] === b[offset + 1] && a[offset + 1] === b[offset] &&
            a.slice(offset + 2) === b.slice(offset + 2));
}

function collectSignals({ url, tls, dns, age, vt, google }) {
    const reasons = [];
    const add = (id, explanation, weight = weights[id]) => reasons.push({ id, explanation, weight });
    const host = parse(url.hostname, { allowPrivateDomains: true });
    const domain = host.domain;
    const labels = host.subdomain?.split('.') || [];
    const tld = url.hostname.split('.').at(-1);

    if (url.href.length > thresholds.longUrlLength) add('long_url', 'The URL is unusually long.');
    if (labels.length >= thresholds.subdomainCount) add('many_subdomains', 'The hostname has several subdomains.');
    if (url.protocol !== 'https:') add('http', 'The submitted URL uses unencrypted HTTP.');
    if (url.port) add('nonstandard_port', 'The submitted URL uses a non-standard port.');
    if (watchTlds.has(tld)) add('watch_tld', 'The domain ends in a suffix on the heuristic watch list.');
    if (url.hostname.includes('xn--')) {
        add('idn', 'The hostname contains an internationalized label. Check its spelling.');
        const mixed = domainToUnicode(url.hostname).split('.').some(label =>
            /\p{Script=Latin}/u.test(label) && /[\p{Script=Cyrillic}\p{Script=Greek}]/u.test(label));
        if (mixed) add('mixed_script', 'A hostname label mixes Latin and Greek or Cyrillic characters.');
    }

    if (domain && !topDomains.has(domain)) {
        const brand = labels.flatMap(label => label.split('-')).find(label => brands.has(label));
        if (brand) add('brand_in_subdomain', `A subdomain references ${brands.get(brand).domain} on a different domain.`);
        const nearby = host.domainWithoutSuffix && [...brands].find(([label, popular]) =>
            popular.publicSuffix === host.publicSuffix && differsByOne(host.domainWithoutSuffix, label));
        if (nearby) add('lookalike', `The registered name is one edit away from ${nearby[1].domain}.`);
    }

    if (age.young) add('young_domain', `RDAP reports that the domain was registered ${age.ageDays} day(s) ago.`);
    if (tls.ageDays >= 0 && tls.ageDays < thresholds.newCertificateDays) {
        add('new_certificate', `The certificate was issued ${tls.ageDays} day(s) ago.`);
    }
    if (tls.status === 'hostname_mismatch') add('tls_hostname_mismatch', 'The HTTPS certificate did not match the hostname.');
    else if (tls.status === 'invalid') add('tls_invalid', 'The HTTPS certificate failed trust validation.');
    if (dns.status === 'non_public') add('non_public_dns', 'DNS returned a restricted address.');
    if (dns.status === 'not_found') add('missing_dns', 'DNS did not return address records.');

    if (vt.status === 'completed') {
        const final = URL.canParse(vt.finalUrl) ? getDomain(new URL(vt.finalUrl).hostname, { allowPrivateDomains: true }) : null;
        if (final && domain && final !== domain) add('cross_domain_redirect', 'VirusTotal observed a redirect to another registered domain.');
        if (Array.isArray(vt.redirectChain) && vt.redirectChain.length >= thresholds.longRedirectChain) {
            add('long_redirect_chain', 'VirusTotal observed several redirects.');
        }
    }
    if (vt.malicious || vt.suspicious) {
        add('vt_flag', `VirusTotal reported ${vt.malicious} malicious and ${vt.suspicious} suspicious engine result(s).`);
    }
    if (google.status === 'match') add('google_match', `Google reported ${google.types.join(', ')}.`, scores.malicious);
    return reasons;
}

module.exports = { collectSignals, trancoStatus: topDomains.size ? 'available' : 'unavailable' };
