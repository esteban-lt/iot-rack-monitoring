import { useState } from 'react';
import { Filters } from './components/filters';
import { columns } from './components/data-table/columns';
import { DataTable } from './components/data-table/data-table';
import { useDevices } from './hooks/use-devices';
import { filterNodes, type ActiveNodeFilter } from './utils';

const Index = () => {
  const { data: summaries = [], isLoading, isError } = useDevices();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveNodeFilter>('all');

  if (isLoading) return <p>Cargando dispositivos...</p>;
  if (isError) return <p>No se pudieron cargar los dispositivos.</p>;

  return (
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
  );
}

export default Index;
