import { describe, expect, it } from 'vitest';
import { DEFAULTS, DETAIL, levelLayout, resolveParams } from '@/app/racks/lib/rack-builder';

describe('resolveParams', () => {
  it('uses the defaults without input', () => {
    expect(resolveParams()).toMatchObject({ levels: DEFAULTS.levels, uprights: DEFAULTS.uprights });
  });

  it('limits the posts to the ones that fit in the width', () => {
    expect(resolveParams({ width: 1, uprights: 10 }).uprights).toBe(2);
  });

  it('derives the posts from the beam length when automatic', () => {
    expect(resolveParams({ width: 6, maxBeamLength: 2.7, autoUprights: true }).uprights).toBe(4);
  });

  it('keeps the sensor on an existing post and the density between 0 and 1', () => {
    const params = resolveParams({ uprights: 3, sensorPost: 9, cargoDensity: 2 });
    expect(params.sensorPost).toBe(3);
    expect(params.cargoDensity).toBe(1);
  });

  it('places the sensor just below the top by default', () => {
    expect(resolveParams({ height: 3 }).sensorHeight).toBeCloseTo(3 - DETAIL.sensorDrop);
  });
});

describe('levelLayout', () => {
  it('spaces the levels evenly from the first one', () => {
    const { spacing, heights } = levelLayout({ levels: 4, height: 2.2, firstLevel: 0.2 });

    expect(spacing).toBeCloseTo(0.5);
    expect(heights).toEqual([0.2, 0.7, 1.2, 1.7]);
  });
});
