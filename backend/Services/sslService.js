const tls = require('node:tls');

module.exports = (url, dns) => {
    if (url.protocol === 'http:') return Promise.resolve({ status: 'unencrypted' });
    if (dns.status !== 'public' || url.port) return Promise.resolve({ status: 'not_checked' });

    return new Promise(resolve => {
        // Connect to the validated address, while verifying the requested hostname with SNI.
        const socket = tls.connect({
            host: dns.address,
            port: 443,
            servername: url.hostname.replace(/\.$/, ''),
            rejectUnauthorized: true,
            minVersion: 'TLSv1.2'
        });
        const finish = (status, details) => {
            clearTimeout(timer);
            socket.destroy();
            resolve({ status, ...details });
        };
        const timer = setTimeout(() => finish('unknown'), 2000);
        socket.once('secureConnect', () => {
            const certificate = socket.getPeerCertificate?.();
            const ageDays = Math.floor((Date.now() - Date.parse(certificate?.valid_from)) / 86400000);
            finish('valid', { issuer: certificate?.issuer?.O || certificate?.issuer?.CN,
                issuedAt: certificate?.valid_from, ageDays: Number.isFinite(ageDays) ? ageDays : undefined });
        });
        socket.once('error', error => {
            if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID') return finish('hostname_mismatch');
            const certificateError = /CERT|SELF_SIGNED|VERIFY_LEAF|UNABLE_TO_GET_ISSUER/.test(error.code || '');
            finish(certificateError ? 'invalid' : 'unknown');
        });
    });
};
