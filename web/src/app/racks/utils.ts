import type { RackStatus, RackSummary } from '@/interfaces/rack-summary';
import type { StatusFilter } from './components/filters';

export type RackSort = 'critical' | 'name' | 'tilt';

const statusRank: Record<RackStatus, number> = { alarm: 0, warning: 1, ok: 2, offline: 3 };

const byName = (a: RackSummary, b: RackSummary) => a.rack.name.localeCompare(b.rack.name, 'es', { numeric: true });

export const sortRacks = (summaries: RackSummary[], sort: RackSort) =>
  [...summaries].sort((a, b) => {
    if (sort === 'critical') return statusRank[a.status] - statusRank[b.status] || byName(a, b);
    if (sort === 'tilt') return (b.latest?.tilt ?? -1) - (a.latest?.tilt ?? -1) || byName(a, b);
    return byName(a, b);
  });

export const filterRacks = (summaries: RackSummary[], search: string, status: StatusFilter) => {
  const term = search.trim().toLowerCase();

  return summaries.filter(({ rack, status: rackStatus }) => {
    if (status !== 'all' && rackStatus !== status) return false;

    return [rack.name, rack.location, rack.nodeName, rack.rfidUid].some((value) =>
      value?.toLowerCase().includes(term),
    );
  });
}
