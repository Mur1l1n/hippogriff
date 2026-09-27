import { describe, expect, it } from 'vitest';
import { allocateVlsm } from './vlsmUtils';

describe('allocateVlsm', () => {
  it('allocates aligned subnets and keeps the VLAN associations', () => {
    const result = allocateVlsm('10.20.0.0', 24, [
      { name: 'Administrativo', vlan: 20, hosts: 25 },
      { name: 'Operações', vlan: 10, hosts: 50 },
    ]);

    expect(result).toMatchObject([
      { name: 'Administrativo', vlan: 20, network: '10.20.0.64', cidr: 27, broadcast: '10.20.0.95' },
      { name: 'Operações', vlan: 10, network: '10.20.0.0', cidr: 26, broadcast: '10.20.0.63' },
    ]);
  });

  it('rejects duplicate VLANs and allocations larger than the base network', () => {
    expect(() => allocateVlsm('10.20.0.0', 24, [
      { name: 'A', vlan: 10, hosts: 10 },
      { name: 'B', vlan: 10, hosts: 10 },
    ])).toThrow('está repetida');

    expect(() => allocateVlsm('10.20.0.0', 27, [
      { name: 'Grande', vlan: 20, hosts: 50 },
    ])).toThrow('não comporta');
  });

  it('rejects a set of subnets that exceeds the base address space', () => {
    expect(() => allocateVlsm('10.20.0.0', 26, [
      { name: 'A', vlan: 10, hosts: 30 },
      { name: 'B', vlan: 20, hosts: 30 },
      { name: 'C', vlan: 30, hosts: 30 },
    ])).toThrow('não tem espaço suficiente');
  });
});