const { isIP } = require('node:net');

const privateSuffixes = ['localhost', 'local', 'internal', 'home', 'lan', 'onion'];
const invalidFormat = 'Enter a valid HTTP or HTTPS URL without credentials';

function normalizeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) throw new Error('URL is required');

    const input = value.trim();
    const authority = /^https?:\/\/([^/?#]+)/i.exec(input)?.[1];
    if (!authority || authority.includes('@') || input.length > 4096 ||
        /[\s\\\x00-\x1f\x7f]/u.test(input) || !URL.canParse(input)) {
        throw new Error(invalidFormat);
    }

    const parsed = new URL(input);
    const host = parsed.hostname.replace(/\.$/, '');
    const labels = host.split('.');
    if (isIP(host) || host.startsWith('[') || host.length > 253 || labels.length < 2 ||
        privateSuffixes.includes(labels.at(-1)) || host.endsWith('.home.arpa') ||
        labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) {
        throw new Error('Enter a URL with a public domain name. IP literals are blocked.');
    }

    parsed.hash = '';
    return parsed;
}

module.exports = (req, res, next) => {
    try {
        req.scanUrl = normalizeUrl(req.body?.url);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
    next();
};
module.exports.normalizeUrl = normalizeUrl;
