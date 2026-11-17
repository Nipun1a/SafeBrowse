const assert = require('node:assert/strict');
const { mkdtemp, writeFile, utimes, unlink, rmdir } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { once, EventEmitter } = require('node:events');
const { test } = require('node:test');
const { Resolver } = require('node:dns/promises');
const tls = require('node:tls');
const axios = require('axios');
const app = require('../app');
const redis = require('../config/redis');
const { scan } = require('../Controllers/ScanController');
const virusTotal = require('../Services/virusTotal');
const score = require('../Services/scoreService');
const { vt } = require('../config/risk');
const { normalizeUrl } = require('../Middleware/validateUrl');
const { isPublicAddress } = require('../Services/dnsService');

function configure(t, entries) {
    const previous = Object.fromEntries(Object.keys(entries).map(key => [key, process.env[key]]));
    const apply = values => {
        for (const [key, value] of Object.entries(values)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    };
    apply(entries);
    t.after(() => apply(previous));
}

test('normalizes IDN, host case and fragments while preserving the query', () => {
    const url = normalizeUrl(' HTTPS://BÜCHER.example:443/order?next=%2F#ignore ');
    assert.equal(url.href, 'https://xn--bcher-kva.example/order?next=%2F');
    assert.equal(virusTotal.urlId('https://example.com/'), 'aHR0cHM6Ly9leGFtcGxlLmNvbS8');
    assert.doesNotMatch(virusTotal.urlId('https://example.com/🔒'), /[=+/]/);
    for (const input of [null, [], 'ftp://example.com', 'https:///example.com', 'https://user@example.com',
        'https://localhost', 'https://127.0.0.1', 'https://[::1]', 'https://example.com/a b']) {
        assert.throws(() => normalizeUrl(input));
    }
});

test('only global DNS addresses are eligible for TLS', () => {
    assert.equal(isPublicAddress('8.8.8.8', 4), true);
    assert.equal(isPublicAddress('2606:4700::1111', 6), true);
    for (const ip of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '100.64.0.1', '192.0.2.1']) {
        assert.equal(isPublicAddress(ip, 4), false);
    }
    for (const ip of ['::1', '::ffff:192.168.0.1', 'fc00::1', 'fe80::1', '2001:db8::1']) {
        assert.equal(isPublicAddress(ip, 6), false);
    }
});

test('score distinguishes threat evidence, uncertainty and dual-provider no-match', () => {
    const unknown = { status: 'unknown' };
    const match = { status: 'match' };
    const clear = { status: 'no_match' };
    const clean = { status: 'completed', harmless: 10 };
    assert.deepEqual(score(unknown, unknown), { verdict: 'UNKNOWN', score: 50, confidence: 'NONE' });
    assert.equal(score(match, unknown).score, 100);
    assert.equal(score(clear, unknown).verdict, 'UNKNOWN');
    assert.equal(score(clear, { status: 'stale', harmless: 10 }).verdict, 'UNKNOWN');
    assert.equal(score(clear, { status: 'completed', malicious: 3 }).verdict, 'MALICIOUS');
    assert.equal(score(clear, { status: 'completed', malicious: 2 }).verdict, 'SUSPICIOUS');
    assert.equal(score(clear, { status: 'completed', suspicious: 1 }).verdict, 'SUSPICIOUS');
    assert.equal(score(clear, clean, [{ weight: 35 }]).verdict, 'SUSPICIOUS');
    assert.equal(score(clear, clean).verdict, 'NO_KNOWN_THREATS');
});

test('VirusTotal submits missing reports, polls, and preserves pending timeouts', async t => {
    configure(t, { VIRUSTOTAL_API_KEY: 'fixture', VIRUSTOTAL_SUBMIT_UNKNOWN: undefined });
    const quota = t.mock.method(redis, 'eval', async () => 1);
    const post = t.mock.method(axios, 'post', async (endpoint, form) => {
        assert.ok(endpoint.endsWith('/urls'));
        assert.equal(form.get('url'), 'https://example.org/');
        return { data: { data: { id: 'analysis-id' } } };
    });
    t.mock.method(axios, 'get', async endpoint => {
        if (endpoint.includes('/urls/')) throw { response: { status: 404 } };
        return { data: { data: { attributes: { status: 'completed',
            stats: { malicious: 1, suspicious: 0, harmless: 10, undetected: 5 } } } } };
    });
    const completed = await virusTotal('https://example.org/');
    assert.equal(completed.status, 'completed');
    assert.equal(completed.undetected, 5);
    assert.equal(post.mock.callCount(), 1);
    assert.equal(quota.mock.callCount(), 3);

    const originalDeadline = vt.totalMs;
    vt.totalMs = 100;
    t.after(() => { vt.totalMs = originalDeadline; });
    assert.deepEqual(await virusTotal('https://example.org/'), { status: 'pending', reason: 'timeout' });
    assert.equal(score({ status: 'match' }, { status: 'pending' }).verdict, 'MALICIOUS');
});

test('local quota keeps four requests per minute during a Redis outage', async t => {
    const reserveQuota = require('../Services/vtQuota');
    t.mock.method(redis, 'eval', async () => { throw new Error('Redis unavailable'); });
    const grants = await Promise.all(Array.from({ length: 5 }, () => reserveQuota('outage-fixture')));
    // The fallback also accounts for requests granted by Redis earlier in the rolling window for this key.
    assert.deepEqual(grants, [true, true, true, true, false]);
});

test('scan route flags a Google match during Redis failure and a VirusTotal miss', async t => {
    configure(t, { GOOGLE_SAFE_BROWSING_API_KEY: 'fixture', VIRUSTOTAL_API_KEY: 'route-fixture',
        VIRUSTOTAL_SUBMIT_UNKNOWN: 'false', MONGO_URI: undefined });
    t.mock.method(redis, 'get', async () => { throw new Error('Redis unavailable'); });
    t.mock.method(redis, 'setEx', async () => { throw new Error('Redis unavailable'); });
    t.mock.method(redis, 'eval', async () => 1);
    const dns4 = t.mock.method(Resolver.prototype, 'resolve4', async host =>
        host === 'restricted.example.com' ? ['10.0.0.2'] : ['8.8.8.8']);
    t.mock.method(Resolver.prototype, 'resolve6', async () => []);
    const tlsCheck = t.mock.method(tls, 'connect', options => {
        assert.equal(options.host, '8.8.8.8');
        assert.equal(options.servername, 'www.example.com');
        assert.equal(options.rejectUnauthorized, true);
        const socket = new EventEmitter();
        socket.destroy = () => {};
        queueMicrotask(() => socket.emit('secureConnect'));
        return socket;
    });

    const google = t.mock.method(axios, 'post', async (endpoint, body) => {
        assert.ok(endpoint.endsWith('/v4/threatMatches:find'));
        assert.equal(body.threatInfo.threatTypes.length, 4);
        assert.deepEqual(body.threatInfo.platformTypes, ['ANY_PLATFORM']);
        assert.deepEqual(body.threatInfo.threatEntryTypes, ['URL']);
        const { url } = body.threatInfo.threatEntries[0];
        assert.equal(new URL(url).hash, '');
        return { data: url.includes('/warning') ? {
            matches: [{ threatType: 'SOCIAL_ENGINEERING', cacheDuration: '5s' }]
        } : {} };
    });
    t.mock.method(axios, 'get', async endpoint => {
        if (endpoint === 'https://data.iana.org/rdap/dns.json') return { data: { services: [] } };
        assert.ok(endpoint.startsWith('https://www.virustotal.com/api/v3/urls/'));
        if (Buffer.from(endpoint.split('/').at(-1), 'base64url').toString().includes('-timeout')) {
            throw Object.assign(new Error(), { code: 'ETIMEDOUT' });
        }
        throw { response: { status: 404 } };
    });

    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => new Promise(resolve => server.close(resolve)));
    const base = `http://127.0.0.1:${server.address().port}`;
    const submit = url => fetch(`${base}/api/scan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url })
    });
    assert.equal((await submit('https://localhost')).status, 400);
    assert.equal(dns4.mock.callCount(), 0);

    const [a, b] = await Promise.all([
        submit('https://WWW.EXAMPLE.COM/warning?next=%2F#one'),
        submit('https://www.example.com/warning?next=%2F#two')
    ]).then(responses => Promise.all(responses.map(response => {
        assert.equal(response.status, 200);
        return response.json();
    })));
    assert.deepEqual(a.data, b.data);
    assert.equal(a.data.url, 'https://www.example.com/warning?next=%2F');
    assert.equal(a.data.verdict, 'MALICIOUS');
    assert.equal(a.data.score, 100);
    assert.equal(a.data.threatDetails.virusTotal.reason, 'no_report');
    assert.deepEqual(a.data.threatDetails.googleThreatTypes, ['SOCIAL_ENGINEERING']);
    assert.ok(+new Date(a.data.expiresAt) - Date.now() <= 5000);
    assert.equal((await (await submit(a.data.url)).json()).source, 'memory-cache');

    const timeout = (await (await submit('https://www.example.com/warning-timeout')).json()).data;
    assert.equal(timeout.threatDetails.virusTotal.reason, 'timeout');
    assert.equal(timeout.verdict, 'MALICIOUS');
    const noMatch = (await (await submit('https://www.example.com/unlisted')).json()).data;
    assert.equal(noMatch.verdict, 'UNKNOWN');

    const restricted = (await (await submit('https://restricted.example.com')).json()).data;
    assert.equal(restricted.threatDetails.dnsStatus, 'non_public');
    assert.equal(restricted.threatDetails.sslStatus, 'not_checked');
    assert.equal(google.mock.callCount(), 3);
    assert.equal(tlsCheck.mock.callCount(), 3);
});

test('a fresh optional OpenPhish feed flags exact URLs and rejects stale data', async t => {
    const folder = await mkdtemp(join(tmpdir(), 'safebrowse-feed-'));
    const path = join(folder, 'feed.txt');
    const stalePath = join(folder, 'old.txt');
    t.after(async () => {
        await Promise.all([unlink(path), unlink(stalePath)]);
        await rmdir(folder);
    });
    configure(t, { OPENPHISH_FEED_PATH: path, GOOGLE_SAFE_BROWSING_API_KEY: undefined,
        GOOGLE_WEB_RISK_API_KEY: undefined });
    await Promise.all([
        writeFile(path, 'https://WWW.EXAMPLE.COM/report#fragment'),
        writeFile(stalePath, 'https://www.example.com/report')
    ]);
    const old = new Date(Date.now() - 48 * 3600000);
    await utimes(stalePath, old, old);
    t.mock.method(Resolver.prototype, 'resolve4', async () => []);
    t.mock.method(Resolver.prototype, 'resolve6', async () => []);
    const url = normalizeUrl('https://www.example.com/report');
    const options = { useVirusTotal: false, connectToTarget: false };
    const matching = await scan(url, options);
    assert.equal(matching.verdict, 'MALICIOUS');
    assert.equal((await scan(new URL('/report/other', url), options)).verdict, 'UNKNOWN');
    process.env.OPENPHISH_FEED_PATH = stalePath;
    const stale = await scan(url, options);
    assert.equal(stale.verdict, 'UNKNOWN');
    assert.equal(stale.threatDetails.openPhish.reason, 'stale_feed');
    assert.equal((await scan(url, { ...options, useFeed: false })).threatDetails.openPhish.status, 'disabled');
});

test('live Google official test URLs are flagged', { skip: !process.env.RUN_LIVE_GOOGLE }, async () => {
    for (const [path, threat] of [
        ['/apiv4/ANY_PLATFORM/MALWARE/URL/', 'MALWARE'],
        ['/apiv4/ANY_PLATFORM/SOCIAL_ENGINEERING/URL/', 'SOCIAL_ENGINEERING']
    ]) {
        const url = normalizeUrl('http://testsafebrowsing.appspot.com' + path);
        const result = await scan(url, { useVirusTotal: false, connectToTarget: false, useFeed: false });
        assert.equal(result.threatDetails.googleSafeBrowsing, 'match', result.threatDetails.googleReason);
        assert.ok(result.threatDetails.googleThreatTypes.includes(threat));
        assert.equal(result.verdict, 'MALICIOUS');
        assert.equal(result.score, 100);
    }
});

