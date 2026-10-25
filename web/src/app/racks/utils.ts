import type { RackSummary } from '@/interfaces/rack-summary';
import type { StatusFilter } from './components/filters';

export const filterRacks = (summaries: RackSummary[], search: string, status: StatusFilter) => {
  const term = search.trim().toLowerCase();

  return summaries.filter(({ rack, status: rackStatus }) => {
    if (status !== 'all' && rackStatus !== status) return false;

    return [rack.name, rack.location, rack.nodeName, rack.rfidUid].some((value) =>
      value?.toLowerCase().includes(term),
    );
  });
}
