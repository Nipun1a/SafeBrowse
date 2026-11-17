module.exports = {
    thresholds: { suspicious: 25, maliciousEngines: 3, newDomainDays: 30, newCertificateDays: 7,
        longUrlLength: 250, subdomainCount: 4, longRedirectChain: 3, staleReportDays: 7 },
    scores: { malicious: 100, minimumSuspicious: 35, unknown: 50 },
    cacheSeconds: { MALICIOUS: 14400, SUSPICIOUS: 600, NO_KNOWN_THREATS: 3600, UNKNOWN: 30 },
    weights: {
        young_domain: 35, long_url: 10, many_subdomains: 12, idn: 8, mixed_script: 20,
        watch_tld: 8, brand_in_subdomain: 25, http: 12, nonstandard_port: 15,
        new_certificate: 5, tls_hostname_mismatch: 32, tls_invalid: 22,
        non_public_dns: 35, missing_dns: 15, lookalike: 28,
        cross_domain_redirect: 12, long_redirect_chain: 12, vt_flag: 35
    },
    watchTlds: new Set(['zip', 'mov', 'top', 'click', 'work']),
    feed: { maxBytes: 1024 * 1024, maxAgeMs: 86400000, refreshMs: 60000 },
    vt: { perMinute: 4, perDay: 500, requestMs: 2500, totalMs: 8500 }
};
