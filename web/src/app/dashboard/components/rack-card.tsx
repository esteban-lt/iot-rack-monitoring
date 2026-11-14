import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { RackSummary } from '@/interfaces/rack-summary';
import { badgeVariants, statusLabels } from '@/lib/rack-status';
import { cn, formatDate } from '@/lib/utils';

interface Props {
  summary: RackSummary;
}

export const RackCard = ({ summary }: Props) => {
  const { rack, status, latest, lastImpact } = summary;
  const isAlarm = status === 'alarm';

  return (
    <Card className={cn(isAlarm && 'bg-destructive/5 ring-destructive/60')}>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>
          <Link to={`/racks/${rack.id}`} className="hover:underline">{rack.name}</Link>
        </CardTitle>
        <Badge variant={badgeVariants[status]}>{statusLabels[status]}</Badge>
      </CardHeader>
      <CardContent>
        <p>{rack.location}</p>
        <p className={cn('text-lg font-bold', isAlarm && 'text-destructive')}>
          {latest ? `${latest.tilt.toFixed(1)}° inclinación` : '— sin lectura actual'}
        </p>
        <p className="text-xs font-light">
          Último impacto: {lastImpact ? `${formatDate(lastImpact.ts)} | ${lastImpact.impactG} g` : 'sin registros recientes'}
        </p>
        <p className="text-xs font-light">
          {!rack.nodeName
            ? 'Sin nodo asignado'
            : latest ? `Vibración: ${latest.vibRms.toFixed(2)} g | ${rack.nodeName}` : `${rack.nodeName} sin enviar datos`}
        </p>
        {latest && <p className="text-xs font-light">Actualizado: {formatDate(latest.ts)}</p>}
      </CardContent>
    </Card>
  );
}
