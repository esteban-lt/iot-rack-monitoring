import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { NodeSummary } from '@/interfaces/node-summary';
import { countByFilter, filterLabels, type ActiveNodeFilter, type NodeFilter } from '../utils';

interface Props {
  summaries: NodeSummary[];
  search: string;
  onSearchChange: (search: string) => void;
  activeFilter: ActiveNodeFilter;
  onFilterChange: (filter: ActiveNodeFilter) => void;
}

const filters: NodeFilter[] = ['online', 'offline', 'unassigned'];

export const Filters = ({ summaries, search, onSearchChange, activeFilter, onFilterChange }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <Input
        placeholder="Buscar nodo, MAC o IP"
        className="w-64"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <div className="flex items-center gap-2">
        <Button variant={activeFilter === 'all' ? 'default' : 'outline'} onClick={() => onFilterChange('all')}>
          Todos ({summaries.length})
        </Button>
        {filters.map((filter) => (
          <Button key={filter} variant={activeFilter === filter ? 'default' : 'outline'} onClick={() => onFilterChange(filter)}>
            {filterLabels[filter]} ({countByFilter(summaries, filter)})
          </Button>
        ))}
      </div>
    </div>
  );
}
