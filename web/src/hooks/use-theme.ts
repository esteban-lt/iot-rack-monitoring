import { useSyncExternalStore } from 'react';
import { themeStore } from '@/lib/theme';

export const useTheme = () => {
  const theme = useSyncExternalStore(themeStore.subscribe, themeStore.getTheme);
  return [theme, themeStore.setTheme] as const;
};
