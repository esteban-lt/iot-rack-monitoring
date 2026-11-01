import { useState, type ReactElement } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Rack } from '@/interfaces/rack';
import { RackForm } from './rack-form';

interface Props {
  rack?: Rack;
  trigger: ReactElement;
}

export const RackFormDialog = ({ rack, trigger }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{rack ? 'Editar rack' : 'Nuevo rack'}</DialogTitle>
          <DialogDescription>El nodo se asigna solo cuando lee el tag RFID de este rack.</DialogDescription>
        </DialogHeader>
        <RackForm rack={rack} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
