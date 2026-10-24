import { useState } from 'react';
import { Filters, type StatusFilter } from '../racks/components/filters';
import { filterRacks } from '../racks/utils';
import { RackGrid } from './components/rack-grid';
import { Summary } from './components/summary';
import { useDashboard } from './hooks/use-dashboard';

const Index = () => {
  const { data: summaries = [], isLoading, isError } = useDashboard();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  if (isLoading) return <p>Cargando dashboard...</p>;
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
