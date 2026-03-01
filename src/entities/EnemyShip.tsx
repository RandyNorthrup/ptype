/**
 * Enemy Ship Entity
 * 3D enemy ship that moves toward player and can be destroyed by typing
 * Optimized with React.memo and useMemo
 */
import { useRef, useEffect, useState, memo, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Enemy as EnemyType } from '../types';

interface EnemyShipProps {
  enemy: EnemyType;
  onReachPlayer: (id: string) => void;
  onDestroy?: (id: string) => void;
  onPositionUpdate?: (id: string, position: { x: number; y: number; z: number }) => void;
  allEnemies?: EnemyType[]; // Pass all enemies for collision avoidance
}

interface ExplodingLetter {
  letter: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotationSpeed: THREE.Euler;
  scale: number;
  opacity: number;
  life: number;
}

interface DebrisParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotationSpeed: THREE.Euler;
  scale: number;
  opacity: number;
  life: number;
  color: string;
}

// Map enemy types to model files
function getEnemyModelPath(enemy: EnemyType): string {
  if (enemy.isBoss) {
    return '/assets/models/ships/enemy-boss.glb';
  }
  
  // Use the enemy type from the enemy object
  const type = enemy.enemyType || 'basic';
  return `/assets/models/ships/enemy-${type}.glb`;
}

const EnemyShipComponent = ({ enemy, onReachPlayer, onDestroy, onPositionUpdate, allEnemies = [] }: EnemyShipProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const destroyingRef = useRef(false);
  const destroyTimeRef = useRef(0);
  const destroyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frameCounter = useRef(0);
  const [explodingLetters, setExplodingLetters] = useState<ExplodingLetter[]>([]);
  const [debrisParticles, setDebrisParticles] = useState<DebrisParticle[]>([]);
  const lastTypedCount = useRef(enemy.typedCharacters);

  // Use refs for callbacks so memo can't stale them
  const onReachPlayerRef = useRef(onReachPlayer);
  onReachPlayerRef.current = onReachPlayer;
  const onDestroyRef = useRef(onDestroy);
  onDestroyRef.current = onDestroy;
  
  const modelPath = getEnemyModelPath(enemy);
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Detect when a letter is typed and create explosion
  useEffect(() => {
    if (enemy.typedCharacters > lastTypedCount.current) {
      const letterIndex = lastTypedCount.current;
      const letter = enemy.word[letterIndex];
      
      if (letter && groupRef.current) {
        // Calculate dynamic letter spacing based on distance
        const playerZ = -20;
        const distanceFromPlayer = enemy.position.z - playerZ;
        const maxDistance = 55;
        const normalizedDistance = Math.max(0, Math.min(1, distanceFromPlayer / maxDistance));
        const minSize = 0.5;
        const maxSize = 1.8;
        const fontSize = minSize + (maxSize - minSize) * normalizedDistance;
        const baseLetterSpacing = 1.2;
        const letterSpacing = baseLetterSpacing * (fontSize / 1.0);
        
        // Letter was at the first position (index 0) in the remaining letters display
        // It should explode from the leftmost position
        const remainingLetters = enemy.word.length - letterIndex;
        const totalWidth = (remainingLetters - 1) * letterSpacing;
        const xPos = 0 * letterSpacing - totalWidth / 2; // First letter position
        
        // Create explosion particles
        const particles: ExplodingLetter[] = [];
        for (let i = 0; i < 3; i++) {
          const angle = (Math.PI * 2 * i) / 3;
          const speed = 0.8 + Math.random() * 0.6; // Fast dispersal
          
          particles.push({
            letter: letter,
            position: new THREE.Vector3(xPos, 0, enemy.isBoss ? -4 : -3),
            velocity: new THREE.Vector3(
              Math.cos(angle) * speed,
              (Math.random() - 0.5) * 0.4,
              Math.sin(angle) * speed
            ),
            rotation: new THREE.Euler(
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2
            ),
            rotationSpeed: new THREE.Euler(
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3
            ),
            scale: fontSize * (0.8 + Math.random() * 0.4),
            opacity: 1,
            life: 12 + Math.random() * 8, // Short life — clears quickly
          });
        }
        
        setExplodingLetters(prev => [...prev, ...particles]);
      }
      
      lastTypedCount.current = enemy.typedCharacters;
    }
  }, [enemy.typedCharacters, enemy.word, enemy.isBoss, enemy.position.z]);

  useEffect(() => {
    return () => {
      if (destroyTimeoutRef.current) clearTimeout(destroyTimeoutRef.current);
    };
  }, [enemy.id]);

  useFrame((state, delta) => {
    if (!groupRef.current || destroyingRef.current) return;

    // Move enemy toward player - calculate direction each frame for tracking
    // Player is at z = -20, x = 0, y = 0
    const playerPos = { x: 0, y: 0, z: -20 };
    const currentPos = groupRef.current.position;
    
    // Calculate direction vector from enemy to player
    let dx = playerPos.x - currentPos.x;
    let dy = playerPos.y - currentPos.y;
    let dz = playerPos.z - currentPos.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Dynamic rotation - gradually turn to face the player
    if (distance > 0.1) {
      // Calculate the angle to face the player (Y-axis rotation)
      // Since ships spawn at rotation 0 facing forward (toward -Z), we need to adjust
      const targetAngle = Math.atan2(-dx, -dz); // Negative values because forward is -Z
      const currentAngle = groupRef.current.rotation.y;
      
      // Smoothly interpolate rotation
      const rotationSpeed = 2.0 * delta; // Adjust this to control turn speed
      const angleDiff = targetAngle - currentAngle;
      
      // Normalize angle difference to [-PI, PI]
      let normalizedDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
      
      // Apply smooth rotation
      groupRef.current.rotation.y += normalizedDiff * Math.min(1, rotationSpeed);
    }
    
    // Enemy-to-enemy collision avoidance with very strong boundaries
    // Match ship scales: 1.5 for regular, 2.5 for boss
    const myRadius = enemy.isBoss ? 6 : 4; // Increased collision radius
    const separationForce = { x: 0, y: 0, z: 0 };
    
    // Calculate word width for boundary consideration with dynamic scaling
    const playerZ = -20;
    const myDistanceFromPlayer = currentPos.z - playerZ;
    const maxDistance = 55;
    const myNormalizedDistance = Math.max(0, Math.min(1, myDistanceFromPlayer / maxDistance));
    const minSize = 0.5;
    const maxSize = 1.8;
    const myFontSize = minSize + (maxSize - minSize) * myNormalizedDistance;
    const baseLetterSpacing = 1.2;
    const myLetterSpacing = baseLetterSpacing * (myFontSize / 1.0);
    const myWordWidth = enemy.word.length * myLetterSpacing;
    
    allEnemies.forEach(otherEnemy => {
      if (otherEnemy.id === enemy.id) return; // Skip self
      
      const odx = currentPos.x - otherEnemy.position.x;
      const ody = currentPos.y - otherEnemy.position.y;
      const odz = currentPos.z - otherEnemy.position.z;
      const otherDistance = Math.sqrt(odx * odx + ody * ody + odz * odz);
      
      const otherRadius = otherEnemy.isBoss ? 6 : 4; // Increased collision radius
      // Calculate other enemy's dynamic word width
      const otherDistanceFromPlayer = otherEnemy.position.z - playerZ;
      const otherNormalizedDistance = Math.max(0, Math.min(1, otherDistanceFromPlayer / maxDistance));
      const otherFontSize = minSize + (maxSize - minSize) * otherNormalizedDistance;
      const otherLetterSpacing = baseLetterSpacing * (otherFontSize / 1.0);
      const otherWordWidth = otherEnemy.word.length * otherLetterSpacing;
      
      // Consider both ship size and word width for separation with larger buffer
      const wordSeparation = (myWordWidth + otherWordWidth) / 2;
      const minSeparation = myRadius + otherRadius + wordSeparation + 5; // Increased buffer to prevent clumping
      
      // If too close, add very strong repulsion force
      if (otherDistance < minSeparation && otherDistance > 0.1) {
        const repulsionStrength = (minSeparation - otherDistance) / minSeparation;
        // Much stronger repulsion force (increased to 3.0)
        const forceMultiplier = 3.0 * (1 + repulsionStrength); // Stronger when closer
        separationForce.x += (odx / otherDistance) * repulsionStrength * forceMultiplier;
        separationForce.y += (ody / otherDistance) * repulsionStrength * forceMultiplier;
        separationForce.z += (odz / otherDistance) * repulsionStrength * forceMultiplier;
      }
    });
    
    if (distance > 0.5) {
      // Move at constant speed toward player
      const normalizedDx = (dx / distance) * enemy.speed * delta;
      const normalizedDy = (dy / distance) * enemy.speed * delta;
      const normalizedDz = (dz / distance) * enemy.speed * delta;
      
      // Move toward player with separation force applied
      groupRef.current.position.x += normalizedDx + separationForce.x * delta * 10;
      groupRef.current.position.y += normalizedDy + separationForce.y * delta * 10;
      groupRef.current.position.z += normalizedDz + separationForce.z * delta * 10;
      
      // Update position in store for accurate separation calculations
      if (onPositionUpdate) {
        onPositionUpdate(enemy.id, {
          x: groupRef.current.position.x,
          y: groupRef.current.position.y,
          z: groupRef.current.position.z
        });
      }

      // Recalculate distance AFTER movement for accurate collision detection
      const newDx = playerPos.x - groupRef.current.position.x;
      const newDy = playerPos.y - groupRef.current.position.y;
      const newDz = playerPos.z - groupRef.current.position.z;
      const newDistance = Math.sqrt(newDx * newDx + newDy * newDy + newDz * newDz);

      // Check collision with player (ship radii overlap)
      const playerRadius = 3;
      const enemyRadius = enemy.isBoss ? 4 : 2.5;
      if (newDistance < playerRadius + enemyRadius) {
        destroyingRef.current = true;
        onReachPlayerRef.current(enemy.id);
      }
    } else {
      // Reached player position
      destroyingRef.current = true;
      onReachPlayerRef.current(enemy.id);
    }

    // Pulsing effect based on typing progress
    if (enemy.typedCharacters > 0) {
      const progress = enemy.typedCharacters / enemy.word.length;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1 * progress;
      groupRef.current.scale.setScalar(scale * (enemy.isBoss ? 3 : 1.5));
    } else {
      groupRef.current.scale.setScalar(enemy.isBoss ? 3 : 1.5);
    }

    // Update exploding letters and debris particles (throttled to every 3rd frame)
    const hasParticles = explodingLetters.length > 0 || debrisParticles.length > 0;
    if (hasParticles) {
      frameCounter.current++;
      if (frameCounter.current % 3 === 0) {
        if (explodingLetters.length > 0) {
          setExplodingLetters(prev => {
            const alive: ExplodingLetter[] = [];
            for (const p of prev) {
              p.position.add(p.velocity);
              p.velocity.y -= 0.01;
              p.rotation.x += p.rotationSpeed.x;
              p.rotation.y += p.rotationSpeed.y;
              p.rotation.z += p.rotationSpeed.z;
              p.scale *= 0.88;
              p.opacity -= 0.08;
              p.life -= 1;
              if (p.life > 0 && p.opacity > 0.01) alive.push(p);
            }
            return alive;
          });
        }
    
        if (debrisParticles.length > 0) {
          setDebrisParticles(prev => {
            const alive: DebrisParticle[] = [];
            for (const p of prev) {
              p.position.add(p.velocity);
              p.velocity.x *= 0.96;
              p.velocity.y = (p.velocity.y - 0.015) * 0.96;
              p.velocity.z *= 0.96;
              p.rotation.x += p.rotationSpeed.x;
              p.rotation.y += p.rotationSpeed.y;
              p.rotation.z += p.rotationSpeed.z;
              p.opacity -= 0.035;
              p.life -= 1;
              if (p.life > 0 && p.opacity > 0.01) alive.push(p);
            }
            return alive;
          });
        }
      }
    }
  });

  // Destruction animation with debris
  useEffect(() => {
    if (enemy.health <= 0 && !destroyingRef.current) {
      destroyingRef.current = true;
      destroyTimeRef.current = Date.now();
      
      // Create debris explosion particles
      const debris: DebrisParticle[] = [];
      const debrisCount = enemy.isBoss ? 20 : 12;
      const shipColor = enemy.isBoss ? '#ff00ff' : '#09ff00';
      
      for (let i = 0; i < debrisCount; i++) {
        const angle = (Math.PI * 2 * i) / debrisCount;
        const speed = 0.4 + Math.random() * 0.5;
        const upwardBias = 0.1 + Math.random() * 0.2;
        
        debris.push({
          position: new THREE.Vector3(0, 0, 0),
          velocity: new THREE.Vector3(
            Math.cos(angle) * speed,
            upwardBias + (Math.random() - 0.5) * 0.3,
            Math.sin(angle) * speed
          ),
          rotation: new THREE.Euler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          ),
          rotationSpeed: new THREE.Euler(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
          ),
          scale: 0.3 + Math.random() * 0.5,
          opacity: 1,
          life: 25 + Math.random() * 15,
          color: Math.random() > 0.5 ? shipColor : '#ff4444',
        });
      }
      
      setDebrisParticles(debris);
      
      // Trigger explosion animation and remove ship
      destroyTimeoutRef.current = setTimeout(() => {
        if (onDestroyRef.current) {
          onDestroyRef.current(enemy.id);
        }
      }, 500);
    }
  }, [enemy.health, enemy.id, enemy.isBoss]);

  // Color based on enemy type and health
  const getColor = () => {
    if (enemy.isBoss) return '#ff00ff'; // Magenta for boss
    if (enemy.health < enemy.maxHealth * 0.5) return '#ff4444'; // Red when damaged
    return '#09ff00'; // Default cyan/green
  };

  // Split word into individual letters for explosion effect
  const letters = enemy.word.split('');
  
  // Calculate dynamic font size based on distance from player
  // Player is at z=-20, ships spawn at z=35, total range is 55 units
  const playerZ = -20;
  const distanceFromPlayer = enemy.position.z - playerZ; // Range: ~0 to 55
  
  // Scale font size: larger when far (1.8), smaller when close (0.5)
  // Using inverse relationship: far = large, near = small
  const minSize = 0.5;
  const maxSize = 1.8;
  const maxDistance = 55;
  const normalizedDistance = Math.max(0, Math.min(1, distanceFromPlayer / maxDistance));
  const dynamicFontSize = minSize + (maxSize - minSize) * normalizedDistance;
  
  // Scale letter spacing proportionally to font size
  const baseLetterSpacing = 1.2;
  const dynamicLetterSpacing = baseLetterSpacing * (dynamicFontSize / 1.0);
  
  const shipScale = enemy.isBoss ? 2.5 : 1.5;
  
  return (
    <group ref={groupRef} position={[enemy.position.x, enemy.position.y, enemy.position.z]}>
      {!destroyingRef.current && (
        <primitive object={clonedScene} scale={shipScale} />
      )}

      {/* Word Display - Individual letters centered on front of ship */}
      {!destroyingRef.current && (
        <group position={[0, 0, enemy.isBoss ? -4 : -3]} rotation={[0, Math.PI, 0]}>
        {letters.slice(enemy.typedCharacters).map((letter, index) => {
          // Only show untyped letters, starting from typedCharacters
          const actualIndex = index + enemy.typedCharacters;
          const remainingLetters = letters.length - enemy.typedCharacters;
          const totalWidth = (remainingLetters - 1) * dynamicLetterSpacing;
          // Keep centered as letters disappear
          const xPos = index * dynamicLetterSpacing - totalWidth / 2;
          
          return (
            <group key={`${enemy.id}-${actualIndex}`} position={[xPos, 0, 0]}>
              <Text
                fontSize={dynamicFontSize}
                color="#ff9800"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.08 * (dynamicFontSize / 1.0)}
                outlineColor="#ff4400"
                font="/assets/fonts/Orbitron-Regular.ttf"
                userData={{ testId: `${enemy.isBoss ? 'boss-word' : 'enemy-word'}-${enemy.id}-${actualIndex}` }}
              >
                {letter}
              </Text>
            </group>
          );
        })}

        {/* Render exploding letter particles with orange glow */}
        {explodingLetters.map((particle, idx) => (
          <group
            key={`explosion-${enemy.id}-${idx}`}
            position={particle.position}
            rotation={particle.rotation}
          >
            <Text
              fontSize={particle.scale}
              color="#ff9800"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.05 * particle.scale}
              outlineColor="#ff4400"
              font="/assets/fonts/Orbitron-Regular.ttf"
            >
              {particle.letter}
            </Text>
          </group>
        ))}
        </group>
      )}

      {/* Typing progress indicator ring */}
      {!destroyingRef.current && enemy.typedCharacters > 0 && (
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 2, 32]} />
          <meshBasicMaterial 
            color="#09ff00" 
            opacity={0.7} 
            transparent 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Health bar for boss */}
      {!destroyingRef.current && enemy.isBoss && (
        <group position={[0, 4, 0]}>
          {/* Background */}
          <mesh>
            <planeGeometry args={[6, 0.5]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          {/* Health fill */}
          <mesh position={[-(6 - (6 * enemy.health / enemy.maxHealth)) / 2, 0, 0.01]}>
            <planeGeometry args={[6 * enemy.health / enemy.maxHealth, 0.4]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </group>
      )}

      {/* Glow effect */}
      {!destroyingRef.current && (
        <pointLight
          color={getColor()}
          intensity={enemy.isBoss ? 3 : 1.5}
          distance={15}
          decay={2}
        />
      )}
      
      {/* Render debris particles on ship destruction */}
      {debrisParticles.map((particle, idx) => (
        <mesh
          key={`debris-${enemy.id}-${idx}`}
          position={particle.position}
          rotation={particle.rotation}
          scale={particle.scale}
        >
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial 
            color={particle.color}
            opacity={particle.opacity}
            transparent
            emissive={particle.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// Memoize component to prevent unnecessary re-renders
// Position changes are handled via Three.js refs, not React re-renders
export const EnemyShip = memo(EnemyShipComponent, (prevProps, nextProps) => {
  return (
    prevProps.enemy.id === nextProps.enemy.id &&
    prevProps.enemy.typedCharacters === nextProps.enemy.typedCharacters &&
    prevProps.enemy.health === nextProps.enemy.health &&
    (prevProps.allEnemies?.length ?? 0) === (nextProps.allEnemies?.length ?? 0)
  );
});

EnemyShip.displayName = 'EnemyShip';

// Preload only basic enemy model - others load on demand
useGLTF.preload('/assets/models/ships/enemy-basic.glb');
