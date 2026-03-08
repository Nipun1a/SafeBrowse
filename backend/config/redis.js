const { createClient } = require("redis");

const rawRedisUrl = process.env.REDIS_URL || "";
const sanitizedRedisUrl = rawRedisUrl.replace(/^redis-cli\s+--tls\s+-u\s+/, "").trim();

let redisClient = null;

if (sanitizedRedisUrl) {
    try {
        redisClient = createClient({
            url: sanitizedRedisUrl,
        });
    } catch (error) {
        console.error("Redis client init failed:", error.message);
    }
}

let redisConnectPromise;

if (redisClient) {
    redisClient.on("error", (err) => {
        console.error("Redis Error:", err);
    });
}

const ensureRedisConnection = async () => {
    if (!redisClient) {
        return false;
    }

    if (redisClient.isOpen) {
        return true;
    }

    if (!redisConnectPromise) {
        redisConnectPromise = redisClient
            .connect()
            .then(() => {
                console.log("Redis Connected");
                return true;
            })
            .catch((error) => {
                console.error("Redis connection failed:", error.message);
                return false;
            })
            .finally(() => {
                redisConnectPromise = undefined;
            });
    }

    return redisConnectPromise;
};

const get = async (key) => {
    if (!redisClient) {
        return null;
    }

    await ensureRedisConnection();
    if (!redisClient.isOpen) {
        return null;
    }

    try {
        return await redisClient.get(key);
    } catch (error) {
        console.error("Redis get failed:", error.message);
        return null;
    }
};

const setEx = async (key, ttlSeconds, value) => {
    if (!redisClient) {
        return false;
    }

    await ensureRedisConnection();
    if (!redisClient.isOpen) {
        return false;
    }

    try {
        await redisClient.setEx(key, ttlSeconds, value);
        return true;
    } catch (error) {
        console.error("Redis setEx failed:", error.message);
        return false;
    }
};

module.exports = {
    ensureRedisConnection,
    get,
    setEx,
};
