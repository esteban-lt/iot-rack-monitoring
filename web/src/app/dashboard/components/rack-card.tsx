import { Link } from 'react-router';
import { RelativeTime } from '@/components/relative-time';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { RackSummary } from '@/interfaces/rack-summary';
import { badgeVariants, statusLabels } from '@/lib/rack-status';
import { cn, formatDate } from '@/lib/utils';
import { TiltGauge } from './tilt-gauge';

interface Props {
  summary: RackSummary;
}

export const RackCard = ({ summary }: Props) => {
  const { rack, status, latest, lastImpact, thresholds } = summary;
  const isAlarm = status === 'alarm';

  return (
    <Card className={cn(isAlarm && 'bg-destructive/5 ring-destructive/60')}>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>
          <Link to={`/racks/${rack.id}`} className="hover:underline">{rack.name}</Link>
        </CardTitle>
        <Badge variant={badgeVariants[status]}>{statusLabels[status]}</Badge>
      </CardHeader>
      <CardContent className="grid gap-2">
        <p>{rack.location}</p>
        <p className={cn('text-lg font-bold', isAlarm && 'text-destructive')}>
          {latest ? `${latest.tilt.toFixed(1)}° inclinación` : '— sin lectura actual'}
        </p>
        {latest && thresholds && thresholds.tiltAlarmDeg > 0 && (
          <TiltGauge tilt={latest.tilt} status={status} thresholds={thresholds} />
        )}
        <div className="text-xs font-light">
          <p>
            Último impacto: {lastImpact ? `${formatDate(lastImpact.ts)} | ${lastImpact.impactG} g` : 'sin registros recientes'}
          </p>
          <p>
            {!rack.nodeName
              ? 'Sin nodo asignado'
              : latest ? `Vibración: ${latest.vibRms.toFixed(2)} g | ${rack.nodeName}` : `${rack.nodeName} sin enviar datos`}
          </p>
          {latest && <p>Actualizado <RelativeTime ts={latest.ts} /></p>}
        </div>
      </CardContent>
    </Card>
  );
}
