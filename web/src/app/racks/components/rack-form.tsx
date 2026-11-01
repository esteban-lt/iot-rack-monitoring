import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type Control, type Path } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { Rack } from '@/interfaces/rack';
import { formatDate } from '@/lib/utils';
import { useRacks } from '../hooks/use-racks';
import { useRfidLinks } from '../hooks/use-rfid-links';
import { useSaveRack } from '../hooks/use-save-rack';
import { createRackSchema, normalizeRfidUid, type RackFormValues } from '../schemas/rack-schema';

interface Props {
  rack?: Rack;
  onSaved: () => void;
}

interface TextFieldProps {
  control: Control<RackFormValues>;
  name: Path<RackFormValues>;
  label: string;
  placeholder: string;
  className?: string;
  normalize?: (value: string) => string;
}

const TextField = ({ control, name, label, placeholder, className, normalize }: TextFieldProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Input
          {...field}
          id={name}
          placeholder={placeholder}
          className={className}
          onChange={(event) => field.onChange(normalize ? normalize(event.target.value) : event.target.value)}
          aria-invalid={fieldState.invalid}
        />
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
);

export const RackForm = ({ rack, onSaved }: Props) => {
  const { data: racks = [] } = useRacks();
  const { data: links } = useRfidLinks();
  const { mutate, isPending, isError } = useSaveRack(rack?.id);

  const form = useForm<RackFormValues>({
    resolver: zodResolver(createRackSchema(racks, rack?.id)),
    defaultValues: { name: rack?.name ?? '', location: rack?.location ?? '', rfidUid: rack?.rfidUid ?? '' },
    mode: 'onChange',
  });

  const detectedTags = links?.detectedTags ?? [];

  return (
    <form onSubmit={form.handleSubmit((values) => mutate(values, { onSuccess: onSaved }))} className="grid gap-4">
      <FieldGroup>
        <TextField control={form.control} name="name" label="Nombre del rack" placeholder="Ej. D-01" />
        <TextField control={form.control} name="location" label="Ubicación" placeholder="Ej. Pasillo D" />
        <TextField
          control={form.control}
          name="rfidUid"
          label="UID del tag RFID"
          placeholder="Ej. 69404E06"
          className="font-mono"
          normalize={normalizeRfidUid}
        />
        <Field>
          <FieldLabel>Tags detectados sin rack</FieldLabel>
          {detectedTags.length ? (
            detectedTags.map((tag) => (
              <div key={tag.uid} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  <span className="font-mono">{tag.uid}</span>
                  <span className="text-muted-foreground"> · {tag.nodeName} · {formatDate(tag.ts)}</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue('rfidUid', tag.uid, { shouldValidate: true })}
                >
                  Usar
                </Button>
              </div>
            ))
          ) : (
            <FieldDescription>Acerca un nodo al tag del rack y su UID aparecerá aquí.</FieldDescription>
          )}
        </Field>
        {isError && <p className="text-sm text-destructive">No se pudo guardar el rack.</p>}
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={!form.formState.isValid || isPending}>
          {isPending ? 'Guardando...' : 'Guardar rack'}
        </Button>
      </DialogFooter>
    </form>
  );
}
