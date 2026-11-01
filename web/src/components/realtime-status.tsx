import { Badge } from '@/components/ui/badge';
import { useSocketStatus } from '@/hooks/use-socket-status';
import type { SocketStatus } from '@/services/api/thingsboard-socket';

const labels: Record<SocketStatus, string> = {
  connected: 'Tiempo real',
  connecting: 'Conectando...',
  disconnected: 'Sin tiempo real',
};

const variants = {
  connected: 'normal',
  connecting: 'warning',
  disconnected: 'outline',
} as const;

export const RealtimeStatus = () => {
  const status = useSocketStatus();

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
