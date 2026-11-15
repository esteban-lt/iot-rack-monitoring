import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface Props {
  factor: number;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}

export const HighlightToggle = ({ factor, pressed, onPressedChange }: Props) => {
  return (
    <Toggle
      variant="outline"
      size="sm"
      pressed={pressed}
      onPressedChange={onPressedChange}
      title="Muestra un contorno con la inclinación multiplicada para que se note a simple vista"
    >
      {pressed ? <EyeIcon /> : <EyeOffIcon />}
      Realzar ×{factor}
    </Toggle>
  );
}
