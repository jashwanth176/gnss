import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001; // Slow spin
    }
  });

  const texture = new THREE.TextureLoader().load('/earth-texture.jpg');

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}> // Higher segments for smoother sphere
      <meshStandardMaterial
        map={texture}
        metalness={0.1}
        roughness={0.7}
        color={texture ? undefined : 'blue'} // Fallback to blue if texture fails
      />
    </Sphere>
  );
}

export default function EarthModel() {
  return (
    <Canvas
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.3, zIndex: -1 }} // Semi-transparent background
      camera={{ position: [0, 0, 2.5], fov: 60 }}
    >
      <ambientLight intensity={1} /> // Increased for better visibility
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <Earth />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
}