import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { NodeControl } from '@/interfaces/node-control';
import type { RackStatus } from '@/interfaces/rack-summary';
import { formatDate } from '@/lib/utils';
import { NodeCommandRejectedError } from '../../actions/send-node-command-action';
import { useNodeControl } from '../../hooks/use-node-control';
import { useSendNodeCommand } from '../../hooks/use-send-node-command';

interface Props {
  nodeId: string;
  status: RackStatus;
}

const calibrationLabel = (control: NodeControl | undefined) => {
  switch (control?.calibrationStatus) {
    case 'scheduled':
    case 'running':
      return 'Calibrando... mantén el rack quieto.';
    case 'failed':
      return 'La última calibración falló porque el rack se estaba moviendo. Inténtalo de nuevo.';
    case 'ok':
      return control.calibratedAt ? `Calibrado el ${formatDate(control.calibratedAt)}` : 'Calibrado';
    default:
      return control?.calibrated ? 'Calibrado' : 'Sin calibrar';
  }
}

const errorMessage = (error: unknown) => {
  if (error instanceof NodeCommandRejectedError) return 'El nodo rechazó el comando. Puede haber una calibración en curso.';
  if (isAxiosError(error)) {
    const code = error.response?.status;
    if (code === 409) return 'El nodo está sin conexión.';
    if (code === 408 || code === 504 || error.code === 'ECONNABORTED') return 'El nodo no respondió a tiempo.';
  }
  return 'No se pudo enviar el comando.';
}

export const NodeControlCard = ({ nodeId, status }: Props) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: control } = useNodeControl(nodeId);
  const { mutate, isPending, isError, isSuccess, error, variables } = useSendNodeCommand(nodeId);

  const offline = status === 'offline';
  const calibrating = control?.calibrationStatus === 'scheduled' || control?.calibrationStatus === 'running';
  const buzzerEnabled = control?.buzzerEnabled ?? true;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control del nodo</CardTitle>
        <CardDescription>
          {offline ? 'El nodo está sin conexión; los comandos no están disponibles.' : 'Comandos enviados directamente al nodo.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Buzzer: {buzzerEnabled ? 'activado' : 'desactivado'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={offline || isPending}
              onClick={() => mutate({ method: 'setBuzzer', enabled: !buzzerEnabled })}
            >
              {buzzerEnabled ? 'Desactivar buzzer' : 'Activar buzzer'}
            </Button>
            <Button
              variant="outline"
              disabled={offline || isPending || status !== 'alarm'}
              onClick={() => mutate({ method: 'silenceAlarm' })}
            >
              Silenciar alarma
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{calibrationLabel(control)}</p>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger
              render={<Button variant="outline" className="w-fit" disabled={offline || isPending || calibrating} />}
            >
              Calibrar cero
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Calibrar cero</DialogTitle>
                <DialogDescription>
                  El nodo tomará la posición actual del rack como vertical (0°). Hazlo solo con el rack a plomo, el nodo
                  fijo y sin movimiento. Tarda unos 5 segundos.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                <Button
                  onClick={() => {
                    mutate({ method: 'calibrate' });
                    setConfirmOpen(false);
                  }}
                >
                  Calibrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isError && <p className="text-sm text-destructive">{errorMessage(error)}</p>}
        {isSuccess && variables?.method === 'silenceAlarm' && (
          <p className="text-sm text-muted-foreground">Alarma silenciada.</p>
        )}
      </CardContent>
    </Card>
  );
}
