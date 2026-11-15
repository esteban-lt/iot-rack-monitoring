import { describe, expect, it } from 'vitest';
import { countByFilter, filterNodes } from '@/app/devices/utils';
import type { NodeSummary } from '@/interfaces/node-summary';

const node = (name: string, isActive: boolean, extra: Partial<NodeSummary['node']> = {}): NodeSummary => ({
  node: { id: name, name, isActive, ...extra },
});

const nodes = [
  node('rack-node-01', true, { mac: 'AA:BB:CC:00:00:01', ip: '192.168.1.10', rackId: 'r1' }),
  node('rack-node-02', false, { mac: 'AA:BB:CC:00:00:02', rackId: 'r2' }),
  node('rack-node-03', true, { ip: '192.168.1.30' }),
];

const names = (summaries: NodeSummary[]) => summaries.map(({ node }) => node.name);

describe('filterNodes', () => {
  it('filters by connection and assignment', () => {
    expect(names(filterNodes(nodes, '', 'online'))).toEqual(['rack-node-01', 'rack-node-03']);
    expect(names(filterNodes(nodes, '', 'offline'))).toEqual(['rack-node-02']);
    expect(names(filterNodes(nodes, '', 'unassigned'))).toEqual(['rack-node-03']);
  });

  it('searches name, MAC and IP', () => {
    expect(names(filterNodes(nodes, 'cc:00:00:02', 'all'))).toEqual(['rack-node-02']);
    expect(names(filterNodes(nodes, '1.30', 'all'))).toEqual(['rack-node-03']);
    expect(names(filterNodes(nodes, 'NODE-01', 'all'))).toEqual(['rack-node-01']);
  });
});

describe('countByFilter', () => {
  it('counts nodes for each filter', () => {
    expect(countByFilter(nodes, 'online')).toBe(2);
    expect(countByFilter(nodes, 'offline')).toBe(1);
    expect(countByFilter(nodes, 'unassigned')).toBe(1);
  });
});
