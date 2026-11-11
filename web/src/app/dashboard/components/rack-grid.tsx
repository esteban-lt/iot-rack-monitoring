import type { RackSummary } from '@/interfaces/rack-summary';
import { RackCard } from './rack-card';

interface Props {
  summaries: RackSummary[];
}

export const RackGrid = ({ summaries }: Props) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {summaries.map((summary) => (
        <RackCard key={summary.rack.id} summary={summary} />
      ))}
    </div>
  );
}
