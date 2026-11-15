import { formatDate } from '@/lib/utils';
import type { HistoryRange } from '../interfaces/rack-history';

export const formatTick = (ts: number, range: HistoryRange) =>
  range === '7d'
    ? new Date(ts).toLocaleDateString('es', { day: '2-digit', month: '2-digit' })
    : new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

// The tooltip passes the series label, so the time comes from the hovered point
export const tooltipTime = (_: unknown, [item]: readonly { payload?: { ts: number } }[]) =>
  item?.payload ? formatDate(item.payload.ts) : '';
