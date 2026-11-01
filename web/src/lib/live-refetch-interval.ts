import { thingsboardSocket } from '@/services/api/thingsboard-socket';

export const liveRefetchInterval = () =>
  thingsboardSocket.getStatus() === 'connected' ? 1000 * 60 * 5 : 1000 * 30;
