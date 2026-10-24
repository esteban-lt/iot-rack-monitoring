import { useState } from 'react';
import { useRacks } from '../racks/hooks/use-racks';
import { Filters } from './components/filters';
import { columns } from './components/data-table/columns';
import { DataTable } from './components/data-table/data-table';
import { TablePagination } from './components/table-pagination';
import { useAlarms } from './hooks/use-alarms';
import type { AlarmFilters } from './interfaces/alarm-filters';

const Index = () => {
  const [filters, setFilters] = useState<AlarmFilters>({ severity: 'all', status: 'all', nodeId: 'all' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data: racks = [] } = useRacks();
  const { data, isLoading, isError } = useAlarms({ filters, pageSize, page });

  const handleFiltersChange = (newFilters: AlarmFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  if (isLoading) return <p>Cargando alarmas...</p>;
  if (isError || !data) return <p>No se pudieron cargar las alarmas.</p>;

  return (
    <>
      <Filters racks={racks} filters={filters} onFiltersChange={handleFiltersChange} />

      <DataTable columns={columns} data={data.alarms} />

      <TablePagination
        page={page}
        totalPages={data.totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
}

export default Index;
