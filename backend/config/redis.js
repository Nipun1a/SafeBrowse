const { createClient } = require('redis');

const url = (process.env.REDIS_URL || '').replace(/^redis-cli\s+--tls\s+-u\s+/, '').trim();
const connectMs = Math.max(250, Math.min(10000, Number(process.env.REDIS_CONNECT_TIMEOUT_MS) || 2500));
let client;
let configError;
let connecting;
let failures = 0;
let retryAt = 0;
let lastError;

function errorCode(error) {
    return error.code || (error.message === 'Connection timeout' ? 'connection_timeout' : error.name);
}

if (url) {
    try {
        client = createClient({ url, disableOfflineQueue: true,
            socket: { connectTimeout: connectMs, reconnectStrategy: false } });
        client.on('error', error => { lastError = errorCode(error); });
    } catch {
        configError = 'invalid_url';
    }
}

async function ensureRedisConnection() {
    if (!client || Date.now() < retryAt) return false;
    if (client.isReady) return true;
    if (!connecting) {
        const timer = setTimeout(() => {
            if (client.isOpen && !client.isReady) client.destroy();
        }, connectMs + 100);
        connecting = client.connect().then(() => {
            failures = 0;
            lastError = undefined;
            return true;
        }).catch(error => {
            failures += 1;
            retryAt = Date.now() + Math.min(60000, 3000 * 2 ** Math.min(6, failures - 1));
            const code = lastError || errorCode(error);
            console.warn('[Redis] Cache unavailable. Retrying with backoff:', code);
            return false;
        }).finally(() => {
            clearTimeout(timer);
            connecting = undefined;
        });
    }
    return connecting;
}

async function run(command) {
    if (!await ensureRedisConnection()) return null;
    try {
        return await command(client.withCommandOptions({ abortSignal: AbortSignal.timeout(800) }));
    } catch {
        return null;
    }
}

async function healthCheck() {
    if (!url) return { status: 'disabled' };
    if (configError) return { status: 'unavailable', code: configError };
    const pong = await run(connection => connection.ping());
    return pong === 'PONG' ? { status: 'ready' } : { status: 'unavailable', code: lastError || 'ping_failed' };
}

let startup;
function checkStartup() {
    startup ??= healthCheck().then(result => {
        if (result.status === 'unavailable') {
            console.warn('[Redis] Startup health check failed; scanning will continue:', result.code);
        } else {
            console.info('[Redis] Startup health:', result.status);
        }
    });
    return startup;
}

module.exports = {
    healthCheck,
    checkStartup,
    get: key => run(connection => connection.get(key)),
    setEx: (key, ttl, value) => run(connection => connection.setEx(key, ttl, value)),
    eval: (script, args) => run(connection => connection.eval(script, args))
};
