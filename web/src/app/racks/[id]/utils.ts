import type { HistoryRange } from '../interfaces/rack-history';

export const formatTick = (ts: number, range: HistoryRange) =>
  range === '7d'
    ? new Date(ts).toLocaleDateString('es', { day: '2-digit', month: '2-digit' })
    : new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
