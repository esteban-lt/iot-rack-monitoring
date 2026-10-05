import type { RackStatus, RackSummary } from '@/interfaces/rack-summary';

export const statusLabels: Record<RackStatus, string> = {
  normal: 'Normal',
  warning: 'Advertencia',
  alarm: 'Alarma',
  offline: 'Sin conexión',
};

export const badgeVariants = {
  normal: 'normal',
  warning: 'warning',
  alarm: 'danger',
  offline: 'outline',
} as const;

export const countByStatus = (summaries: RackSummary[], status: RackStatus) =>
  summaries.filter((summary) => summary.status === status).length;
