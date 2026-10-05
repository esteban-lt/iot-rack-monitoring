import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Alarm } from '@/interfaces/alarm';
import { formatDate } from '@/lib/utils';
import { isActive, isUnack, severityLabels, severityVariants, typeLabels, typeUnits } from '../../utils';
import { type DataTableFeatures } from './data-table-features';

const columnHelper = createColumnHelper<DataTableFeatures, Alarm>();

export const columns = columnHelper.columns([
  columnHelper.accessor('createdTs', {
    header: 'Fecha y hora',
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.accessor('rackId', {
    header: 'Rack',
    cell: (info) => <span className="font-bold">{info.getValue()}</span>,
  }),
  columnHelper.accessor('type', {
    header: 'Tipo',
    cell: ({ row }) => {
      const { type, value } = row.original;
      return value ? `${typeLabels[type]} · ${value}${typeUnits[type]}` : typeLabels[type];
    },
  }),
  columnHelper.accessor('severity', {
    header: 'Severidad',
    cell: (info) => (
      <Badge variant={severityVariants[info.getValue()]}>
        {severityLabels[info.getValue()]}
      </Badge>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Estado',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline">{isActive(row.original) ? 'Activa' : 'Limpiada'}</Badge>
        {isUnack(row.original) && <Badge variant="warning">Sin reconocer</Badge>}
      </div>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Acción',
    cell: ({ row }) =>
      isUnack(row.original) && <Button variant="outline">Reconocer</Button>,
  }),
]);
