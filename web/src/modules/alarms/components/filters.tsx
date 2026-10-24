import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Alarm } from '@/interfaces/alarm';
import { severityLabels } from '../utils';

interface Props {
  alarms: Alarm[];
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

export const Filters = ({ alarms }: Props) => {
  const rackItems = [
    { value: 'all', label: 'Todos los racks' },
    ...[...new Set(alarms.map((alarm) => alarm.rackId))]
      .filter((rackId) => rackId)
      .map((rackId) => ({ value: rackId!, label: rackId! })),
  ];

  return (
    <div className="flex items-center gap-2">
      <Select items={severityItems} defaultValue="all">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {severityItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select items={rackItems} defaultValue="all">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {rackItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select items={statusItems} defaultValue="all">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input type="date" className="w-40" />
      <Input type="date" className="w-40" />
      <Button>Aplicar filtros</Button>
    </div>
  );
}
