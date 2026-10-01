/**
 * CameraController Component
 * Smoothly transitions camera between menu and game positions
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const TUNING = {
  gameHeight: 15,
  gameDepth: -30,
  menuHeight: 20,
  menuDepth: -35,
  menuLookAtDepth: 80,
} as const;

interface CameraControllerProperties {
  isGame: boolean;
}

export function CameraController({ isGame }: CameraControllerProperties) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const lerpSpeed = 2;

  useEffect(() => {
    if (isGame) {
      targetPosition.current.set(0, TUNING.gameHeight, TUNING.gameDepth);
      targetLookAt.current.set(0, 0, 0);
    } else {
      targetPosition.current.set(0, TUNING.menuHeight, TUNING.menuDepth);
      targetLookAt.current.set(0, 0, TUNING.menuLookAtDepth);
    }
  }, [isGame, camera]);

  useFrame((_state, delta) => {
    camera.position.lerp(targetPosition.current, delta * lerpSpeed);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}
