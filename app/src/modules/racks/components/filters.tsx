import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { RackStatus, RackSummary } from '@/interfaces/rack-summary';
import { countByStatus, statusLabels } from '@/lib/rack-status';

export type StatusFilter = RackStatus | 'all';

interface Props {
  summaries: RackSummary[];
  search: string;
  onSearchChange: (search: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}

const statuses: RackStatus[] = ['ok', 'warning', 'alarm', 'offline'];

export const Filters = ({ summaries, search, onSearchChange, status, onStatusChange }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <Input
        placeholder="Buscar rack, ubicación o nodo"
        className="w-64"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <div className="flex items-center gap-2">
        <Button variant={status === 'all' ? 'default' : 'outline'} onClick={() => onStatusChange('all')}>
          Todos ({summaries.length})
        </Button>
        {statuses.map((item) => (
          <Button key={item} variant={status === item ? 'default' : 'outline'} onClick={() => onStatusChange(item)}>
            {statusLabels[item]} ({countByStatus(summaries, item)})
          </Button>
        ))}
      </div>
    </div>
  );
}
