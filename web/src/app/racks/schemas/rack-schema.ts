import * as z from 'zod';
import type { RackSummary } from '@/interfaces/rack-summary';

const RFID_UID_PATTERN = /^([0-9A-F]{8}|[0-9A-F]{14}|[0-9A-F]{20})$/;

export const normalizeRfidUid = (value: string) => value.toUpperCase().replace(/[^0-9A-F]/g, '');

export const createRackSchema = (racks: RackSummary[], rackId?: string) => {
  const otherRacks = racks.filter(({ rack }) => rack.id !== rackId).map(({ rack }) => rack);

  return z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Ingresa el nombre del rack')
      .refine((name) => !otherRacks.some((rack) => rack.name.toLowerCase() === name.toLowerCase()), 'Ya existe un rack con ese nombre'),
    location: z.string().trim().min(1, 'Ingresa la ubicación'),
    rfidUid: z
      .string()
      .regex(RFID_UID_PATTERN, 'Debe tener 8, 14 o 20 caracteres hexadecimales')
      .refine((uid) => !otherRacks.some((rack) => rack.rfidUid === uid), 'Ese UID ya pertenece a otro rack'),
  });
};

export type RackFormValues = z.infer<ReturnType<typeof createRackSchema>>;
