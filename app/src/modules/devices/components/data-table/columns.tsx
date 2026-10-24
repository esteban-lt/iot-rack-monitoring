import { createColumnHelper } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import type { NodeSummary } from '@/interfaces/node-summary';
import { formatDate } from '@/lib/utils';
import { type DataTableFeatures } from './data-table-features';

const columnHelper = createColumnHelper<DataTableFeatures, NodeSummary>();

export const columns = columnHelper.columns([
  columnHelper.accessor((row) => row.node.name, {
    id: 'name',
    header: 'Nodo',
    cell: (info) => <span className="font-bold">{info.getValue()}</span>,
  }),
  columnHelper.accessor((row) => row.node.mac, {
    id: 'mac',
    header: 'MAC',
    cell: (info) => <span className="font-mono">{info.getValue()}</span>,
  }),
  columnHelper.accessor((row) => row.node.firmwareVersion, {
    id: 'firmwareVersion',
    header: 'Firmware',
  }),
  columnHelper.accessor((row) => row.node.ip, {
    id: 'ip',
    header: 'IP',
  }),
  columnHelper.accessor((row) => row.latest?.rssi, {
    id: 'rssi',
    header: 'Señal WiFi',
    cell: (info) => (info.getValue() ? `${info.getValue()} dBm` : 'sin señal'),
  }),
  columnHelper.accessor((row) => row.latest?.ts ?? row.node.lastActivityTs, {
    id: 'lastActivityTs',
    header: 'Último dato',
    cell: (info) => (info.getValue() ? formatDate(info.getValue()!) : '—'),
  }),
  columnHelper.accessor((row) => row.node.rackId, {
    id: 'rackId',
    header: 'Rack asignado',
    cell: (info) => info.getValue() ?? <span className="font-bold">Sin asignar</span>,
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Acción',
    cell: () => <Button variant="outline">Editar</Button>,
  }),
]);
