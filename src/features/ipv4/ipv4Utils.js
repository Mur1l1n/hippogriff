const IPV4_OCTETS = 4;

const toUint32 = (ip) => {
  if (typeof ip !== 'string' || !/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    throw new Error('IPv4 inválido');
  }

  const octets = ip.split('.').map(Number);
  if (octets.length !== IPV4_OCTETS || octets.some((octet) => octet < 0 || octet > 255)) {
    throw new Error('IPv4 inválido');
  }

  return octets.reduce((value, octet) => (value << 8) + octet, 0) >>> 0;
};

const fromUint32 = (value) => {
  const octets = [];
  for (let i = 0; i < IPV4_OCTETS; i += 1) {
    octets.push((value >>> (24 - i * 8)) & 255);
  }
  return octets.join('.');
};

const toMask = (cidr) => {
  const maskValue = cidr >= 32 ? 0xffffffff : ((0xffffffff << (32 - cidr)) >>> 0) & 0xffffffff;
  return fromUint32(maskValue);
};

const toWildcard = (mask) => {
  const maskValue = toUint32(mask);
  return fromUint32((~maskValue) >>> 0);
};

const getNetwork = (ip, cidr) => {
  const ipValue = toUint32(ip);
  const maskValue = cidr >= 32 ? 0xffffffff : ((0xffffffff << (32 - cidr)) >>> 0) & 0xffffffff;
  return fromUint32(ipValue & maskValue);
};

const getBroadcast = (network, cidr) => {
  const networkValue = toUint32(network);
  const maskValue = cidr >= 32 ? 0xffffffff : ((0xffffffff << (32 - cidr)) >>> 0) & 0xffffffff;
  const broadcastValue = networkValue | (~maskValue >>> 0);
  return fromUint32(broadcastValue >>> 0);
};

const getHostsAvailable = (cidr) => {
  if (cidr >= 31) {
    return 0;
  }

  return Math.max(0, 2 ** (32 - cidr) - 2);
};

export const parseCidrOrMask = (value) => {
  const input = String(value).trim();
  const prefix = input.startsWith('/') ? input.slice(1) : input;

  if (/^\d+$/.test(prefix)) {
    const cidr = Number(prefix);
    if (Number.isInteger(cidr) && cidr >= 0 && cidr <= 32) return cidr;
    throw new Error('Use um CIDR entre 0 e 32.');
  }

  let maskValue;
  try {
    maskValue = toUint32(input);
  } catch {
    throw new Error('Informe um CIDR entre 0 e 32 ou uma máscara IPv4 válida.');
  }
  const maskBits = maskValue.toString(2).padStart(32, '0');
  if (!/^1*0*$/.test(maskBits)) {
    throw new Error('A máscara precisa ter bits contínuos, por exemplo 255.255.255.0.');
  }
  return maskBits.indexOf('0') === -1 ? 32 : maskBits.indexOf('0');
};

export const getCidrForHosts = (requiredHosts) => {
  const hosts = Number(requiredHosts);
  if (!Number.isInteger(hosts) || hosts < 1) {
    throw new Error('Informe um número inteiro de hosts maior que zero.');
  }

  for (let cidr = 30; cidr >= 0; cidr -= 1) {
    if (getHostsAvailable(cidr) >= hosts) return cidr;
  }

  throw new Error('O IPv4 não comporta essa quantidade de hosts em uma única sub-rede.');
};

export const calculateIPv4Network = (ipAddress, cidr, requiredHosts = 0) => {
  const normalizedCidr = Number(cidr);
  if (!Number.isInteger(normalizedCidr) || normalizedCidr < 0 || normalizedCidr > 32) {
    throw new Error('CIDR inválido');
  }

  const network = getNetwork(ipAddress, normalizedCidr);
  const mask = toMask(normalizedCidr);
  const wildcard = toWildcard(mask);
  const broadcast = getBroadcast(network, normalizedCidr);
  const hosts = getHostsAvailable(normalizedCidr);

  return {
    ipv4: ipAddress,
    network,
    subnetting: `/${normalizedCidr}`,
    mask,
    wildcard,
    broadcast,
    hosts,
    requiredHosts,
    firstHost: makeFirstHost(network, normalizedCidr),
    lastHost: makeLastHost(network, normalizedCidr, broadcast),
    totalAddresses: 2 ** (32 - normalizedCidr),
  };
};

export const makeFirstHost = (network, cidr) => {
  if (cidr >= 31) {
    return network;
  }

  return fromUint32(toUint32(network) + 1);
};

export const makeLastHost = (network, cidr, broadcast) => {
  if (cidr >= 31) {
    return broadcast;
  }

  return fromUint32(toUint32(broadcast) - 1);
};

export const normalizeCidr = (value) => Number(value) || 24;
