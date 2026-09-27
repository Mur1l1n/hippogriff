import { describe, it, expect } from 'vitest';
import { calculateIPv4Network, getCidrForHosts, parseCidrOrMask } from './ipv4Utils';

describe('calculateIPv4Network', () => {
  it('should calculate common IPv4 network data correctly', () => {
    const result = calculateIPv4Network('192.168.10.0', 24, 50);

    expect(result.ipv4).toBe('192.168.10.0');
    expect(result.network).toBe('192.168.10.0');
    expect(result.mask).toBe('255.255.255.0');
    expect(result.wildcard).toBe('0.0.0.255');
    expect(result.broadcast).toBe('192.168.10.255');
    expect(result.hosts).toBe(254);
    expect(result.subnetting).toBe('/24');
    expect(result.totalAddresses).toBe(256);
    expect(result).not.toHaveProperty('conversions');
  });

  it('rejects incomplete and out-of-range IPv4 addresses without coercing them', () => {
    expect(() => calculateIPv4Network('192.168.1', 24)).toThrow('IPv4 inválido');
    expect(() => calculateIPv4Network('192.168.1.300', 24)).toThrow('IPv4 inválido');
    expect(() => calculateIPv4Network('192.168.1.x', 24)).toThrow('IPv4 inválido');
  });

  it('accepts CIDR or a contiguous dotted subnet mask', () => {
    expect(parseCidrOrMask('24')).toBe(24);
    expect(parseCidrOrMask('/26')).toBe(26);
    expect(parseCidrOrMask('255.255.255.192')).toBe(26);
    expect(() => parseCidrOrMask('255.0.255.0')).toThrow('bits contínuos');
    expect(() => parseCidrOrMask('255.255.300.0')).toThrow('máscara IPv4 válida');
  });

  it('selects the smallest subnet that can fit the requested hosts', () => {
    expect(getCidrForHosts(50)).toBe(26);
    expect(getCidrForHosts(254)).toBe(24);
    expect(() => getCidrForHosts(0)).toThrow('maior que zero');
  });
});
