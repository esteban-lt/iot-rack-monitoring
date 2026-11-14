import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import type { RackStatus } from '@/interfaces/rack-summary';
import { buildRack, disposeRack, rackMaterials, type RackParams } from '../../lib/rack-builder';
import { createRackMotion } from '../../lib/rack-motion';
import { floorLift, toModelTilt } from '../../lib/rack-tilt';
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

const statusColors: Record<Exclude<RackStatus, 'ok'>, string> = {
  warning: '#f59e0b',
  alarm: '#ef4444',
  offline: '#6b7280',
};

const hsl = { h: 0, s: 0, l: 0 };

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
  }, [tiltX, tiltY, impact, config.sensorSide, motion, invalidate]);

  useFrame((_, delta) => {
    if (!liftRef.current || !tiltRef.current || !swayRef.current) return;

    const tilt = toModelTilt(tiltX, tiltY, config.sensorSide);
    motion.setTilt(tilt.x, tilt.z);
    motion.step(delta);
    motion.apply(tiltRef.current, swayRef.current, rack);
    liftRef.current.position.y = floorLift(tiltRef.current.rotation, config.width, config.depth);

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
