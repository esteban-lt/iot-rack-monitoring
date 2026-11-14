import { useEffect, useMemo, useRef } from 'react';
import { Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import type { RackStatus } from '@/interfaces/rack-summary';
import { levelLayout, resolveParams } from '../../lib/rack-builder';
import { createRackMotion } from '../../lib/rack-motion';
import { floorLift, toModelTilt } from '../../lib/rack-tilt';
import type { RackModelConfig } from '../../schemas/rack-model-schema';

interface Props {
  config: RackModelConfig;
  tiltX: number;
  tiltY: number;
  status: RackStatus;
  factor: number;
}

type Point = [x: number, y: number, z: number];

// Below this real tilt the outline would sit on top of the model and only add noise
const MIN_TILT_DEG = 0.5;

const statusColors: Record<RackStatus, string> = {
  ok: '#64748b',
  warning: '#f59e0b',
  alarm: '#ef4444',
  offline: '#64748b',
};

// Posts plus the outline of every level and of the top, as pairs of points
const outline = (config: RackModelConfig) => {
  const { width, depth, height, postSize, uprights } = resolveParams(config);
  const x = width / 2 - postSize / 2;
  const z = depth / 2 - postSize / 2;
  const posts = Array.from({ length: uprights }, (_, i) => -x + (i * 2 * x) / (uprights - 1));
  const points: Point[] = [];

  for (const px of posts) {
    for (const pz of [-z, z]) points.push([px, 0, pz], [px, height, pz]);
  }
  for (const y of [...levelLayout(config).heights, height]) {
    points.push([-x, y, -z], [x, y, -z], [x, y, -z], [x, y, z], [x, y, z], [-x, y, z], [-x, y, z], [-x, y, -z]);
  }
  return points;
};

export const RackGhost = ({ config, tiltX, tiltY, status, factor }: Props) => {
  const invalidate = useThree((state) => state.invalidate);
  const liftRef = useRef<Group>(null);
  const tiltRef = useRef<Group>(null);
  const swayRef = useRef<Group>(null);
  const motion = useMemo(() => createRackMotion(), []);
  const points = useMemo(() => outline(config), [config]);
  const visible = status !== 'offline' && Math.hypot(tiltX, tiltY) >= MIN_TILT_DEG;

  useEffect(() => {
    invalidate();
  }, [tiltX, tiltY, factor, visible, invalidate]);

  useFrame((_, delta) => {
    if (!liftRef.current || !tiltRef.current || !swayRef.current) return;

    const tilt = toModelTilt(tiltX * factor, tiltY * factor, config.sensorSide);
    motion.setTilt(tilt.x, tilt.z);
    motion.step(delta);
    motion.apply(tiltRef.current, swayRef.current, tiltRef.current);
    liftRef.current.position.y = floorLift(tiltRef.current.rotation, config.width, config.depth);

    if (motion.active()) invalidate();
  });

  return (
    <group ref={liftRef} visible={visible}>
      <group ref={tiltRef}>
        <group ref={swayRef}>
          <Line points={points} segments color={statusColors[status]} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.05} />
        </group>
      </group>
    </group>
  );
}
