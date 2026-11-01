import { session } from '@/services/api/session';
import { authApi } from '../api/auth-api';
import type { LoginFormValues } from '../schemas/login-schema';

export const loginAction = async ({ email, password }: LoginFormValues) => {
  session.save(await authApi.login(email, password));
}
