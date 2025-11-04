/**
 * Player Ship Entity
 * 3D player ship using Rodin-generated model
 */
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { error as logError } from '../utils/logger';

const MODEL_PATH = '/assets/models/ships/player-ship.glb';

export function PlayerShip() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load player ship model
  const { scene } = useGLTF(MODEL_PATH);
  
  // Error logging for model loading failures
  useEffect(() => {
    if (!scene) {
      logError(`Failed to load player ship model: ${MODEL_PATH}`, new Error('Model not found'), 'PlayerShip');
    }
  }, [scene]);
  
  // Gentle hovering animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = 0 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -20]} userData={{ testId: 'player-ship' }}>
      <primitive object={scene.clone()} scale={2} rotation={[0, 0, 0]} />
      {/* Blue glow */}
      <pointLight color="#0088ff" intensity={2} distance={15} decay={2} />
    </group>
  );
}

// Preload the model
useGLTF.preload(MODEL_PATH);
