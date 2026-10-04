import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { RackSummary } from '@/interfaces/rack-summary';
import { formatDate, statusLabels } from '../utils';

interface Props {
  summary: RackSummary;
}

const badgeVariants = {
  normal: 'normal',
  warning: 'warning',
  alarm: 'danger',
  offline: 'outline',
} as const;

export const RackCard = ({ summary }: Props) => {
  const { rack, status, latest, lastImpact } = summary;

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{rack.name}</CardTitle>
        <Badge variant={badgeVariants[status]}>{statusLabels[status]}</Badge>
      </CardHeader>
      <CardContent>
        <p>{rack.location}</p>
        <p className="text-lg font-bold">
          {latest ? `${latest.tilt.toFixed(1)}° inclinación` : '— sin lectura actual'}
        </p>
        <p className="text-xs font-light">
          Último impacto: {lastImpact ? `${formatDate(lastImpact.ts)} | ${lastImpact.impactG} g` : 'sin registros recientes'}
        </p>
        <p className="text-xs font-light">
          {latest ? `Vibración: ${latest.vibRms.toFixed(2)} g | ${rack.nodeId}` : `${rack.nodeId} sin enviar datos`}
        </p>
        {latest && <p className="text-xs font-light">Actualizado: {formatDate(latest.ts)}</p>}
      </CardContent>
    </Card>
  );
}
