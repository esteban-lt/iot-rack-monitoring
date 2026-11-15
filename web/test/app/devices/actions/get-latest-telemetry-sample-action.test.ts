import { describe, expect, it } from 'vitest';
import { toTelemetrySample } from '@/app/devices/actions/get-latest-telemetry-sample-action';

const series = (value: string | number, ts = 1000) => [{ ts, value: String(value) }];

describe('toTelemetrySample', () => {
  it('maps firmware keys to a numeric sample', () => {
    const sample = toTelemetrySample({
      status: series('alarm', 2000),
      tilt: series('12.5'),
      tilt_x: series('-3'),
      tilt_y: series('8'),
      vib_rms: series('0.04'),
      temp_c: series('27.1'),
      rssi: series('-61'),
    });

    expect(sample).toEqual({
      ts: 2000,
      tilt: 12.5,
      tiltX: -3,
      tiltY: 8,
      vibRms: 0.04,
      accelX: 0,
      accelY: 0,
      accelZ: 0,
      tempC: 27.1,
      rssi: -61,
      status: 'alarm',
    });
  });

  it('returns nothing without a valid status', () => {
    expect(toTelemetrySample({ tilt: series(3) })).toBeUndefined();
    expect(toTelemetrySample({ status: series('offline'), tilt: series(3) })).toBeUndefined();
  });
});
