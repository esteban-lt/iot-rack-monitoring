import { useSyncExternalStore } from 'react';
import { thingsboardSocket } from '@/services/api/thingsboard-socket';

export const useSocketStatus = () =>
  useSyncExternalStore(thingsboardSocket.onStatusChange, thingsboardSocket.getStatus);
