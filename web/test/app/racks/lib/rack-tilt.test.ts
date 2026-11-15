import { Euler, MathUtils } from 'three';
import { describe, expect, it } from 'vitest';
import { floorLift, highlightFactor, toModelTilt } from '@/app/racks/lib/rack-tilt';

describe('toModelTilt', () => {
  it('mirrors both axes when the sensor sits on the back', () => {
    const front = toModelTilt(3, -2, 'front');
    const back = toModelTilt(3, -2, 'back');

    expect(back.x).toBe(-front.x);
    expect(back.z).toBe(-front.z);
  });

  it('treats invalid angles as zero', () => {
    expect(toModelTilt(Number.NaN, Infinity, 'front')).toEqual({ x: -0, z: 0 });
  });
});

describe('highlightFactor', () => {
  it('uses the default factor without an alarm threshold', () => {
    expect(highlightFactor()).toBe(4);
  });

  it('makes the alarm threshold look like 15°, within 1x and 6x', () => {
    expect(highlightFactor(5)).toBe(3);
    expect(highlightFactor(1)).toBe(6);
    expect(highlightFactor(30)).toBe(1);
  });
});

describe('floorLift', () => {
  it('needs no lift when the rack stands straight', () => {
    expect(floorLift(new Euler(), 1.8, 0.9)).toBeCloseTo(0);
  });

  it('lifts a leaning rack so its lowest foot touches the floor', () => {
    const angle = MathUtils.degToRad(10);
    expect(floorLift(new Euler(0, 0, angle), 1.8, 0.9)).toBeCloseTo(0.9 * Math.sin(angle));
  });
});
