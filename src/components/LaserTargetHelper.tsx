/**
 * LaserTargetHelper - Bridges 3D world positions to 2D screen space for laser targeting
 */
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../store/gameContext';
import * as THREE from 'three';

// Use a mutable ref-like object so LaserEffect can read it without re-renders
const _target = { current: null as { x: number; y: number } | null };
export function getLaserTarget() {
  return _target.current;
}

export function LaserTargetHelper() {
  const { camera, size } = useThree();
  const store = useGameStore();
  const vec3 = useRef(new THREE.Vector3());

  useFrame(() => {
    const activeEnemy = store.enemies.find(e => e.id === store.activeEnemyId);

    if (activeEnemy) {
      const letterIndex = activeEnemy.typedCharacters;
      const letterSpacing = 0.8;
      const totalWidth = activeEnemy.word.length * letterSpacing;
      const letterXPos = -totalWidth / 2 + letterIndex * letterSpacing + letterSpacing / 2;

      const letterYOffset = activeEnemy.isBoss ? -4 : -3;
      vec3.current.set(
        activeEnemy.position.x + letterXPos,
        activeEnemy.position.y + letterYOffset,
        activeEnemy.position.z
      );

      const screenPos = vec3.current.project(camera);
      _target.current = {
        x: (screenPos.x + 1) * size.width / 2,
        y: (-screenPos.y + 1) * size.height / 2,
      };
    } else {
      _target.current = null;
    }
  });

  return null;
}
