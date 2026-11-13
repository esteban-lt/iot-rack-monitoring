import { lazy, Suspense, useDeferredValue, useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RackImpact } from '../../../components/rack-3d/rack-model';
import { useSaveRackModel } from '../../../hooks/use-save-rack-model';
import { resolveParams } from '../../../lib/rack-builder';
import { DEFAULT_RACK_MODEL, type RackModelConfig } from '../../../schemas/rack-model-schema';
import { ModelControls } from './model-controls';
import { SliderField } from './slider-field';

const RackScene = lazy(() => import('../../../components/rack-3d/rack-scene'));

interface Props {
  rackId: string;
  rackName: string;
  initialConfig: RackModelConfig;
}

const degrees = (value: number) => `${value}°`;

export const ModelEditor = ({ rackId, rackName, initialConfig }: Props) => {
  const navigate = useNavigate();
  const rackPath = `/racks/${rackId}`;
  const [config, setConfig] = useState(initialConfig);
  const [simulation, setSimulation] = useState({ tiltX: 0, tiltY: 0, impactG: 2 });
  const [impact, setImpact] = useState<RackImpact>();
  const previewConfig = useDeferredValue(config);
  const { mutate, isPending, isError } = useSaveRackModel(rackId);

  const update = (changes: Partial<RackModelConfig>) => {
    const before = resolveParams(config);
    const next = { ...config, ...changes };
    // A sensor sitting on the last post stays on the last post when the post count changes
    if (!changes.sensorPost && before.sensorPost === before.uprights) next.sensorPost = resolveParams(next).uprights;
    setConfig(next);
  };

  const hit = (direction: RackImpact['direction']) => setImpact({ ts: Date.now(), impactG: simulation.impactG, direction });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" nativeButton={false} render={<Link to={rackPath} />}>
            <ArrowLeftIcon />
          </Button>
          <h1 className="text-xl font-semibold">Modelo 3D · Rack {rackName}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isError && <p className="text-sm text-destructive">No se pudo guardar el modelo.</p>}
          <Button variant="outline" onClick={() => setConfig(DEFAULT_RACK_MODEL)}>Restablecer</Button>
          <Button variant="outline" nativeButton={false} render={<Link to={rackPath} />}>Cancelar</Button>
          <Button disabled={isPending} onClick={() => mutate(config, { onSuccess: () => navigate(rackPath) })}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <Card className="lg:sticky lg:top-4">
          <CardContent className="h-[70vh]">
            <Suspense fallback={<Skeleton className="size-full" />}>
              <RackScene
                config={previewConfig}
                tiltX={simulation.tiltX}
                tiltY={simulation.tiltY}
                status="ok"
                impact={impact}
              />
            </Suspense>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <ModelControls config={config} onChange={update} />

          <Card>
            <CardHeader>
              <CardTitle>Simulación</CardTitle>
              <CardDescription>Solo afecta esta vista previa; no se guarda.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <SliderField
                label="Inclinación frontal"
                value={simulation.tiltX}
                min={-12}
                max={12}
                step={0.5}
                format={degrees}
                onChange={(tiltX) => setSimulation({ ...simulation, tiltX })}
              />
              <SliderField
                label="Inclinación lateral"
                value={simulation.tiltY}
                min={-12}
                max={12}
                step={0.5}
                format={degrees}
                onChange={(tiltY) => setSimulation({ ...simulation, tiltY })}
              />
              <SliderField
                label="Fuerza del golpe"
                value={simulation.impactG}
                min={0.5}
                max={5}
                step={0.5}
                format={(value) => `${value} g`}
                onChange={(impactG) => setSimulation({ ...simulation, impactG })}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => hit([0, -1])}>Golpe frontal</Button>
                <Button variant="outline" onClick={() => hit([Math.random() < 0.5 ? -1 : 1, 0])}>Golpe lateral</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
