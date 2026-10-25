import { useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { badgeVariants, statusLabels } from '@/lib/rack-status';
import type { HistoryRange } from '../interfaces/rack-history';
import { useRack } from '../hooks/use-rack';
import { useRackHistory } from '../hooks/use-rack-history';
import { useThresholds } from '../hooks/use-thresholds';
import { AlarmsCard } from './components/alarms-card';
import { CurrentStateCard } from './components/current-state-card';
import { ImpactsChart } from './components/impacts-chart';
import { Rack3DCard } from './components/rack-3d-card';
import { ThresholdsCard } from './components/thresholds-card';
import { TiltChart } from './components/tilt-chart';
import { VibrationChart } from './components/vibration-chart';

const ranges: HistoryRange[] = ['1h', '6h', '24h', '7d'];

const Index = () => {
  const { id = '' } = useParams();
  const [range, setRange] = useState<HistoryRange>('1h');
  const { data: summary, isLoading, isError } = useRack(id);
  const { data: history } = useRackHistory(summary?.rack.nodeId, range);
  const { data: thresholds } = useThresholds(summary?.rack.nodeId);

  if (isLoading) return <p>Cargando rack...</p>;
  if (isError || !summary) return <p>No se pudo cargar el rack.</p>;

  const { rack, status, latest } = summary;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" nativeButton={false} render={<Link to="/racks" />}>
            <ArrowLeftIcon />
          </Button>
          <h1 className="text-xl font-semibold">Rack {rack.name} · {rack.location}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant={badgeVariants[status]}>{statusLabels[status]}</Badge>
          <span>{rack.nodeName ?? 'Sin nodo asignado'}{latest && ` · señal ${latest.rssi} dBm`}</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Rack3DCard />
        <CurrentStateCard summary={summary} />
      </div>

      <ToggleGroup variant="outline" value={[range]} onValueChange={([value]) => value && setRange(value as HistoryRange)}>
        {ranges.map((item) => (
          <ToggleGroupItem key={item} value={item}>{item}</ToggleGroupItem>
        ))}
      </ToggleGroup>

      <TiltChart data={history?.telemetry ?? []} range={range} thresholds={thresholds} />

      <div className="grid gap-4 lg:grid-cols-2">
        <VibrationChart data={history?.telemetry ?? []} range={range} />
        <ImpactsChart data={history?.impacts ?? []} range={range} thresholds={thresholds} />
      </div>

      {rack.nodeId && thresholds && (
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <AlarmsCard nodeId={rack.nodeId} />
          </div>
          <ThresholdsCard nodeId={rack.nodeId} thresholds={thresholds} />
        </div>
      )}
    </>
  );
}

export default Index;
