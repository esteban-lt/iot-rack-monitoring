import type { ComponentProps } from 'react';

// Rack with two uprights, three levels and the sensor node (dot) on the right post
export const AppLogo = (props: ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 3v18M17 3v18M5 7h12M5 12h12M5 17h12" />
    <circle cx="20.5" cy="5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
