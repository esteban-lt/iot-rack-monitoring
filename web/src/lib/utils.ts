export { cn } from "cn"

export const range = (length: number) => Array.from({ length }, (_, index) => index);

export const formatDate = (ts: number) =>
  new Date(ts).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
