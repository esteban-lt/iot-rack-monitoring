import { describe, expect, it } from 'vitest';
import { thresholdsSchema } from '@/app/racks/schemas/thresholds-schema';

const valid = { tiltWarnDeg: 5, tiltAlarmDeg: 10, impactG: 2 };

const errorPaths = (input: object) =>
  thresholdsSchema.safeParse(input).error?.issues.map(({ path }) => path.join('.')) ?? [];

describe('thresholdsSchema', () => {
  it('accepts values within the limits', () => {
    expect(thresholdsSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects values outside the limits', () => {
    expect(errorPaths({ ...valid, tiltWarnDeg: 0 })).toContain('tiltWarnDeg');
    expect(errorPaths({ ...valid, tiltAlarmDeg: 91 })).toContain('tiltAlarmDeg');
    expect(errorPaths({ ...valid, impactG: 1 })).toEqual(['impactG']);
    expect(errorPaths({ ...valid, impactG: 4.5 })).toEqual(['impactG']);
  });

  it('requires the alarm to be at least 1° above the warning', () => {
    expect(errorPaths({ ...valid, tiltAlarmDeg: 5.5 })).toEqual(['tiltAlarmDeg']);
    expect(errorPaths({ ...valid, tiltAlarmDeg: 6 })).toEqual([]);
  });
});
