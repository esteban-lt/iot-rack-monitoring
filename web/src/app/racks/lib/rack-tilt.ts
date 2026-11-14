import { MathUtils, Vector3, type Euler } from 'three';
import type { RackParams } from './rack-builder';

// Map the firmware angles to model rotations (flip a sign if the model leans the wrong way)
const FRONT_SIGN = -1;
const SIDE_SIGN = 1;

// The highlight makes the alarm threshold look like this many degrees
const HIGHLIGHT_ALARM_DEG = 15;
const DEFAULT_HIGHLIGHT = 4;

const finite = (value: number) => (Number.isFinite(value) ? value : 0);

// The firmware takes "front" from the side the sensor faces, so a sensor on the back mirrors both axes
export const toModelTilt = (tiltX: number, tiltY: number, sensorSide: RackParams['sensorSide']) => {
  const facing = sensorSide === 'back' ? -1 : 1;
  return { x: finite(tiltX) * FRONT_SIGN * facing, z: finite(tiltY) * SIDE_SIGN * facing };
};

const point = new Vector3();
const corners = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

// Height that keeps the lowest foot on the floor instead of sinking through it
export const floorLift = (rotation: Euler, width: number, depth: number) =>
  -Math.min(...corners.map(([x, z]) => point.set((x * width) / 2, 0, (z * depth) / 2).applyEuler(rotation).y));

export const highlightFactor = (alarmDeg?: number) =>
  alarmDeg ? Math.round(MathUtils.clamp(HIGHLIGHT_ALARM_DEG / alarmDeg, 1, 6) * 10) / 10 : DEFAULT_HIGHLIGHT;
