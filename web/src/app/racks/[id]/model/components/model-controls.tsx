import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DETAIL, levelLayout, MATERIAL_NAMES, resolveParams, wantedUprights, type MaterialName } from '../../../lib/rack-builder';
import { MODEL_LIMITS, type RackModelConfig } from '../../../schemas/rack-model-schema';
import { SliderField } from './slider-field';

interface Props {
  config: RackModelConfig;
  onChange: (changes: Partial<RackModelConfig>) => void;
}

const materialLabels: Record<MaterialName, string> = {
  Frame_Steel: 'Estructura',
  Beam_Orange: 'Vigas',
  Shelf_Deck: 'Plataformas',
  Cargo_Box: 'Cargas',
  Sensor_Body: 'Caja del sensor',
  Sensor_Status: 'LED (estado normal)',
};

const sides = [
  { value: 'front', label: 'Frente' },
  { value: 'back', label: 'Atrás' },
] as const;

const cargoTypes = [
  { value: 'auto', label: 'Automático' },
  { value: 'boxes', label: 'Cajas' },
  { value: 'pallets', label: 'Tarimas' },
] as const;

const meters = (value: number) => `${value.toFixed(2)} m`;

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="grid gap-4">{children}</CardContent>
  </Card>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-center justify-between gap-2 text-sm">
    {label}
    {children}
  </div>
);

const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <label className="flex items-center gap-2 text-sm">
    <input type="checkbox" className="accent-primary" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    {label}
  </label>
);

const Note = ({ children }: { children: ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>;

export const ModelControls = ({ config, onChange }: Props) => {
  const resolved = resolveParams(config);
  const { spacing } = levelLayout(config);
  const wanted = wantedUprights(config);
  const bays = resolved.uprights - 1;
  const beamLength = (resolved.width - resolved.postSize) / bays - resolved.postSize;

  const posts = Array.from({ length: resolved.uprights }, (_, index) => ({
    value: index + 1,
    label: `Poste ${index + 1}${index === 0 ? ' (izquierda)' : index === bays ? ' (derecha)' : ''}`,
  }));

  return (
    <>
      <Section title="Medidas">
        <SliderField label="Niveles de carga" value={config.levels} {...MODEL_LIMITS.levels} onChange={(levels) => onChange({ levels })} />
        <SliderField
          label="Postes a lo ancho"
          value={resolved.uprights}
          {...MODEL_LIMITS.uprights}
          disabled={config.autoUprights}
          onChange={(uprights) => onChange({ uprights })}
        />
        <Checkbox
          label="Postes automáticos según el largo máximo de viga"
          checked={config.autoUprights}
          onChange={(autoUprights) => onChange({ autoUprights, uprights: resolved.uprights })}
        />
        {config.autoUprights && (
          <SliderField
            label="Largo máximo de viga"
            value={config.maxBeamLength}
            {...MODEL_LIMITS.maxBeamLength}
            format={meters}
            onChange={(maxBeamLength) => onChange({ maxBeamLength })}
          />
        )}
        <SliderField label="Alto total" value={config.height} {...MODEL_LIMITS.height} format={meters} onChange={(height) => onChange({ height })} />
        <SliderField label="Ancho" value={config.width} {...MODEL_LIMITS.width} format={meters} onChange={(width) => onChange({ width })} />
        <SliderField label="Fondo" value={config.depth} {...MODEL_LIMITS.depth} format={meters} onChange={(depth) => onChange({ depth })} />
        <SliderField
          label="Grosor de postes"
          value={config.postSize}
          {...MODEL_LIMITS.postSize}
          format={(value) => `${(value * 100).toFixed(1)} cm`}
          onChange={(postSize) => onChange({ postSize })}
        />
        <SliderField
          label="Altura del primer nivel"
          value={config.firstLevel}
          {...MODEL_LIMITS.firstLevel}
          format={meters}
          onChange={(firstLevel) => onChange({ firstLevel })}
        />
        <Note>
          Separación entre niveles: {meters(spacing)} · {bays} {bays === 1 ? 'tramo' : 'tramos'} con vigas de {meters(beamLength)}
        </Note>
        {resolved.uprights < wanted && (
          <p className="text-sm text-destructive">En este ancho solo caben {resolved.uprights} postes de los {wanted} necesarios.</p>
        )}
        {spacing < DETAIL.beamHeight + 0.09 && (
          <p className="text-sm text-destructive">Los niveles quedan muy juntos. Reduce niveles o aumenta el alto total.</p>
        )}
      </Section>

      <Section title="Nodo sensor">
        <Row label="Poste">
          <Select items={posts} value={resolved.sensorPost} onValueChange={(sensorPost) => onChange({ sensorPost: sensorPost! })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {posts.map((post) => (
                <SelectItem key={post.value} value={post.value}>{post.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Cara">
          <ToggleGroup
            variant="outline"
            value={[config.sensorSide]}
            onValueChange={([sensorSide]) => sensorSide && onChange({ sensorSide: sensorSide as RackModelConfig['sensorSide'] })}
          >
            {sides.map((side) => (
              <ToggleGroupItem key={side.value} value={side.value}>{side.label}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Row>
        <SliderField
          label="Altura sobre el suelo"
          value={+resolved.sensorHeight.toFixed(2)}
          min={0.2}
          max={+(config.height - 0.12).toFixed(2)}
          step={0.01}
          format={meters}
          onChange={(sensorHeight) => onChange({ sensorHeight })}
        />
        <Note>Los postes se cuentan de izquierda a derecha vistos desde el pasillo. Coloca el sensor donde está el nodo real.</Note>
      </Section>

      <Section title="Carga">
        <Checkbox label="Mostrar cargas" checked={config.includeCargo} onChange={(includeCargo) => onChange({ includeCargo })} />
        <Row label="Tipo">
          <ToggleGroup
            variant="outline"
            value={[config.cargoType]}
            onValueChange={([cargoType]) => cargoType && onChange({ cargoType: cargoType as RackModelConfig['cargoType'] })}
          >
            {cargoTypes.map((type) => (
              <ToggleGroupItem key={type.value} value={type.value}>{type.label}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Row>
        <SliderField
          label="Densidad de carga"
          value={config.cargoDensity}
          {...MODEL_LIMITS.cargoDensity}
          format={(value) => `${Math.round(value * 100)} %`}
          onChange={(cargoDensity) => onChange({ cargoDensity })}
        />
        <Note>En automático se usan tarimas cuando el nivel tiene al menos 70 cm libres, y cajas sueltas si no.</Note>
      </Section>

      <Section title="Colores">
        <div className="grid grid-cols-2 gap-2">
          {MATERIAL_NAMES.map((name) => (
            <label key={name} className="flex items-center gap-2 text-sm">
              <input
                type="color"
                value={config.colors[name]}
                onChange={(event) => onChange({ colors: { ...config.colors, [name]: event.target.value } })}
              />
              {materialLabels[name]}
            </label>
          ))}
        </div>
      </Section>
    </>
  );
}
