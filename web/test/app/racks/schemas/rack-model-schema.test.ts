import { describe, expect, it } from 'vitest';
import { DEFAULT_RACK_MODEL, parseRackModel } from '@/app/racks/schemas/rack-model-schema';

describe('parseRackModel', () => {
  it('reads a stored JSON string', () => {
    const model = parseRackModel(JSON.stringify({ levels: 6, sensorSide: 'back' }));
    expect(model).toMatchObject({ levels: 6, sensorSide: 'back' });
  });

  it('fills missing fields and colors with the defaults', () => {
    const model = parseRackModel({ height: 3, colors: { Beam_Orange: '#123456' } });

    expect(model.height).toBe(3);
    expect(model.width).toBe(DEFAULT_RACK_MODEL.width);
    expect(model.colors.Beam_Orange).toBe('#123456');
    expect(model.colors.Frame_Steel).toBe(DEFAULT_RACK_MODEL.colors.Frame_Steel);
  });

  it('falls back to the default model on invalid data', () => {
    expect(parseRackModel('{not json')).toEqual(DEFAULT_RACK_MODEL);
    expect(parseRackModel({ levels: 50 })).toEqual(DEFAULT_RACK_MODEL);
    expect(parseRackModel({ colors: { Beam_Orange: 'orange' } })).toEqual(DEFAULT_RACK_MODEL);
    expect(parseRackModel(undefined)).toEqual(DEFAULT_RACK_MODEL);
  });
});
