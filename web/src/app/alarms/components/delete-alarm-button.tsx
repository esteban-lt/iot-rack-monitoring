import { Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteAlarms } from '../hooks/use-delete-alarms';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';

interface Props {
  alarmId: string;
}

export const DeleteAlarmButton = ({ alarmId }: Props) => {
  const { mutate, isPending } = useDeleteAlarms();

  return (
    <ConfirmDeleteDialog
      count={1}
      onConfirm={() => mutate([alarmId])}
      trigger={
        <Button variant="ghost" size="icon" disabled={isPending} aria-label="Eliminar alarma">
          <Trash2Icon />
        </Button>
      }
    />
  );
}
