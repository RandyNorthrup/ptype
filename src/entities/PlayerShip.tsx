/**
 * Player Ship Entity
 * 3D player ship using Rodin-generated model
 */
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type * as THREE from "three";

const TUNING = {
  verticalBobAmplitude: 0.2,
  rollAmplitude: 0.05,
  playerDepth: -20,
} as const;

const MODEL_PATH = "/assets/models/ships/player-ship.glb";

export function PlayerShip() {
  const groupReference = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame((state) => {
    if (!groupReference.current) {
      return;
    }

    groupReference.current.position.y =
      Math.sin(state.clock.elapsedTime * 2) * TUNING.verticalBobAmplitude;
    groupReference.current.rotation.z =
      Math.sin(state.clock.elapsedTime) * TUNING.rollAmplitude;
  });

  return (
    <group
      ref={groupReference}
      position={[0, 0, TUNING.playerDepth]}
      userData={{ testId: "player-ship" }}
    >
      <primitive object={clonedScene} scale={2} rotation={[0, 0, 0]} />
      <pointLight color="#0088ff" intensity={2} distance={15} decay={2} />
    </group>
  );
}
