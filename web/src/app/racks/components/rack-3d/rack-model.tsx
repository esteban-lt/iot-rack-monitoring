import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, type Group } from 'three';
import type { RackStatus } from '@/interfaces/rack-summary';
import { buildRack, disposeRack, rackMaterials, type RackParams } from '../../lib/rack-builder';
import { createRackMotion } from '../../lib/rack-motion';
import type { RackModelConfig } from '../../schemas/rack-model-schema';

export interface RackImpact {
  ts: number;
  impactG: number;
  direction?: [x: number, z: number];
}

interface Props {
  config: RackModelConfig;
  tiltX: number;
  tiltY: number;
  status: RackStatus;
  impact?: RackImpact;
}

const TILT_EXAGGERATION = 1;

// Map the firmware angles to model rotations (flip a sign if the model leans the wrong way)
const FRONT_SIGN = -1;
const SIDE_SIGN = 1;

const statusColors: Record<Exclude<RackStatus, 'ok'>, string> = {
  warning: '#f59e0b',
  alarm: '#ef4444',
  offline: '#6b7280',
};

const point = new Vector3();
const hsl = { h: 0, s: 0, l: 0 };

const toDegrees = (degrees: number, sign: number) => (Number.isFinite(degrees) ? degrees * TILT_EXAGGERATION * sign : 0);

export const RackModel = ({ config, tiltX, tiltY, status, impact }: Props) => {
  const invalidate = useThree((state) => state.invalidate);
  const liftRef = useRef<Group>(null);
  const tiltRef = useRef<Group>(null);
  const swayRef = useRef<Group>(null);
  const lastImpactTs = useRef(impact?.ts);
  const motion = useMemo(() => createRackMotion(), []);

  // Colors are applied without rebuilding; everything else changes the geometry
  const { colors, ...shape } = config;
  const shapeKey = JSON.stringify(shape);
  const colorsKey = JSON.stringify(colors);
  const rack = useMemo(() => buildRack(JSON.parse(shapeKey) as Partial<RackParams>), [shapeKey]);

  // The firmware takes "front" from the side the sensor faces, so a sensor on the back mirrors both axes
  const facing = config.sensorSide === 'back' ? -1 : 1;
  const halfWidth = config.width / 2;
  const halfDepth = config.depth / 2;

  useEffect(() => {
    motion.setLevels(rack.userData.levelHeights);
    return () => disposeRack(rack);
  }, [rack, motion]);

  useEffect(() => {
    const palette: RackModelConfig['colors'] = JSON.parse(colorsKey);

    rackMaterials(rack).forEach((material) => {
      const name = material.name as keyof typeof palette;
      material.color.set(palette[name]);

      if (status === 'offline') {
        material.color.getHSL(hsl);
        material.color.setHSL(hsl.h, hsl.s * 0.15, hsl.l);
      }
      if (name === 'Sensor_Status') {
        if (status !== 'ok') material.color.set(statusColors[status]);
        material.emissive.copy(material.color);
      }
    });
    invalidate();
  }, [rack, colorsKey, status, invalidate]);

  useEffect(() => {
    if (impact && impact.ts !== lastImpactTs.current) {
      lastImpactTs.current = impact.ts;
      // The firmware only reports the magnitude, so real impacts get a random direction
      const angle = Math.random() * Math.PI * 2;
      const [x, z] = impact.direction ?? [Math.cos(angle), Math.sin(angle)];
      motion.hit(x, z, impact.impactG);
    }
    invalidate();
  }, [tiltX, tiltY, impact, facing, motion, invalidate]);

  useFrame((_, delta) => {
    if (!liftRef.current || !tiltRef.current || !swayRef.current) return;

    motion.setTilt(toDegrees(tiltX, FRONT_SIGN * facing), toDegrees(tiltY, SIDE_SIGN * facing));
    motion.step(delta);
    motion.apply(tiltRef.current, swayRef.current, rack);

    // Keeps the lowest foot on the floor instead of sinking through it
    const { rotation } = tiltRef.current;
    const footHeight = (x: number, z: number) => point.set(x * halfWidth, 0, z * halfDepth).applyEuler(rotation).y;
    liftRef.current.position.y = -Math.min(footHeight(-1, -1), footHeight(-1, 1), footHeight(1, -1), footHeight(1, 1));

    if (motion.active()) invalidate();
  });

  return (
    <group ref={liftRef}>
      <group ref={tiltRef}>
        <group ref={swayRef}>
          <primitive object={rack} />
        </group>
      </group>
    </group>
  );
}
