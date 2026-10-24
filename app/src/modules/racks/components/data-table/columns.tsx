import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RackSummary } from '@/interfaces/rack-summary';
import { badgeVariants, statusLabels } from '@/lib/rack-status';
import { type DataTableFeatures } from './data-table-features';

const columnHelper = createColumnHelper<DataTableFeatures, RackSummary>();

export const columns = columnHelper.columns([
  columnHelper.accessor((row) => row.rack.name, {
    id: 'name',
    header: 'Rack',
    cell: (info) => <span className="font-bold">{info.getValue()}</span>,
  }),
  columnHelper.accessor((row) => row.rack.location, {
    id: 'location',
    header: 'Ubicación',
  }),
  columnHelper.accessor((row) => row.rack.rfidUid, {
    id: 'rfidUid',
    header: 'UID del tag RFID',
    cell: (info) => <span className="font-mono">{info.getValue()}</span>,
  }),
  columnHelper.accessor((row) => row.rack.nodeId, {
    id: 'nodeId',
    header: 'Nodo asignado',
  }),
  columnHelper.accessor('status', {
    header: 'Estado',
    cell: (info) => (
      <Badge variant={badgeVariants[info.getValue()]}>
        {statusLabels[info.getValue()]}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Acción',
    cell: () => <Button variant="outline">Editar</Button>,
  }),
]);
