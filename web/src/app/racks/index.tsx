import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Filters, type StatusFilter } from './components/filters';
import { columns } from './components/data-table/columns';
import { DataTable } from './components/data-table/data-table';
import { RackFormDialog } from './components/rack-form-dialog';
import { RacksSkeleton } from './components/skeletons/racks-skeleton';
import { useRacks } from './hooks/use-racks';
import { filterRacks } from './utils';

const Index = () => {
  const navigate = useNavigate();
  const { data: racks = [], isLoading, isError } = useRacks();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  return (
    <>
      <PageHeader title="Racks" description="Racks registrados, su ubicación y el nodo que los monitorea.">
        <RackFormDialog trigger={<Button>Nuevo rack</Button>} />
      </PageHeader>
      {isLoading && <RacksSkeleton />}
      {isError && <p>No se pudieron cargar los racks.</p>}
      {!isLoading && !isError && (
        <>
          <Filters
            summaries={racks}
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
          />
          <DataTable
            columns={columns}
            data={filterRacks(racks, search, status)}
            onRowClick={({ rack }) => navigate(`/racks/${rack.id}`)}
          />
        </>
      )}
    </>
  );
}

export default Index;
