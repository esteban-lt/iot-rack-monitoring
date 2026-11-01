import { thingsboardClient } from '@/services/api/thingsboard-client';
import type { SessionTokens } from '@/services/api/session';
import type { GetCurrentUserResponse } from '../interfaces/get-current-user-response';

export const authApi = {
  login: async (username: string, password: string): Promise<SessionTokens> => {
    const { data } = await thingsboardClient.post('/api/auth/login', { username, password });
    return data;
  },

  getCurrentUser: async (): Promise<GetCurrentUserResponse> => {
    const { data } = await thingsboardClient.get('/api/auth/user');
    return data;
  },

  logout: async (): Promise<void> => {
    await thingsboardClient.post('/api/auth/logout');
  },
};
