import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Color, MathUtils, Vector3, type Group, type Mesh, type MeshStandardMaterial } from 'three';
import type { ImpactEvent } from '@/interfaces/impact-event';
import type { RackStatus } from '@/interfaces/rack-summary';

const MODEL_URL = '/models/rack-4l.glb';

const TILT_EXAGGERATION = 1;

// Map the firmware angles to model rotations (flip a sign if the model leans the wrong way)
const FRONT_SIGN = -1;
const SIDE_SIGN = 1;

const SMOOTHING = 4;
const SHAKE_SECONDS = 0.8;

const statusColors: Record<RackStatus, string> = {
  ok: '#22c55e',
  warning: '#f59e0b',
  alarm: '#ef4444',
  offline: '#6b7280',
};

interface Props {
  tiltX: number;
  tiltY: number;
  status: RackStatus;
  impact?: ImpactEvent;
  showCargo: boolean;
}

const point = new Vector3();

const toRotation = (degrees: number, sign: number) =>
  Number.isFinite(degrees) ? MathUtils.degToRad(degrees) * TILT_EXAGGERATION * sign : 0;

export const RackModel = ({ tiltX, tiltY, status, impact, showCargo }: Props) => {
  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((state) => state.invalidate);

  const liftRef = useRef<Group>(null);
  const tiltRef = useRef<Group>(null);
  const smoothed = useRef({ x: 0, z: 0 });
  const shake = useRef({ start: -Infinity, amplitude: 0 });
  const lastImpactTs = useRef(impact?.ts);

  // Each rack gets its own copy of the model and materials, so recoloring one never affects another
  const { model, materials, baseColors, feet } = useMemo(() => {
    const model = scene.clone();
    const materials = new Map<string, MeshStandardMaterial>();
    const baseColors = new Map<string, Color>();

    model.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;

      const source = mesh.material as MeshStandardMaterial;
      if (!materials.has(source.name)) {
        materials.set(source.name, source.clone());
        baseColors.set(source.name, source.color.clone());
      }
      mesh.material = materials.get(source.name)!;
    });

    const { min, max } = new Box3().setFromObject(model.getObjectByName('Frame')!);
    const feet = [
      new Vector3(min.x, 0, min.z),
      new Vector3(min.x, 0, max.z),
      new Vector3(max.x, 0, min.z),
      new Vector3(max.x, 0, max.z),
    ];

    return { model, materials, baseColors, feet };
  }, [scene]);

  useEffect(() => {
    const hsl = { h: 0, s: 0, l: 0 };

    materials.forEach((material, name) => {
      material.color.copy(baseColors.get(name)!);
      if (status !== 'offline') return;

      material.color.getHSL(hsl);
      material.color.setHSL(hsl.h, hsl.s * 0.15, hsl.l);
    });

    const led = materials.get('Sensor_Status')!;
    led.color.set(statusColors[status]);
    led.emissive.set(statusColors[status]);
    invalidate();
  }, [status, materials, baseColors, invalidate]);

  useEffect(() => {
    model.getObjectByName('Cargo')!.visible = showCargo;
    invalidate();
  }, [showCargo, model, invalidate]);

  useEffect(() => {
    if (impact && impact.ts !== lastImpactTs.current) {
      lastImpactTs.current = impact.ts;
      shake.current = { start: performance.now(), amplitude: Math.min(impact.impactG, 4) * 0.01 };
    }
    invalidate();
  }, [tiltX, tiltY, impact, invalidate]);

  useFrame((_, delta) => {
    if (!liftRef.current || !tiltRef.current) return;

    const targetX = toRotation(tiltX, FRONT_SIGN);
    const targetZ = toRotation(tiltY, SIDE_SIGN);
    const step = Math.min(delta, 0.05);
    const current = smoothed.current;
    current.x = MathUtils.damp(current.x, targetX, SMOOTHING, step);
    current.z = MathUtils.damp(current.z, targetZ, SMOOTHING, step);

    const elapsed = (performance.now() - shake.current.start) / 1000;
    const isShaking = elapsed < SHAKE_SECONDS;
    const decay = isShaking ? Math.exp(-elapsed * 6) : 0;
    const wobble = isShaking ? decay * shake.current.amplitude * Math.sin(elapsed * 45) : 0;

    const rotation = tiltRef.current.rotation.set(current.x + wobble, 0, current.z + wobble * 0.6);

    // Keeps the lowest foot on the floor instead of sinking through it
    liftRef.current.position.y = -Math.min(...feet.map((foot) => point.copy(foot).applyEuler(rotation).y));

    materials.forEach((material, name) => {
      if (name !== 'Sensor_Status') material.emissive.setRGB(decay * 0.5, 0, 0);
    });

    const isSettled = Math.abs(current.x - targetX) < 1e-4 && Math.abs(current.z - targetZ) < 1e-4;
    if (isShaking || !isSettled) invalidate();
  });

  return (
    <group ref={liftRef}>
      <group ref={tiltRef}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
