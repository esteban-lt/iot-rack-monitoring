import { useState } from 'react';
import type { RowSelectionState } from '@tanstack/react-table';
import { PageHeader } from '@/components/page-header';
import { useRacks } from '../racks/hooks/use-racks';
import { Filters } from './components/filters';
import { AlarmsSkeleton } from './components/skeletons/alarms-skeleton';
import { columns, selectColumn } from './components/data-table/columns';
import { DataTable } from './components/data-table/data-table';
import { SelectionBar } from './components/selection-bar';
import { TablePagination } from './components/table-pagination';
import { useAlarms } from './hooks/use-alarms';
import type { AlarmFilters } from './interfaces/alarm-filters';

const selectableColumns = [selectColumn, ...columns];

const Index = () => {
  const [filters, setFilters] = useState<AlarmFilters>({ severity: 'all', status: 'all', nodeId: 'all' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data: racks = [] } = useRacks();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, isLoading, isError } = useAlarms({ filters, pageSize, page });
  const selected = data?.alarms.filter(({ id }) => rowSelection[id]) ?? [];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setRowSelection({});
  };

  const handleFiltersChange = (newFilters: AlarmFilters) => {
    setFilters(newFilters);
    handlePageChange(0);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    handlePageChange(0);
  };

  return (
    <>
      <PageHeader title="Alarmas" description="Historial de alarmas generadas por los racks." />
      {isLoading && <AlarmsSkeleton />}
      {!isLoading && (isError || !data) && <p>No se pudieron cargar las alarmas.</p>}
      {data && (
        <>
          <Filters racks={racks} filters={filters} onFiltersChange={handleFiltersChange} />

          {selected.length > 0 && <SelectionBar selected={selected} onDone={() => setRowSelection({})} />}

          <DataTable
            columns={selectableColumns}
            data={data.alarms}
            getRowId={({ id }) => id}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />

          <TablePagination
            page={page}
            totalPages={data.totalPages}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </>
  );
}

export default Index;
