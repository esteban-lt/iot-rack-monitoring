import { useState } from 'react';

const STORAGE_KEY = 'tilt_highlight';

export const useTiltHighlight = () => {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  const toggle = (value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value));
    setEnabled(value);
  };

  return [enabled, toggle] as const;
}
