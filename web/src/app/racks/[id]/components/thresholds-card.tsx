import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type Control, type Path } from 'react-hook-form';
import type * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { Thresholds } from '@/interfaces/thresholds';
import { useUpdateThresholds } from '../../hooks/use-update-thresholds';
import { THRESHOLD_LIMITS, thresholdsSchema } from '../../schemas/thresholds-schema';

interface Props {
  nodeId: string;
  thresholds: Thresholds;
}

type ThresholdsForm = z.infer<typeof thresholdsSchema>;

interface ThresholdFieldProps {
  control: Control<ThresholdsForm>;
  name: Path<ThresholdsForm>;
  label: string;
  description: string;
  triggerAlso?: Path<ThresholdsForm>;
}

const ThresholdField = ({ control, name, label, description, triggerAlso }: ThresholdFieldProps) => (
  <Controller
    name={name}
    control={control}
    rules={{ deps: triggerAlso }}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Input
          {...field}
          id={name}
          type="number"
          step="any"
          value={Number.isNaN(field.value) ? '' : field.value}
          onChange={(event) => field.onChange(event.target.valueAsNumber)}
          aria-invalid={fieldState.invalid}
        />
        <FieldDescription>{description}</FieldDescription>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
);

export const ThresholdsCard = ({ nodeId, thresholds }: Props) => {
  const { mutate, isPending, isSuccess, isError } = useUpdateThresholds(nodeId);

  const form = useForm<ThresholdsForm>({
    resolver: zodResolver(thresholdsSchema),
    defaultValues: thresholds,
    mode: 'onChange',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Umbrales de este rack</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((values) => mutate(values))}>
          <FieldGroup>
            <ThresholdField
              control={form.control}
              name="tiltWarnDeg"
              label="Advertencia (°)"
              description={`Entre ${THRESHOLD_LIMITS.tiltMinDeg}° y ${THRESHOLD_LIMITS.tiltMaxDeg}°`}
              triggerAlso="tiltAlarmDeg"
            />
            <ThresholdField
              control={form.control}
              name="tiltAlarmDeg"
              label="Alarma (°)"
              description={`Debe superar a la advertencia por al menos ${THRESHOLD_LIMITS.tiltMinGapDeg}°`}
            />
            <ThresholdField
              control={form.control}
              name="impactG"
              label="Impacto (g)"
              description={`Entre ${THRESHOLD_LIMITS.impactMinG} g y ${THRESHOLD_LIMITS.impactMaxG} g`}
            />
            <Button type="submit" disabled={!form.formState.isValid || isPending}>
              {isPending ? 'Guardando...' : 'Guardar umbrales'}
            </Button>
            {isSuccess && <p className="text-sm text-muted-foreground">Umbrales guardados.</p>}
            {isError && <p className="text-sm text-destructive">No se pudieron guardar los umbrales.</p>}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
