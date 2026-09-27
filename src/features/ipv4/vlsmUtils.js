import { getCidrForHosts } from './ipv4Utils';

const ipv4ToNumber = (address) => address.split('.').reduce((value, octet) => (value * 256) + Number(octet), 0);

const numberToIPv4 = (value) => [24, 16, 8, 0]
  .map((shift) => Math.floor(value / (2 ** shift)) % 256)
  .join('.');

export function allocateVlsm(baseNetwork, baseCidr, requirements) {
  const networkNumber = ipv4ToNumber(baseNetwork);
  const baseSize = 2 ** (32 - Number(baseCidr));
  const baseEnd = networkNumber + baseSize;
  const seenVlans = new Set();

  const normalized = requirements.map((requirement, index) => {
    const vlan = Number(requirement.vlan);
    const hosts = Number(requirement.hosts);
    if (!requirement.name.trim()) throw new Error(`Informe o nome da rede ${index + 1}.`);
    if (!Number.isInteger(vlan) || vlan < 1 || vlan > 4094) {
      throw new Error(`A VLAN de "${requirement.name}" precisa estar entre 1 e 4094.`);
    }
    if (seenVlans.has(vlan)) throw new Error(`A VLAN ${vlan} está repetida.`);
    seenVlans.add(vlan);

    const cidr = getCidrForHosts(hosts);
    if (cidr < Number(baseCidr)) {
      throw new Error(`A rede-base não comporta ${hosts} hosts em "${requirement.name}".`);
    }
    return { ...requirement, vlan, hosts, cidr, originalIndex: index };
  }).sort((left, right) => right.hosts - left.hosts);

  let cursor = networkNumber;
  const allocations = normalized.map((requirement) => {
    const size = 2 ** (32 - requirement.cidr);
    cursor = Math.ceil(cursor / size) * size;
    const end = cursor + size;
    if (end > baseEnd) {
      throw new Error(`A rede-base não tem espaço suficiente para alocar "${requirement.name}".`);
    }

    const network = numberToIPv4(cursor);
    const broadcast = numberToIPv4(end - 1);
    const allocation = {
      ...requirement,
      network,
      broadcast,
      firstHost: requirement.cidr >= 31 ? network : numberToIPv4(cursor + 1),
      lastHost: requirement.cidr >= 31 ? broadcast : numberToIPv4(end - 2),
      totalAddresses: size,
      offset: cursor - networkNumber,
    };
    cursor = end;
    return allocation;
  });

  return allocations.sort((left, right) => left.originalIndex - right.originalIndex);
}