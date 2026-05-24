const { URL } = require('url');

const validateUrl = (req, res, next) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        const parsedUrl = new URL(url);

        // Allow only http and https
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return res.status(400).json({ error: "Only HTTP and HTTPS URLs are allowed" });
        }

        req.domain = parsedUrl.hostname;
        req.normalizedUrl = parsedUrl.toString();

        next();

    } catch (error) {
        return res.status(400).json({ error: "Invalid URL format" });
    }
};

module.exports = validateUrl;
