/**
 * Player Ship Entity
 * 3D player ship using Rodin-generated model
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/assets/models/ships/player-ship.glb';

export function PlayerShip() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -20]} userData={{ testId: 'player-ship' }}>
      <primitive object={clonedScene} scale={2} rotation={[0, 0, 0]} />
      <pointLight color="#0088ff" intensity={2} distance={15} decay={2} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
