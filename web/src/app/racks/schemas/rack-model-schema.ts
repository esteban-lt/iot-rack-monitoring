import * as z from 'zod';
import { DEFAULTS, DETAIL, MATERIAL_NAMES, type MaterialName } from '../lib/rack-builder';

export const MODEL_LIMITS = {
  levels: { min: 1, max: 12, step: 1 },
  uprights: { min: 2, max: DETAIL.maxUprights, step: 1 },
  maxBeamLength: { min: 1, max: 4, step: 0.1 },
  height: { min: 1, max: 10, step: 0.05 },
  width: { min: 0.8, max: 20, step: 0.05 },
  depth: { min: 0.4, max: 1.5, step: 0.05 },
  postSize: { min: 0.04, max: 0.15, step: 0.005 },
  firstLevel: { min: 0.15, max: 0.6, step: 0.01 },
  cargoDensity: { min: 0, max: 1, step: 0.05 },
};

type LimitKey = keyof typeof MODEL_LIMITS;

const limited = (key: LimitKey) => z.number().min(MODEL_LIMITS[key].min).max(MODEL_LIMITS[key].max).default(DEFAULTS[key]);

const color = (name: MaterialName) => z.string().regex(/^#[0-9a-f]{6}$/i).default(DEFAULTS.colors[name]);

export const rackModelSchema = z.object({
  version: z.literal(1).default(1),
  levels: limited('levels').pipe(z.int()),
  uprights: limited('uprights').pipe(z.int()),
  autoUprights: z.boolean().default(DEFAULTS.autoUprights),
  maxBeamLength: limited('maxBeamLength'),
  height: limited('height'),
  width: limited('width'),
  depth: limited('depth'),
  postSize: limited('postSize'),
  firstLevel: limited('firstLevel'),
  sensorPost: z.int().min(1).max(DETAIL.maxUprights).default(DEFAULTS.sensorPost),
  sensorSide: z.enum(['front', 'back']).default(DEFAULTS.sensorSide),
  sensorHeight: z.number().nullable().default(DEFAULTS.sensorHeight),
  cargoType: z.enum(['auto', 'boxes', 'pallets']).default(DEFAULTS.cargoType),
  cargoDensity: limited('cargoDensity'),
  includeCargo: z.boolean().default(DEFAULTS.includeCargo),
  colors: z.object(
    Object.fromEntries(MATERIAL_NAMES.map((name) => [name, color(name)])) as Record<MaterialName, ReturnType<typeof color>>,
  ).prefault({}),
});

export type RackModelConfig = z.infer<typeof rackModelSchema>;

export const DEFAULT_RACK_MODEL = rackModelSchema.parse({});

// Anything missing or invalid in the stored attribute falls back to the default model
export const parseRackModel = (value: unknown): RackModelConfig => {
  try {
    const result = rackModelSchema.safeParse(typeof value === 'string' ? JSON.parse(value) : value);
    return result.success ? result.data : DEFAULT_RACK_MODEL;
  } catch {
    return DEFAULT_RACK_MODEL;
  }
}
