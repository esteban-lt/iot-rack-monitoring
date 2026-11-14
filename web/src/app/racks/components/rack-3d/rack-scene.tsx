import { useEffect, type ComponentProps } from 'react';
import { ContactShadows, Line, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { DoubleSide, MathUtils, Shape, Vector3, type PerspectiveCamera } from 'three';
import { RackGhost } from './rack-ghost';
import { RackModel } from './rack-model';

type Props = ComponentProps<typeof RackModel> & {
  highlight?: number;
};

interface Controls {
  target: Vector3;
  update: () => void;
}

// Frames the whole rack whenever its size or the canvas shape changes, keeping the viewing angle
const CameraFit = ({ width, height, depth }: { width: number; height: number; depth: number }) => {
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const controls = useThree((state) => state.controls as Controls | null);
  const aspect = useThree((state) => state.viewport.aspect);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!controls) return;

    const target = new Vector3(0, height / 2, 0);
    const radius = Math.hypot(width, height, depth) / 2;
    const distance = (radius / Math.sin(MathUtils.degToRad(camera.fov / 2))) * (1.05 / MathUtils.clamp(aspect, 0.5, 1));
    const direction = camera.position.clone().sub(controls.target).normalize();

    controls.target.copy(target);
    camera.position.copy(target).addScaledVector(direction, distance);
    controls.update();
    invalidate();
  }, [camera, controls, aspect, width, height, depth, invalidate]);

  return null;
}

const arrowShape = new Shape()
  .moveTo(-0.05, 0).lineTo(0.05, 0).lineTo(0.05, 0.22).lineTo(0.13, 0.22)
  .lineTo(0, 0.4).lineTo(-0.13, 0.22).lineTo(-0.05, 0.22).closePath();

// Floor grid and an arrow on the aisle side that marks the front of the rack
const Guides = ({ width, height, depth }: { width: number; height: number; depth: number }) => {
  const span = Math.max(4, Math.ceil(Math.max(width, depth) * 1.6));
  const arrowScale = MathUtils.clamp(Math.max(width, height) / 3, 1, 3);

  return (
    <>
      <gridHelper
        args={[span, span <= 12 ? span * 2 : span, '#808891', '#808891']}
        position-y={-0.001}
        material-transparent
        material-opacity={0.28}
      />
      <mesh rotation-x={Math.PI / 2} position={[0, 0.002, depth / 2 + 0.18 * arrowScale]} scale={arrowScale}>
        <shapeGeometry args={[arrowShape]} />
        <meshBasicMaterial color="#f26a1b" side={DoubleSide} toneMapped={false} />
      </mesh>
    </>
  );
}

// Checked before mounting the canvas: without WebGL three.js throws and would take down the whole page
const supportsWebGL = (() => {
  try {
    const context = document.createElement('canvas').getContext('webgl2') ?? document.createElement('canvas').getContext('webgl');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!context;
  } catch {
    return false;
  }
})();

const RackScene = ({ highlight, ...props }: Props) => {
  const { width, height, depth } = props.config;

  if (!supportsWebGL) {
    return (
      <p className="flex size-full items-center justify-center text-center text-sm text-muted-foreground">
        Este navegador no admite WebGL, así que la vista 3D no está disponible.
      </p>
    );
  }

  return (
    <Canvas frameloop="demand" camera={{ position: [3.4, 2.5, 5.2], fov: 32, far: 600 }}>
      <hemisphereLight intensity={1.5} groundColor="#666666" />
      <directionalLight position={[3, 6, 5]} intensity={2} />

      <RackModel {...props} />
      {highlight && <RackGhost {...props} factor={highlight} />}
      <Guides width={width} height={height} depth={depth} />

      <Line points={[[0, 0, 0], [0, height + 0.4, 0]]} color="#888888" dashed dashSize={0.08} gapSize={0.06} />
      <ContactShadows scale={Math.max(width, depth) * 2 + 4} far={height + 1} blur={2.5} opacity={0.35} />
      <OrbitControls makeDefault enablePan={false} minDistance={0.8} maxDistance={160} maxPolarAngle={Math.PI / 2} />
      <CameraFit width={width} height={height} depth={depth} />
    </Canvas>
  );
}

export default RackScene;
