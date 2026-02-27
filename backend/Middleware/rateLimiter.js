const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: { error: "Too many requests, please try again later."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable
});

module.exports = limiter;