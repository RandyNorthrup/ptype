/**
 * LaserTargetHelper - Bridges 3D world positions to 2D screen space for laser targeting
 */
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGameStore } from "../store/gameContext";
import * as THREE from "three";
import { getEnemyLetterId } from "../utils/testIds";

// Use a mutable ref-like object so LaserEffect can read it without re-renders
const _target = { current: null as { x: number; y: number } | null };
export function getLaserTarget() {
  return _target.current;
}

export function LaserTargetHelper() {
  const { camera, size, scene } = useThree();
  const store = useGameStore();
  const vec3 = useRef(new THREE.Vector3());
  useEffect(
    () => () => {
      _target.current = null;
    },
    [],
  );

  useFrame(() => {
    const activeEnemy = store.enemies.find((e) => e.id === store.activeEnemyId);

    const letter = activeEnemy
      ? scene.getObjectByName(
          getEnemyLetterId(activeEnemy, activeEnemy.typedCharacters),
        )
      : undefined;
    if (letter) {
      // Read the actual animated mesh, including rotation and scale, not spawn coordinates.
      const screenPos = letter.getWorldPosition(vec3.current).project(camera);
      _target.current = {
        x: ((screenPos.x + 1) * size.width) / 2,
        y: ((-screenPos.y + 1) * size.height) / 2,
      };
    } else {
      _target.current = null;
    }
  });

  return null;
}
