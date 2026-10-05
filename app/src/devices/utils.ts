import type { NodeSummary } from '@/interfaces/node-summary';

export type NodeFilter = 'online' | 'offline' | 'unassigned';

export const filterLabels: Record<NodeFilter, string> = {
  online: 'En línea',
  offline: 'Sin conexión',
  unassigned: 'Sin asignar',
};

export const countByFilter = (summaries: NodeSummary[], filter: NodeFilter) =>
  summaries.filter(({ node }) => {
    if (filter === 'online') return node.isActive;
    if (filter === 'offline') return !node.isActive;
    return !node.rackId;
  }).length;
