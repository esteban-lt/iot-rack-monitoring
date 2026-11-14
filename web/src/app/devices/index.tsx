import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Filters } from './components/filters';
import { columns } from './components/data-table/columns';
import { DataTable } from './components/data-table/data-table';
import { DevicesSkeleton } from './components/skeletons/devices-skeleton';
import { useDevices } from './hooks/use-devices';
import { filterNodes, type ActiveNodeFilter } from './utils';

const Index = () => {
  const { data: summaries = [], isLoading, isError } = useDevices();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveNodeFilter>('all');

  return (
    <>
      <PageHeader title="Dispositivos" description="Nodos ESP32 registrados en ThingsBoard y su conexión." />
      {isLoading && <DevicesSkeleton />}
      {isError && <p>No se pudieron cargar los dispositivos.</p>}
      {!isLoading && !isError && (
        <>
          <Filters
            summaries={summaries}
            search={search}
            onSearchChange={setSearch}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          <DataTable columns={columns} data={filterNodes(summaries, search, activeFilter)} />
        </>
      )}
    </>
  );
}

export default Index;
