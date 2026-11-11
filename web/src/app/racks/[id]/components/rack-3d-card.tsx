import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RackSummary } from '@/interfaces/rack-summary';

interface Props {
  summary: RackSummary;
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border p-3">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export const Rack3DCard = ({ summary }: Props) => {
  const { latest } = summary;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Vista 3D del rack</CardTitle>
        <CardDescription>Próximamente</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex min-h-72 flex-1 items-center justify-center text-sm text-muted-foreground">
          Aquí irá el componente 3D.
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="ax" value={latest ? `${latest.accelX.toFixed(2)} g` : '—'} />
          <Stat label="ay" value={latest ? `${latest.accelY.toFixed(2)} g` : '—'} />
          <Stat label="az" value={latest ? `${latest.accelZ.toFixed(2)} g` : '—'} />
        </div>
      </CardContent>
    </Card>
  );
}
