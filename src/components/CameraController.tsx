/**
 * CameraController Component
 * Smoothly transitions camera between menu and game positions
 */
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CameraControllerProps {
  isGame: boolean;
}

export function CameraController({ isGame }: CameraControllerProps) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const lerpSpeed = 2.0;

  useEffect(() => {
    if (isGame) {
      targetPosition.current.set(0, 15, -30);
      targetLookAt.current.set(0, 0, 0);
    } else {
      targetPosition.current.set(0, 20, -35);
      targetLookAt.current.set(0, 0, 80);
    }
  }, [isGame, camera]);

  useFrame((_state, delta) => {
    camera.position.lerp(targetPosition.current, delta * lerpSpeed);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}
