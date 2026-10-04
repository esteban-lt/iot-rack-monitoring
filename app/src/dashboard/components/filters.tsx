import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { RackStatus, RackSummary } from '@/interfaces/rack-summary';
import { countByStatus, statusLabels } from '../utils';

interface Props {
  summaries: RackSummary[];
}

const statuses: RackStatus[] = ['normal', 'warning', 'alarm', 'offline'];

export const Filters = ({ summaries }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <Input placeholder="Nombre o ubicación" className="w-64" />
      <div className="flex items-center gap-2">
        <Button>Todos ({summaries.length})</Button>
        {statuses.map((status) => (
          <Button key={status} variant="outline">
            {statusLabels[status]} ({countByStatus(summaries, status)})
          </Button>
        ))}
      </div>
    </div>
  );
}
