const TOKEN_KEY = 'tb_token';
const REFRESH_TOKEN_KEY = 'tb_refresh_token';

export interface SessionTokens {
  token: string;
  refreshToken: string;
}

export const session = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  save: ({ token, refreshToken }: SessionTokens) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
