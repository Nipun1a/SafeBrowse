const tls = require('tls');

const checkSSL = (domain) => {
    return new Promise((resolve) => {
        const socket = tls.connect(
            443,
            domain,
            { servername: domain },
            () => {
                const cert = socket.getPeerCertificate();
                if (!cert || Object.keys(cert).length === 0) {
                    resolve({ valid: false });
                } else {
                    resolve({
                        valid: true,
                        validTo: cert.valid_to
                    });
                }
                socket.end();
            }
        );

        socket.on('error', () => {
            resolve({ valid: false });
        });
    });
};

module.exports = checkSSL;