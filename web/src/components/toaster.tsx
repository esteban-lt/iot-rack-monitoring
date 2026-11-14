import type { CSSProperties } from 'react';
import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/hooks/use-theme';

export const Toaster = () => {
  const [theme] = useTheme();

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
      } as CSSProperties}
    />
  );
}
