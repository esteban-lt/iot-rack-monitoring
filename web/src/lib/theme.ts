export type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';
const THEMES: Theme[] = ['system', 'light', 'dark'];

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set<() => void>();

const readTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme;
  return THEMES.includes(stored) ? stored : 'system';
};

let theme = readTheme();

const applyTheme = () => {
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark.matches);
  document.documentElement.classList.toggle('dark', isDark);
};

applyTheme();
prefersDark.addEventListener('change', applyTheme);

export const themeStore = {
  getTheme: () => theme,

  setTheme: (nextTheme: Theme) => {
    theme = nextTheme;
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme();
    listeners.forEach((listener) => listener());
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
