// Tilt and impact response for the rack model. Apply the result to this hierarchy:
//   tiltGroup (rotation: the lean reported by the sensor)
//     └ swayGroup (shear: the frame flexes above its anchored feet after a hit)
//         └ Rack_Root (its "Cargo" children lag behind and settle)
import type { Object3D } from 'three';

const MOTION = {
  // how the lean follows the reported tilt: quick, with a touch of overshoot
  tiltHz: 2.0,
  tiltDamping: 0.7,
  // first sway mode of the frame after an impact (steel racks ring for a while)
  swayHz: 3.1,
  swayDamping: 0.09,
  swayPerG: 0.011,     // peak shear (top displacement / height) per g of impact
  // faster, smaller vibration on top of the sway
  ringHz: 13,
  ringDamping: 0.05,
  ringPerG: 0.0016,
  // cargo slides a little relative to its shelf and settles
  cargoHz: 4.2,
  cargoDamping: 0.3,
  cargoMaxSlide: 0.035,
};

interface Oscillator {
  x: number;
  v: number;
}

const TAU = Math.PI * 2;
const oscillator = (): Oscillator => ({ x: 0, v: 0 });
const axes = () => ({ x: oscillator(), z: oscillator() });

const spring = (o: Oscillator, target: number, hz: number, damping: number, dt: number, drive = 0) => {
  const w = TAU * hz;
  const acceleration = -w * w * (o.x - target) - 2 * damping * w * o.v + drive;
  o.v += acceleration * dt;
  o.x += o.v * dt;
  return acceleration;
};

export const createRackMotion = () => {
  const C = MOTION;
  const tilt = axes(), sway = axes(), ring = axes();
  const target = { x: 0, z: 0 };
  const cargo = new Map<number, ReturnType<typeof axes>>();
  let levels: { level: number; height: number }[] = [];

  return {
    setLevels(heights: number[]) {
      levels = heights.map((height, i) => ({ level: i + 1, height }));
      cargo.clear();
      for (const { level } of levels) cargo.set(level, axes());
    },

    // Lean in degrees: around X (front/back) and around Z (left/right)
    setTilt(xDeg: number, zDeg: number) {
      target.x = (xDeg * Math.PI) / 180;
      target.z = (zDeg * Math.PI) / 180;
    },

    // Impact of `g` pushing the rack along (dirX, dirZ)
    hit(dirX: number, dirZ: number, g: number) {
      const n = Math.hypot(dirX, dirZ) || 1, ux = dirX / n, uz = dirZ / n;
      sway.x.v += ux * g * C.swayPerG * TAU * C.swayHz;
      sway.z.v += uz * g * C.swayPerG * TAU * C.swayHz;
      ring.x.v += ux * g * C.ringPerG * TAU * C.ringHz;
      ring.z.v += uz * g * C.ringPerG * TAU * C.ringHz;
    },

    step(dt: number) {
      let left = Math.min(dt, 0.1);
      while (left > 1e-6) {
        const h = Math.min(left, 1 / 240);
        left -= h;
        spring(tilt.x, target.x, C.tiltHz, C.tiltDamping, h);
        spring(tilt.z, target.z, C.tiltHz, C.tiltDamping, h);
        const ax = spring(sway.x, 0, C.swayHz, C.swayDamping, h) + spring(ring.x, 0, C.ringHz, C.ringDamping, h);
        const az = spring(sway.z, 0, C.swayHz, C.swayDamping, h) + spring(ring.z, 0, C.ringHz, C.ringDamping, h);
        // each shelf accelerates in proportion to its height; cargo lags behind it
        for (const { level, height } of levels) {
          const c = cargo.get(level)!;
          spring(c.x, 0, C.cargoHz, C.cargoDamping, h, -ax * height);
          spring(c.z, 0, C.cargoHz, C.cargoDamping, h, -az * height);
        }
      }
    },

    // True while something is still moving (lets the scene render on demand)
    active() {
      const e = 1e-5;
      return Math.abs(tilt.x.x - target.x) > e || Math.abs(tilt.z.x - target.z) > e ||
        [tilt.x, tilt.z, sway.x, sway.z, ring.x, ring.z].some((o) => Math.abs(o.v) > 1e-4) ||
        Math.abs(sway.x.x) > e || Math.abs(sway.z.x) > e;
    },

    apply(tiltGroup: Object3D, swayGroup: Object3D, rackRoot: Object3D) {
      tiltGroup.rotation.set(tilt.x.x, 0, tilt.z.x);
      const sx = sway.x.x + ring.x.x, sz = sway.z.x + ring.z.x;
      swayGroup.matrixAutoUpdate = false;
      swayGroup.matrix.set(1, sx, 0, 0,  0, 1, 0, 0,  0, sz, 1, 0,  0, 0, 0, 1);
      swayGroup.matrixWorldNeedsUpdate = true;

      const slide = (value: number) => Math.max(-C.cargoMaxSlide, Math.min(C.cargoMaxSlide, value));
      for (const mesh of rackRoot.getObjectByName('Cargo')?.children ?? []) {
        const c = cargo.get(mesh.userData.level);
        if (c) { mesh.position.x = slide(c.x.x); mesh.position.z = slide(c.z.x); }
      }
    },
  };
};
