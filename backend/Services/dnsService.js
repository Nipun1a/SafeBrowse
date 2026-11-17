const { Resolver } = require('node:dns/promises');
const { BlockList } = require('node:net');

const restricted = new BlockList();
for (const [network, bits] of [
    ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
    ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
    ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15],
    ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 3]
]) restricted.addSubnet(network, bits);
for (const [network, bits] of [
    ['2001::', 23], ['2001:db8::', 32], ['2002::', 16], ['3fff::', 20]
]) restricted.addSubnet(network, bits, 'ipv6');
const globalIPv6 = new BlockList();
globalIPv6.addSubnet('2000::', 3, 'ipv6');

function isPublicAddress(address, family) {
    return family === 4
        ? !restricted.check(address)
        : globalIPv6.check(address, 'ipv6') && !restricted.check(address, 'ipv6');
}

async function checkDNS(host) {
    const resolver = new Resolver({ timeout: 1000, tries: 1 });
    const timer = setTimeout(() => resolver.cancel(), 1500);
    try {
        const answers = await Promise.allSettled([resolver.resolve4(host), resolver.resolve6(host)]);
        const addresses = answers.flatMap((answer, index) => answer.status === 'fulfilled'
            ? answer.value.map(address => ({ address, family: index === 0 ? 4 : 6 }))
            : []);
        if (addresses.some(({ address, family }) => !isPublicAddress(address, family))) {
            return { status: 'non_public' };
        }
        if (addresses.length) return { status: 'public', ...addresses[0] };
        const missing = answers.every(answer => ['ENOTFOUND', 'ENODATA'].includes(answer.reason?.code));
        return { status: missing ? 'not_found' : 'unknown' };
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { checkDNS, isPublicAddress };
