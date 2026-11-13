import { lazy, Suspense } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RackSummary } from '@/interfaces/rack-summary';
import { useRackModel } from '../../hooks/use-rack-model';

const RackScene = lazy(() => import('../../components/rack-3d/rack-scene'));

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
  const { rack, status, latest, lastImpact } = summary;
  const { data: config } = useRackModel(rack.id);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Vista 3D del rack</CardTitle>
        <CardDescription>Arrastra para rotar</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to={`/racks/${rack.id}/model`} />}>
            Personalizar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="relative min-h-72 flex-1">
          <div className="absolute inset-0">
            <Suspense fallback={<Skeleton className="size-full" />}>
              {config ? (
                <RackScene
                  config={config}
                  tiltX={latest?.tiltX ?? 0}
                  tiltY={latest?.tiltY ?? 0}
                  status={status}
                  impact={lastImpact}
                />
              ) : (
                <Skeleton className="size-full" />
              )}
            </Suspense>
          </div>
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
