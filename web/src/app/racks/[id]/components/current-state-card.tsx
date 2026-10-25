import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RackSummary } from '@/interfaces/rack-summary';
import { formatDate } from '@/lib/utils';

interface Props {
  summary: RackSummary;
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export const CurrentStateCard = ({ summary }: Props) => {
  const { rack, latest, lastImpact } = summary;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado actual</CardTitle>
        <CardDescription>
          {latest ? `Actualizado: ${formatDate(latest.ts)}` : 'Sin lectura actual'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-5xl font-bold">
          {latest ? `${latest.tilt.toFixed(1)}°` : '—'}
          <span className="ml-2 text-sm font-normal text-muted-foreground">inclinación total</span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Inclinación en X" value={latest ? `${latest.tiltX.toFixed(1)}°` : '—'} />
          <Stat label="Inclinación en Y" value={latest ? `${latest.tiltY.toFixed(1)}°` : '—'} />
          <Stat label="Vibración (RMS)" value={latest ? `${latest.vibRms.toFixed(2)} g` : '—'} />
          <Stat
            label={lastImpact ? `Último impacto · ${formatDate(lastImpact.ts)}` : 'Último impacto'}
            value={lastImpact ? `${lastImpact.impactG} g` : 'Sin registros'}
          />
          <Stat label="ax" value={latest ? `${latest.accelX.toFixed(2)} g` : '—'} />
          <Stat label="ay" value={latest ? `${latest.accelY.toFixed(2)} g` : '—'} />
          <Stat label="az" value={latest ? `${latest.accelZ.toFixed(2)} g` : '—'} />
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Nodo asignado: {rack.nodeName ?? 'Sin asignar'}</p>
          <p>Tag RFID del rack: {rack.rfidUid ?? '—'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
