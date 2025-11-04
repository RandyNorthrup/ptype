/**
 * LaserTargetHelper - Bridges 3D world positions to 2D screen space for laser targeting
 */
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';

// Global reference that LaserEffect can access
export let laserTargetPosition: { x: number; y: number } | null = null;

export function LaserTargetHelper() {
  const { camera, size } = useThree();
  const { enemies, activeEnemyId } = useGameStore();

  // Update target position whenever enemies or activeEnemyId changes
  useEffect(() => {
    const updateTargetPosition = () => {
      // Always get the latest activeEnemyId from the store
      const currentActiveId = useGameStore.getState().activeEnemyId;
      const activeEnemy = enemies.find(e => e.id === currentActiveId);
      
      if (activeEnemy) {
        // Calculate the position of the next letter to be typed
        const letterIndex = activeEnemy.typedCharacters;
        const letterSpacing = 0.8;
        const totalWidth = activeEnemy.word.length * letterSpacing;
        const letterXPos = -totalWidth / 2 + letterIndex * letterSpacing + letterSpacing / 2;
        
        // 3D position of the letter (below the enemy ship)
        const letterYOffset = activeEnemy.isBoss ? -4 : -3;
        const letter3DPos = new THREE.Vector3(
          activeEnemy.position.x + letterXPos,
          activeEnemy.position.y + letterYOffset,
          activeEnemy.position.z
        );
        
        // Project 3D position to 2D screen coordinates
        const screenPos = letter3DPos.project(camera);
        laserTargetPosition = {
          x: (screenPos.x + 1) * size.width / 2,
          y: (-screenPos.y + 1) * size.height / 2,
        };
      } else {
        laserTargetPosition = null;
      }
    };

    // Update immediately when dependencies change
    updateTargetPosition();

    // Also update on every animation frame for smooth tracking
    const interval = setInterval(updateTargetPosition, 16); // ~60fps

    return () => clearInterval(interval);
  }, [enemies, activeEnemyId, camera, size]);

  return null; // This component doesn't render anything
}
