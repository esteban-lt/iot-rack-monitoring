export const formatDate = (ts: number) =>
  new Date(ts).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
