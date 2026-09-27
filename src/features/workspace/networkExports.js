const escapeDiagramText = (value) => String(value)
  .replace(/[&<>"\r\n]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\r': ' ',
    '\n': ' ',
  })[character]);

export function createNetworkPlan(basePlan, allocations, createdAt = new Date().toISOString()) {
  return {
    format: 'hippogriff-network-plan',
    version: 1,
    createdAt,
    baseNetwork: {
      network: basePlan.result.network,
      cidr: basePlan.form.cidr,
      mask: basePlan.result.mask,
      broadcast: basePlan.result.broadcast,
    },
    vlans: allocations.map(({ id, originalIndex, offset, ...item }) => item),
  };
}

export function createMermaidDiagram(base, allocations) {
  return [
    'flowchart TD',
    `  base["Rede base<br/>${escapeDiagramText(base.network)}/${escapeDiagramText(base.subnetting.replace('/', ''))}"]`,
    ...allocations.flatMap((item, index) => [
      `  vlan${index}["VLAN ${escapeDiagramText(item.vlan)} · ${escapeDiagramText(item.name)}<br/>${escapeDiagramText(item.network)}/${escapeDiagramText(item.cidr)}"]`,
      `  base --> vlan${index}`,
    ]),
  ].join('\n');
}