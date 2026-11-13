interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export const SliderField = ({ label, value, min, max, step, format = String, disabled, onChange }: Props) => {
  return (
    <label className="grid gap-1 text-sm">
      <span className="flex justify-between">
        {label}
        <span className="text-muted-foreground">{format(value)}</span>
      </span>
      <input
        type="range"
        className="accent-primary"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(event) => onChange(event.target.valueAsNumber)}
      />
    </label>
  );
}
