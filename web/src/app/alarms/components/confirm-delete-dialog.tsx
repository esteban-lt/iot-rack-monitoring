import { useState, type ReactElement } from 'react';
import { Button } from '@/components/ui/button';
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

interface Props {
  count: number;
  trigger: ReactElement;
  onConfirm: () => void;
}

export const ConfirmDeleteDialog = ({ count, trigger, onConfirm }: Props) => {
  const [open, setOpen] = useState(false);
  const label = count === 1 ? 'esta alarma' : `estas ${count} alarmas`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar {count === 1 ? 'alarma' : 'alarmas'}</DialogTitle>
          <DialogDescription>
            Se eliminará {label} de ThingsBoard de forma permanente. Si la condición que la generó sigue presente, se
            volverá a crear una alarma nueva.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
