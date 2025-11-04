/**
 * CameraController Component
 * Smoothly transitions camera between menu and game positions
 */
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { debug } from '../utils/logger';

interface CameraControllerProps {
  isGame: boolean;
}

export function CameraController({ isGame }: CameraControllerProps) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const lerpSpeed = 2.0; // Speed of camera transition

  useEffect(() => {
    // Set target position based on game mode
    if (isGame) {
      // Game view: Behind and above player looking forward
      targetPosition.current.set(0, 15, -30); // Behind player, elevated
      debug('Camera target set to GAME view', { position: targetPosition.current.toArray() }, 'CameraController');
      camera.lookAt(0, 0, 0); // Look at center/forward
    } else {
      // Menu view: Behind and above, looking at nebula
      targetPosition.current.set(0, 20, -35);
      debug('Camera target set to MENU view', { position: targetPosition.current.toArray() }, 'CameraController');
      camera.lookAt(0, 0, 80); // Look at nebula
    }
  }, [isGame, camera]);

  useFrame((_state, delta) => {
    // Smoothly interpolate camera to target position
    camera.position.lerp(targetPosition.current, delta * lerpSpeed);
    
    // Log camera position occasionally (only in development)
    if (Math.random() < 0.016) {
      debug('Camera position', { 
        position: camera.position.toArray(), 
        direction: camera.getWorldDirection(new THREE.Vector3()).toArray() 
      }, 'CameraController');
    }
  });

  return null;
}
