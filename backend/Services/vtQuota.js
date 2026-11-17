const { createHash, randomUUID } = require('node:crypto');
const redis = require('../config/redis');
const { vt } = require('../config/risk');

const dayMs = 86400000;
const minuteMs = 60000;
const localByKey = new Map();
const reserve = `
local time = redis.call('TIME')
local now = time[1] * 1000 + math.floor(time[2] / 1000)
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - 86400000)
if redis.call('ZCARD', KEYS[1]) >= tonumber(ARGV[1]) or
   redis.call('ZCOUNT', KEYS[1], '(' .. tostring(now - 60000), '+inf') >= tonumber(ARGV[2]) then
    return 0
end
redis.call('ZADD', KEYS[1], now, ARGV[3])
redis.call('PEXPIRE', KEYS[1], 86400000)
return 1
`;

module.exports = async key => {
    const keyHash = createHash('sha256').update(key).digest('hex');
    const shared = await redis.eval(reserve, {
        keys: [`vt:quota:${keyHash}`],
        arguments: [String(vt.perDay), String(vt.perMinute), randomUUID()]
    }).catch(() => null);
    if (shared === 0) return false;

    if (!localByKey.has(keyHash)) {
        if (localByKey.size >= 4) localByKey.delete(localByKey.keys().next().value);
        localByKey.set(keyHash, []);
    }
    const local = localByKey.get(keyHash);
    const now = Date.now();
    while (local.length && now - local[0] >= dayMs) local.shift();
    if (shared !== 1 && (local.length >= vt.perDay ||
        (local.length >= vt.perMinute && now - local.at(-vt.perMinute) < minuteMs))) return false;
    local.push(now);
    return true;
};
