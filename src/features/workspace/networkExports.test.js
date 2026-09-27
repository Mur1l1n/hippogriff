import { describe, expect, it } from 'vitest';
import { createMermaidDiagram, createNetworkPlan } from './networkExports';

const basePlan = {
  form: { cidr: 24 },
  result: { network: '192.168.1.0', subnetting: '/24', mask: '255.255.255.0', broadcast: '192.168.1.255' },
};
const allocations = [{ id: 1, originalIndex: 0, offset: 0, name: 'Operações', vlan: 10, hosts: 50, network: '192.168.1.0', cidr: 26 }];

describe('network exports', () => {
  it('serializes a versioned JSON plan without allocator internals', () => {
    const plan = createNetworkPlan(basePlan, allocations, '2026-09-27T00:00:00.000Z');

    expect(plan).toMatchObject({
      format: 'hippogriff-network-plan',
      version: 1,
      createdAt: '2026-09-27T00:00:00.000Z',
      baseNetwork: { network: '192.168.1.0', cidr: 24 },
      vlans: [{ name: 'Operações', vlan: 10, network: '192.168.1.0', cidr: 26 }],
    });
    expect(plan.vlans[0]).not.toHaveProperty('offset');
  });

  it('generates a Mermaid diagram and escapes user-provided labels', () => {
    const diagram = createMermaidDiagram(basePlan.result, [{ ...allocations[0], name: 'Ops "core"' }]);

    expect(diagram).toContain('flowchart TD');
    expect(diagram).toContain('VLAN 10 · Ops &quot;core&quot;');
    expect(diagram).toContain('base --> vlan0');
  });
});