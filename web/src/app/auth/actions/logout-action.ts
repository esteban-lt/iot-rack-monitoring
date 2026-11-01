import { session } from '@/services/api/session';
import { thingsboardSocket } from '@/services/api/thingsboard-socket';
import { authApi } from '../api/auth-api';

export const logoutAction = async () => {
  thingsboardSocket.disconnect();
  // The local session is cleared even if ThingsBoard can't be reached
  await authApi.logout().catch(() => undefined);
  session.clear();
}
