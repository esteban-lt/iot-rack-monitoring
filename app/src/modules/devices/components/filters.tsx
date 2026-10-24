import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { NodeSummary } from '@/interfaces/node-summary';
import { countByFilter, filterLabels, type NodeFilter } from '../utils';

interface Props {
  summaries: NodeSummary[];
}

const filters: NodeFilter[] = ['online', 'offline', 'unassigned'];

export const Filters = ({ summaries }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <Input placeholder="Buscar nodo, MAC o IP" className="w-64" />
      <div className="flex items-center gap-2">
        <Button>Todos ({summaries.length})</Button>
        {filters.map((filter) => (
          <Button key={filter} variant="outline">
            {filterLabels[filter]} ({countByFilter(summaries, filter)})
          </Button>
        ))}
      </div>
    </div>
  );
}
