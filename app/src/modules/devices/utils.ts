import type { NodeSummary } from '@/interfaces/node-summary';

export type NodeFilter = 'online' | 'offline' | 'unassigned';
export type ActiveNodeFilter = NodeFilter | 'all';

export const filterLabels: Record<NodeFilter, string> = {
  online: 'En línea',
  offline: 'Sin conexión',
  unassigned: 'Sin asignar',
};

const matchesFilter = ({ node }: NodeSummary, filter: ActiveNodeFilter) => {
  if (filter === 'online') return node.isActive;
  if (filter === 'offline') return !node.isActive;
  if (filter === 'unassigned') return !node.rackId;
  return true;
};

export const countByFilter = (summaries: NodeSummary[], filter: NodeFilter) =>
  summaries.filter((summary) => matchesFilter(summary, filter)).length;

export const filterNodes = (summaries: NodeSummary[], search: string, filter: ActiveNodeFilter) => {
  const term = search.trim().toLowerCase();

  return summaries.filter((summary) => {
    if (!matchesFilter(summary, filter)) return false;

    const { node } = summary;
    return [node.name, node.mac, node.ip].some((value) => value?.toLowerCase().includes(term));
  });
}
