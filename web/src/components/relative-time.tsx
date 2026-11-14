import { useEffect, useState } from 'react';
import { formatDistanceStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatDate } from '@/lib/utils';

const REFRESH_MS = 5000;

// "hace 12 segundos", refreshed on its own; the exact date shows on hover
export const RelativeTime = ({ ts }: { ts: number }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <time dateTime={new Date(ts).toISOString()} title={formatDate(ts)}>
      {formatDistanceStrict(ts, Math.max(now, ts), { locale: es, addSuffix: true })}
    </time>
  );
}
