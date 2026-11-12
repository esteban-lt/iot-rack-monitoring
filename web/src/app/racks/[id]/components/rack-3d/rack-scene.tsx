import type { ComponentProps } from 'react';
import { ContactShadows, Line, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { RackModel } from './rack-model';

const RackScene = (props: ComponentProps<typeof RackModel>) => {
  return (
    <Canvas frameloop="demand" camera={{ position: [3.4, 2.4, 4.6], fov: 35 }}>
      <hemisphereLight intensity={1.5} groundColor="#666666" />
      <directionalLight position={[3, 5, 4]} intensity={2} />

      <RackModel {...props} />

      <Line points={[[0, 0, 0], [0, 2.8, 0]]} color="#888888" dashed dashSize={0.08} gapSize={0.06} />
      <ContactShadows scale={6} blur={2.5} opacity={0.35} />
      <OrbitControls target={[0, 1.2, 0]} enablePan={false} minDistance={3} maxDistance={9} maxPolarAngle={Math.PI / 2} />
    </Canvas>
  );
}

export default RackScene;
