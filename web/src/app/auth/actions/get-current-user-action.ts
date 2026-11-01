import { authApi } from '../api/auth-api';
import type { User } from '../interfaces/user';

export const getCurrentUserAction = async (): Promise<User> => {
  const { email, firstName, lastName } = await authApi.getCurrentUser();
  const name = [firstName, lastName].filter(Boolean).join(' ');

  return { name: name || email, email };
}
