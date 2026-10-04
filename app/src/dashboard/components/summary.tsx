import type { RackSummary } from '@/interfaces/rack-summary';
import { countByStatus } from '../utils';
import { SummaryCard } from './summary-card';

interface Props {
  summaries: RackSummary[];
}

export const Summary = ({ summaries }: Props) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <SummaryCard title="Normales" content={countByStatus(summaries, 'normal')} />
      <SummaryCard title="En advertencia" content={countByStatus(summaries, 'warning')} />
      <SummaryCard title="En alarma" content={countByStatus(summaries, 'alarm')} />
      <SummaryCard title="Sin conexión" content={countByStatus(summaries, 'offline')} />
    </div>
  );
}
