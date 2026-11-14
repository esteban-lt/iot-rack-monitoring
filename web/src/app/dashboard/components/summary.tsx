import type { RackStatus, RackSummary } from '@/interfaces/rack-summary';
import { countByStatus, statusColors } from '@/lib/rack-status';
import type { StatusFilter } from '../../racks/components/filters';
import { SummaryCard } from './summary-card';

interface Props {
  summaries: RackSummary[];
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}

const cards: { status: RackStatus; title: string }[] = [
  { status: 'ok', title: 'Normales' },
  { status: 'warning', title: 'En advertencia' },
  { status: 'alarm', title: 'En alarma' },
  { status: 'offline', title: 'Sin conexión' },
];

export const Summary = ({ summaries, status, onStatusChange }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard
          key={card.status}
          title={card.title}
          count={countByStatus(summaries, card.status)}
          color={statusColors[card.status]}
          active={status === card.status}
          onClick={() => onStatusChange(status === card.status ? 'all' : card.status)}
        />
      ))}
    </div>
  );
}
