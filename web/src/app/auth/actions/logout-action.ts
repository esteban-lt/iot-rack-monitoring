import { session } from '@/services/api/session';
import { authApi } from '../api/auth-api';

export const logoutAction = async () => {
  // The local session is cleared even if ThingsBoard can't be reached
  await authApi.logout().catch(() => undefined);
  session.clear();
}
