import { useState } from 'react';
import { Filters, type StatusFilter } from './components/filters';
import { columns } from './components/data-table/columns';
import { DataTable } from './components/data-table/data-table';
import { useRacks } from './hooks/use-racks';
import { filterRacks } from './utils';

const Index = () => {
  const { data: racks = [], isLoading, isError } = useRacks();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  if (isLoading) return <p>Cargando racks...</p>;
  if (isError) return <p>No se pudieron cargar los racks.</p>;

  return (
    <>
      <Filters
        summaries={racks}
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />
      <DataTable columns={columns} data={filterRacks(racks, search, status)} />
    </>
  );
}

export default Index;
