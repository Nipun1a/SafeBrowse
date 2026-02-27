const { createClient } = require("redis");

const rawRedisUrl = process.env.REDIS_URL || "";
const sanitizedRedisUrl = rawRedisUrl.replace(/^redis-cli\s+--tls\s+-u\s+/, "").trim();

const redisClient = createClient({
    url: sanitizedRedisUrl,
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

(async () => {
    if (!sanitizedRedisUrl) {
        throw new Error("REDIS_URL is not set");
    }

    await redisClient.connect();
    console.log("Redis Connected");
})();

module.exports = redisClient;
