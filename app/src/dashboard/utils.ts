import type { RackStatus, RackSummary } from '@/interfaces/rack-summary';

export const statusLabels: Record<RackStatus, string> = {
  normal: 'Normal',
  warning: 'Advertencia',
  alarm: 'Alarma',
  offline: 'Sin conexión',
};

export const countByStatus = (summaries: RackSummary[], status: RackStatus) =>
  summaries.filter((summary) => summary.status === status).length;

export const formatDate = (ts: number) =>
  new Date(ts).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
