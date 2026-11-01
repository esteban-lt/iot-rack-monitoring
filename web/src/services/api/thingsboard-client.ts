import axios, { type InternalAxiosRequestConfig } from 'axios';
import { session, type SessionTokens } from './session';

const TB_API_URL = import.meta.env.VITE_TB_API_URL;

export const thingsboardClient = axios.create({
  baseURL: TB_API_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

thingsboardClient.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) config.headers['X-Authorization'] = `Bearer ${token}`;
  return config;
});

let refreshRequest: Promise<SessionTokens> | null = null;

export const refreshSession = () => {
  refreshRequest ??= axios
    .post<SessionTokens>(`${TB_API_URL}/api/auth/token`, { refreshToken: session.getRefreshToken() })
    .then(({ data }) => {
      session.save(data);
      return data;
    })
    .finally(() => (refreshRequest = null));

  return refreshRequest;
};

thingsboardClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request: InternalAxiosRequestConfig & { isRetry?: boolean } = error.config;
    const isAuthRequest = request?.url?.startsWith('/api/auth/login');

    if (error.response?.status !== 401 || isAuthRequest || request.isRetry) throw error;

    try {
      await refreshSession();
      request.isRetry = true;
      return thingsboardClient(request);
    } catch {
      session.clear();
      window.location.assign('/login');
      throw error;
    }
  },
);
