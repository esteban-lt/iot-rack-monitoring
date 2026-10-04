import type { RackSummary } from '@/interfaces/rack-summary';
import { RackCard } from './rack-card';

interface Props {
  summaries: RackSummary[];
}

export const RackGrid = ({ summaries }: Props) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {summaries.map((summary) => (
        <RackCard key={summary.rack.id} summary={summary} />
      ))}
    </div>
  );
}
