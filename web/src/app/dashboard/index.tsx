import { useState } from 'react';
import { Filters, type StatusFilter } from '../racks/components/filters';
import { useLiveRacks } from '../racks/hooks/use-live-racks';
import { filterRacks } from '../racks/utils';
import { RackGrid } from './components/rack-grid';
import { DashboardSkeleton } from './components/skeletons/dashboard-skeleton';
import { Summary } from './components/summary';
import { useDashboard } from './hooks/use-dashboard';

const Index = () => {
  const { data: summaries = [], isLoading, isError } = useDashboard();
  useLiveRacks(['dashboard'], summaries.flatMap(({ rack }) => rack.nodeId ?? []));
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <p>No se pudo cargar el dashboard.</p>;

  return (
    <>
      <Summary summaries={summaries} />

      <Filters
        summaries={summaries}
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      <RackGrid summaries={filterRacks(summaries, search, status)} />
    </>
  );
}

export default Index;
