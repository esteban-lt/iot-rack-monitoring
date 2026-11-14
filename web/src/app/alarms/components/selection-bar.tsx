import { Button } from '@/components/ui/button';
import type { Alarm } from '@/interfaces/alarm';
import type { BatchResult } from '@/lib/run-in-batches';
import { useAcknowledgeAlarms } from '../hooks/use-acknowledge-alarms';
import { useDeleteAlarms } from '../hooks/use-delete-alarms';
import { isUnack } from '../utils';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';

interface Props {
  selected: Alarm[];
  onDone: () => void;
}

const failureMessage = (result?: BatchResult) =>
  result?.failed ? `No se pudieron procesar ${result.failed} de ${result.done + result.failed} alarmas.` : undefined;

export const SelectionBar = ({ selected, onDone }: Props) => {
  const acknowledge = useAcknowledgeAlarms();
  const remove = useDeleteAlarms();
  const unackIds = selected.filter(isUnack).map(({ id }) => id);
  const isPending = acknowledge.isPending || remove.isPending;
  // On partial failures the selection stays, so the message remains visible and the rest can be retried
  const clearIfAllDone = (result: BatchResult) => !result.failed && onDone();
  const error = acknowledge.isError || remove.isError
    ? 'No se pudo completar la acción.'
    : failureMessage(acknowledge.data) ?? failureMessage(remove.data);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
      <span className="px-2">{selected.length} {selected.length === 1 ? 'seleccionada' : 'seleccionadas'}</span>
      <Button
        variant="outline"
        disabled={isPending || !unackIds.length}
        onClick={() => acknowledge.mutate(unackIds, { onSuccess: clearIfAllDone })}
      >
        {acknowledge.isPending ? 'Reconociendo...' : `Reconocer (${unackIds.length})`}
      </Button>
      <ConfirmDeleteDialog
        count={selected.length}
        onConfirm={() => remove.mutate(selected.map(({ id }) => id), { onSuccess: clearIfAllDone })}
        trigger={
          <Button variant="destructive" disabled={isPending}>
            {remove.isPending ? 'Eliminando...' : `Eliminar (${selected.length})`}
          </Button>
        }
      />
      <Button variant="ghost" disabled={isPending} onClick={onDone}>Quitar selección</Button>
      {error && <span className="text-destructive">{error}</span>}
    </div>
  );
}
