import type { RackStatus, RackSummary } from '@/interfaces/rack-summary';

export const statusLabels: Record<RackStatus, string> = {
  ok: 'Normal',
  warning: 'Advertencia',
  alarm: 'Alarma',
  offline: 'Sin conexión',
};

export const badgeVariants = {
  ok: 'normal',
  warning: 'warning',
  alarm: 'danger',
  offline: 'outline',
} as const;

export const countByStatus = (summaries: RackSummary[], status: RackStatus) =>
  summaries.filter((summary) => summary.status === status).length;

const VALID_STATUSES: RackStatus[] = ['ok', 'warning', 'alarm', 'offline'];

export const resolveRackStatus = (rawStatus: string | undefined, isActive: boolean): RackStatus => {
  if (!isActive) return 'offline';
  if (VALID_STATUSES.includes(rawStatus as RackStatus)) return rawStatus as RackStatus;
  return 'offline';
}
