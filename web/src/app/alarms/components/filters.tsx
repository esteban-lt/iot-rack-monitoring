import { CalendarIcon } from 'lucide-react';
import { es } from 'react-day-picker/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RackSummary } from '@/interfaces/rack-summary';
import type { AlarmFilters } from '../interfaces/alarm-filters';
import { severityLabels } from '../utils';

interface Props {
  racks: RackSummary[];
  filters: AlarmFilters;
  onFiltersChange: (filters: AlarmFilters) => void;
}

const severityItems = [
  { value: 'all', label: 'Todas las severidades' },
  ...Object.entries(severityLabels).map(([value, label]) => ({ value, label })),
];

const statusItems = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activas' },
  { value: 'unack', label: 'Sin reconocer' },
  { value: 'cleared', label: 'Limpiadas' },
];

const formatDay = (date: Date) => date.toLocaleDateString('es');

export const Filters = ({ racks, filters, onFiltersChange }: Props) => {
  const { severity, status, nodeId, dateRange } = filters;

  const update = (changes: Partial<AlarmFilters>) => onFiltersChange({ ...filters, ...changes });

  const rackItems = [
    { value: 'all', label: 'Todos los racks' },
    ...racks
      .filter(({ rack }) => rack.nodeId)
      .map(({ rack }) => ({ value: rack.nodeId!, label: rack.name })),
  ];

  const dateRangeLabel = dateRange?.from
    ? [dateRange.from, dateRange.to].filter((date) => date).map((date) => formatDay(date!)).join(' - ')
    : 'Rango de fechas';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select items={severityItems} value={severity} onValueChange={(value) => update({ severity: value as AlarmFilters['severity'] })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {severityItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select items={rackItems} value={nodeId} onValueChange={(value) => update({ nodeId: value! })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {rackItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select items={statusItems} value={status} onValueChange={(value) => update({ status: value as AlarmFilters['status'] })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>
          <CalendarIcon data-icon="inline-start" />
          {dateRangeLabel}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="range" locale={es} selected={dateRange} onSelect={(range) => update({ dateRange: range })} />
        </PopoverContent>
      </Popover>
      {dateRange && <Button variant="ghost" onClick={() => update({ dateRange: undefined })}>Limpiar fechas</Button>}
    </div>
  );
}
