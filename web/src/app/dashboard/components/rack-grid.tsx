import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import type { RackSummary } from '@/interfaces/rack-summary';
import { RackCard } from './rack-card';

interface Props {
  summaries: RackSummary[];
}

export const RackGrid = ({ summaries }: Props) => {
  if (!summaries.length) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>No hay racks para mostrar</EmptyTitle>
          <EmptyDescription>Prueba con otra búsqueda o con otro estado.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {summaries.map((summary) => (
        <RackCard key={summary.rack.id} summary={summary} />
      ))}
    </div>
  );
}
