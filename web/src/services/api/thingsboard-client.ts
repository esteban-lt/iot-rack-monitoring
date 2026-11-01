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

// Several requests can expire at the same time: they all wait for the same refresh
let refreshRequest: Promise<SessionTokens> | null = null;

const refreshSession = async () => {
  const { data } = await axios.post<SessionTokens>(`${TB_API_URL}/api/auth/token`, {
    refreshToken: session.getRefreshToken(),
  });
  session.save(data);
  return data;
};

thingsboardClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request: InternalAxiosRequestConfig & { isRetry?: boolean } = error.config;
    const isAuthRequest = request?.url?.startsWith('/api/auth/login');

    if (error.response?.status !== 401 || isAuthRequest || request.isRetry) throw error;

    try {
      refreshRequest ??= refreshSession().finally(() => (refreshRequest = null));
      await refreshRequest;
      request.isRetry = true;
      return thingsboardClient(request);
    } catch {
      session.clear();
      window.location.assign('/login');
      throw error;
    }
  },
);
