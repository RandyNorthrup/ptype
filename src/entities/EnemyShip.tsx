/**
 * Enemy Ship Entity
 * 3D enemy ship that moves toward player and can be destroyed by typing
 * Optimized with React.memo and useMemo
 */
import { useRef, useEffect, useState, memo, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import type { Enemy as EnemyType } from "../types";
import { getEnemyLetterId } from "../utils/testIds";

const TUNING = {
  letterParticleCount: 3,
  letterMinimumSpeed: 0.8,
  letterSpeedRange: 0.6,
  bossWordDepth: -4,
  regularWordDepth: -3,
  letterVerticalSpeedRange: 0.4,
  letterMinimumScaleRatio: 0.8,
  letterScaleRatioRange: 0.4,
  letterMinimumLifeFrames: 12,
  letterLifeRangeFrames: 8,
  minimumFacingDistance: 0.1,
  bossSeparationRadius: 6,
  regularSeparationRadius: 4,
  wordSeparationBuffer: 5,
  separationStrength: 3,
  separationSpeed: 10,
  bossCollisionRadius: 4,
  regularCollisionRadius: 2.5,
  damagePulseFrequency: 10,
  damagePulseAmplitude: 0.1,
  bossPulseScale: 3,
  regularPulseScale: 1.5,
  particleUpdateFrames: 3,
  minimumVisibleOpacity: 0.01,
  debrisGravity: 0.015,
  debrisDrag: 0.96,
  bossDebrisCount: 20,
  regularDebrisCount: 12,
  minimumDebrisSpeed: 0.4,
  debrisSpeedRange: 0.5,
  minimumDebrisUpwardSpeed: 0.1,
  debrisUpwardSpeedRange: 0.2,
  debrisVerticalSpeedRange: 0.3,
  minimumDebrisScale: 0.3,
  debrisScaleRange: 0.5,
  minimumMovementDistance: 0.5,
  debrisBoxSize: 0.5,
  debrisEmissiveIntensity: 0.5,
  bossHealthBarBackgroundHeight: 0.5,
  minimumDebrisLifeFrames: 25,
  debrisLifeRangeFrames: 15,
  destructionDurationMs: 500,
  bossModelScale: 2.5,
  regularModelScale: 1.5,
  wordOutlineRatio: 0.08,
  particleOutlineRatio: 0.05,
  progressRingHeight: -2,
  progressRingInnerRadius: 1.5,
  progressRingSegments: 32,
  bossHealthBarHeight: 4,
  bossHealthBarWidth: 6,
  bossHealthBarDepth: 0.01,
  bossHealthBarFillHeight: 0.4,
  bossGlowIntensity: 3,
  regularGlowIntensity: 1.5,
  letterGravity: 0.01,
  letterScaleDecay: 0.88,
  letterFadePerUpdate: 0.08,
  debrisFadePerUpdate: 0.035,
} as const;

interface EnemyShipProperties {
  enemy: EnemyType;
  isActive: boolean;
  onReachPlayer: (id: string) => void;
  onDestroy?: (id: string) => void;
  onPositionUpdate?: (
    id: string,
    position: { x: number; y: number; z: number },
  ) => void;
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

function createParticleRotation(): Pick<
  DebrisParticle,
  "rotation" | "rotationSpeed"
> {
  const fullRotation = Math.PI * 2;
  const rotationVariance = 0.3;

  return {
    rotation: new THREE.Euler(
      Math.random() * fullRotation,
      Math.random() * fullRotation,
      Math.random() * fullRotation,
    ),
    rotationSpeed: new THREE.Euler(
      (Math.random() - 0.5) * rotationVariance,
      (Math.random() - 0.5) * rotationVariance,
      (Math.random() - 0.5) * rotationVariance,
    ),
  };
}

function cloneParticleForFrame<
  T extends Pick<DebrisParticle, "position" | "velocity" | "rotation">,
>(particle: T): T {
  // React retains prior props; mutate only fresh vectors so rendered transforms update.
  return {
    ...particle,
    position: particle.position.clone(),
    velocity: particle.velocity.clone(),
    rotation: particle.rotation.clone(),
  };
}

// Map enemy types to model files
function getEnemyModelPath(enemy: EnemyType): string {
  if (enemy.isBoss) {
    return "/assets/models/ships/enemy-boss.glb";
  }

  // Use the enemy type from the enemy object
  const type = enemy.enemyType ?? "basic";
  return `/assets/models/ships/enemy-${type}.glb`;
}

const EnemyShipComponent = ({
  enemy,
  isActive,
  onReachPlayer,
  onDestroy,
  onPositionUpdate,
  allEnemies = [],
}: EnemyShipProperties) => {
  const groupReference = useRef<THREE.Group>(null);
  const isDestroyingReference = useRef(false);
  const [isDestroying, setIsDestroying] = useState(false);
  const destructionTimeoutReference = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);
  const frameCounter = useRef(0);
  const [explodingLetters, setExplodingLetters] = useState<ExplodingLetter[]>(
    [],
  );
  const [debrisParticles, setDebrisParticles] = useState<DebrisParticle[]>([]);
  const lastTypedCount = useRef(enemy.typedCharacters);

  // Use refs for callbacks so memo can't stale them
  const onReachPlayerReference = useRef(onReachPlayer);
  const onDestroyReference = useRef(onDestroy);

  useEffect(() => {
    onReachPlayerReference.current = onReachPlayer;
    onDestroyReference.current = onDestroy;
  }, [onDestroy, onReachPlayer]);

  const modelPath = getEnemyModelPath(enemy);
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Detect when a letter is typed and create explosion
  useEffect(() => {
    if (!(enemy.typedCharacters > lastTypedCount.current)) {
      return;
    }

    const letterIndex = lastTypedCount.current;
    const letter = enemy.word[letterIndex];

    if (letter && groupReference.current) {
      // Calculate dynamic letter spacing based on distance
      const playerZ = -20;
      const distanceFromPlayer = enemy.position.z - playerZ;
      const maxDistance = 55;
      const normalizedDistance = Math.max(
        0,
        Math.min(1, distanceFromPlayer / maxDistance),
      );
      const minSize = 0.5;
      const maxSize = 1.8;
      const fontSize = minSize + (maxSize - minSize) * normalizedDistance;
      const baseLetterSpacing = 1.2;
      const letterSpacing = baseLetterSpacing * (fontSize / 1);

      // Letter was at the first position (index 0) in the remaining letters display
      // It should explode from the leftmost position
      const remainingLetters = enemy.word.length - letterIndex;
      const totalWidth = (remainingLetters - 1) * letterSpacing;
      const xPos = -totalWidth / 2;

      // Create explosion particles
      const particles: ExplodingLetter[] = [];
      for (let index = 0; index < TUNING.letterParticleCount; index++) {
        const angle = (Math.PI * 2 * index) / TUNING.letterParticleCount;
        const speed =
          TUNING.letterMinimumSpeed + Math.random() * TUNING.letterSpeedRange; // Fast dispersal

        particles.push({
          letter: letter,
          position: new THREE.Vector3(
            xPos,
            0,
            enemy.isBoss ? TUNING.bossWordDepth : TUNING.regularWordDepth,
          ),
          velocity: new THREE.Vector3(
            Math.cos(angle) * speed,
            (Math.random() - 0.5) * TUNING.letterVerticalSpeedRange,
            Math.sin(angle) * speed,
          ),
          ...createParticleRotation(),
          scale:
            fontSize *
            (TUNING.letterMinimumScaleRatio +
              Math.random() * TUNING.letterScaleRatioRange),
          opacity: 1,
          life:
            TUNING.letterMinimumLifeFrames +
            Math.random() * TUNING.letterLifeRangeFrames, // Short life — clears quickly
        });
      }

      setExplodingLetters((previous) => [...previous, ...particles]);
    }

    lastTypedCount.current = enemy.typedCharacters;
  }, [enemy.typedCharacters, enemy.word, enemy.isBoss, enemy.position.z]);

  useEffect(() => {
    return () => {
      if (destructionTimeoutReference.current)
        clearTimeout(destructionTimeoutReference.current);
    };
  }, [enemy.id]);

  useFrame((state, delta) => {
    if (!isActive || !groupReference.current) return;

    if (!isDestroyingReference.current) {
      // Move enemy toward player - calculate direction each frame for tracking
      // Player is at z = -20, x = 0, y = 0
      const playerPos = { x: 0, y: 0, z: -20 };
      const currentPos = groupReference.current.position;

      // Calculate direction vector from enemy to player
      const dx = playerPos.x - currentPos.x;
      const dy = playerPos.y - currentPos.y;
      const dz = playerPos.z - currentPos.z;
      const distance = Math.hypot(dx, dy, dz);

      // Dynamic rotation - gradually turn to face the player
      if (distance > TUNING.minimumFacingDistance) {
        // Calculate the angle to face the player (Y-axis rotation)
        // Since ships spawn at rotation 0 facing forward (toward -Z), we need to adjust
        const targetAngle = Math.atan2(-dx, -dz); // Negative values because forward is -Z
        const currentAngle = groupReference.current.rotation.y;

        // Smoothly interpolate rotation
        const rotationSpeed = 2 * delta; // Adjust this to control turn speed
        const angleDiff = targetAngle - currentAngle;

        // Normalize angle difference to [-PI, PI]
        let normalizedDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
        if (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;

        // Apply smooth rotation
        groupReference.current.rotation.y +=
          normalizedDiff * Math.min(1, rotationSpeed);
      }

      // Enemy-to-enemy collision avoidance with very strong boundaries
      // Match ship scales: 1.5 for regular, 2.5 for boss
      const myRadius = enemy.isBoss
        ? TUNING.bossSeparationRadius
        : TUNING.regularSeparationRadius; // Increased collision radius
      const separationForce = { x: 0, y: 0, z: 0 };

      // Calculate word width for boundary consideration with dynamic scaling
      const playerZ = -20;
      const myDistanceFromPlayer = currentPos.z - playerZ;
      const maxDistance = 55;
      const myNormalizedDistance = Math.max(
        0,
        Math.min(1, myDistanceFromPlayer / maxDistance),
      );
      const minSize = 0.5;
      const maxSize = 1.8;
      const myFontSize = minSize + (maxSize - minSize) * myNormalizedDistance;
      const baseLetterSpacing = 1.2;
      const myLetterSpacing = baseLetterSpacing * (myFontSize / 1);
      const myWordWidth = enemy.word.length * myLetterSpacing;

      for (const otherEnemy of allEnemies) {
        if (otherEnemy.id === enemy.id) continue; // Skip self

        const odx = currentPos.x - otherEnemy.position.x;
        const ody = currentPos.y - otherEnemy.position.y;
        const odz = currentPos.z - otherEnemy.position.z;
        const otherDistance = Math.hypot(odx, ody, odz);

        const otherRadius = otherEnemy.isBoss
          ? TUNING.bossSeparationRadius
          : TUNING.regularSeparationRadius; // Increased collision radius
        // Calculate other enemy's dynamic word width
        const otherDistanceFromPlayer = otherEnemy.position.z - playerZ;
        const otherNormalizedDistance = Math.max(
          0,
          Math.min(1, otherDistanceFromPlayer / maxDistance),
        );
        const otherFontSize =
          minSize + (maxSize - minSize) * otherNormalizedDistance;
        const otherLetterSpacing = baseLetterSpacing * (otherFontSize / 1);
        const otherWordWidth = otherEnemy.word.length * otherLetterSpacing;

        // Consider both ship size and word width for separation with larger buffer
        const wordSeparation = (myWordWidth + otherWordWidth) / 2;
        const minSeparation =
          myRadius + otherRadius + wordSeparation + TUNING.wordSeparationBuffer; // Increased buffer to prevent clumping

        // If too close, add very strong repulsion force
        if (
          otherDistance < minSeparation &&
          otherDistance > TUNING.minimumFacingDistance
        ) {
          const repulsionStrength =
            (minSeparation - otherDistance) / minSeparation;
          // Much stronger repulsion force (increased to 3.0)
          const forceMultiplier =
            TUNING.separationStrength * (1 + repulsionStrength); // Stronger when closer
          separationForce.x +=
            (odx / otherDistance) * repulsionStrength * forceMultiplier;
          separationForce.y +=
            (ody / otherDistance) * repulsionStrength * forceMultiplier;
          separationForce.z +=
            (odz / otherDistance) * repulsionStrength * forceMultiplier;
        }
      }

      if (distance > TUNING.minimumMovementDistance) {
        // Move at constant speed toward player
        const normalizedDx = (dx / distance) * enemy.speed * delta;
        const normalizedDy = (dy / distance) * enemy.speed * delta;
        const normalizedDz = (dz / distance) * enemy.speed * delta;

        // Move toward player with separation force applied
        groupReference.current.position.x +=
          normalizedDx + separationForce.x * delta * TUNING.separationSpeed;
        groupReference.current.position.y +=
          normalizedDy + separationForce.y * delta * TUNING.separationSpeed;
        groupReference.current.position.z +=
          normalizedDz + separationForce.z * delta * TUNING.separationSpeed;

        // Update position in store for accurate separation calculations
        if (onPositionUpdate) {
          onPositionUpdate(enemy.id, {
            x: groupReference.current.position.x,
            y: groupReference.current.position.y,
            z: groupReference.current.position.z,
          });
        }

        // Recalculate distance AFTER movement for accurate collision detection
        const newDx = playerPos.x - groupReference.current.position.x;
        const newDy = playerPos.y - groupReference.current.position.y;
        const newDz = playerPos.z - groupReference.current.position.z;
        const newDistance = Math.hypot(newDx, newDy, newDz);

        // Check collision with player (ship radii overlap)
        const playerRadius = 3;
        const enemyRadius = enemy.isBoss
          ? TUNING.bossCollisionRadius
          : TUNING.regularCollisionRadius;
        if (newDistance < playerRadius + enemyRadius) {
          isDestroyingReference.current = true;
          setIsDestroying(true);
          onReachPlayerReference.current(enemy.id);
        }
      } else {
        // Reached player position
        isDestroyingReference.current = true;
        setIsDestroying(true);
        onReachPlayerReference.current(enemy.id);
      }

      // Pulsing effect based on typing progress
      if (enemy.typedCharacters > 0) {
        const progress = enemy.typedCharacters / enemy.word.length;
        const scale =
          1 +
          Math.sin(state.clock.elapsedTime * TUNING.damagePulseFrequency) *
            TUNING.damagePulseAmplitude *
            progress;
        groupReference.current.scale.setScalar(
          scale *
            (enemy.isBoss ? TUNING.bossPulseScale : TUNING.regularPulseScale),
        );
      } else {
        groupReference.current.scale.setScalar(
          enemy.isBoss ? TUNING.bossPulseScale : TUNING.regularPulseScale,
        );
      }
    }
    // Destruction stops movement, while its particles continue animating.
    const hasParticles =
      explodingLetters.length > 0 || debrisParticles.length > 0;
    if (hasParticles) {
      frameCounter.current++;
      if (frameCounter.current % TUNING.particleUpdateFrames === 0) {
        if (explodingLetters.length > 0) {
          setExplodingLetters((previous) => {
            const alive: ExplodingLetter[] = [];
            for (const particle of previous) {
              const p = cloneParticleForFrame(particle);
              p.position.add(p.velocity);
              p.velocity.y -= TUNING.letterGravity;
              p.rotation.x += p.rotationSpeed.x;
              p.rotation.y += p.rotationSpeed.y;
              p.rotation.z += p.rotationSpeed.z;
              p.scale *= TUNING.letterScaleDecay;
              p.opacity -= TUNING.letterFadePerUpdate;
              p.life -= 1;
              if (p.life > 0 && p.opacity > TUNING.minimumVisibleOpacity)
                alive.push(p);
            }
            return alive;
          });
        }

        if (debrisParticles.length > 0) {
          setDebrisParticles((previous) => {
            const alive: DebrisParticle[] = [];
            for (const particle of previous) {
              const p = cloneParticleForFrame(particle);
              p.position.add(p.velocity);
              p.velocity.x *= TUNING.debrisDrag;
              p.velocity.y =
                (p.velocity.y - TUNING.debrisGravity) * TUNING.debrisDrag;
              p.velocity.z *= TUNING.debrisDrag;
              p.rotation.x += p.rotationSpeed.x;
              p.rotation.y += p.rotationSpeed.y;
              p.rotation.z += p.rotationSpeed.z;
              p.opacity -= TUNING.debrisFadePerUpdate;
              p.life -= 1;
              if (p.life > 0 && p.opacity > TUNING.minimumVisibleOpacity)
                alive.push(p);
            }
            return alive;
          });
        }
      }
    }
  });

  // Destruction animation with debris
  useEffect(() => {
    if (!(enemy.health <= 0) || isDestroyingReference.current) {
      return;
    }

    isDestroyingReference.current = true;
    setIsDestroying(true);

    // Create debris explosion particles
    const debris: DebrisParticle[] = [];
    const debrisCount = enemy.isBoss
      ? TUNING.bossDebrisCount
      : TUNING.regularDebrisCount;
    const shipColor = enemy.isBoss ? "#ff00ff" : "#09ff00";

    for (let index = 0; index < debrisCount; index++) {
      const angle = (Math.PI * 2 * index) / debrisCount;
      const speed =
        TUNING.minimumDebrisSpeed + Math.random() * TUNING.debrisSpeedRange;
      const upwardBias =
        TUNING.minimumDebrisUpwardSpeed +
        Math.random() * TUNING.debrisUpwardSpeedRange;

      debris.push({
        position: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          upwardBias + (Math.random() - 0.5) * TUNING.debrisVerticalSpeedRange,
          Math.sin(angle) * speed,
        ),
        ...createParticleRotation(),
        scale:
          TUNING.minimumDebrisScale + Math.random() * TUNING.debrisScaleRange,
        opacity: 1,
        life:
          TUNING.minimumDebrisLifeFrames +
          Math.random() * TUNING.debrisLifeRangeFrames,
        color: Math.random() > 0.5 ? shipColor : "#ff4444",
      });
    }

    setDebrisParticles(debris);

    // Trigger explosion animation and remove ship
    destructionTimeoutReference.current = setTimeout(() => {
      if (onDestroyReference.current) {
        onDestroyReference.current(enemy.id);
      }
    }, TUNING.destructionDurationMs);
  }, [enemy.health, enemy.id, enemy.isBoss]);

  // Color based on enemy type and health
  const getColor = () => {
    if (enemy.isBoss) return "#ff00ff"; // Magenta for boss
    if (enemy.health < enemy.maxHealth * 0.5) return "#ff4444"; // Red when damaged
    return "#09ff00"; // Default cyan/green
  };

  // Split word into individual letters for explosion effect
  const letters = enemy.word.split("");

  // Calculate dynamic font size based on distance from player
  // Player is at z=-20, ships spawn at z=35, total range is 55 units
  const playerZ = -20;
  const distanceFromPlayer = enemy.position.z - playerZ; // Range: ~0 to 55

  // Scale font size: larger when far (1.8), smaller when close (0.5)
  // Using inverse relationship: far = large, near = small
  const minSize = 0.5;
  const maxSize = 1.8;
  const maxDistance = 55;
  const normalizedDistance = Math.max(
    0,
    Math.min(1, distanceFromPlayer / maxDistance),
  );
  const dynamicFontSize = minSize + (maxSize - minSize) * normalizedDistance;

  // Scale letter spacing proportionally to font size
  const baseLetterSpacing = 1.2;
  const dynamicLetterSpacing = baseLetterSpacing * (dynamicFontSize / 1);

  const shipScale = enemy.isBoss
    ? TUNING.bossModelScale
    : TUNING.regularModelScale;

  return (
    <group
      ref={groupReference}
      position={[enemy.position.x, enemy.position.y, enemy.position.z]}
    >
      {!isDestroying && <primitive object={clonedScene} scale={shipScale} />}

      {/* Word Display - Individual letters centered on front of ship */}
      {!isDestroying && (
        <group
          position={[
            0,
            0,
            enemy.isBoss ? TUNING.bossWordDepth : TUNING.regularWordDepth,
          ]}
          rotation={[0, Math.PI, 0]}
        >
          {letters.slice(enemy.typedCharacters).map((letter, index) => {
            // Only show untyped letters, starting from typedCharacters
            const actualIndex = index + enemy.typedCharacters;
            const remainingLetters = letters.length - enemy.typedCharacters;
            const totalWidth = (remainingLetters - 1) * dynamicLetterSpacing;
            // Keep centered as letters disappear
            const xPos = index * dynamicLetterSpacing - totalWidth / 2;

            return (
              <group
                key={`${enemy.id}-${actualIndex.toString()}`}
                position={[xPos, 0, 0]}
              >
                <Text
                  fontSize={dynamicFontSize}
                  color="#ff9800"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={TUNING.wordOutlineRatio * (dynamicFontSize / 1)}
                  outlineColor="#ff4400"
                  font="/assets/fonts/Orbitron-Regular.ttf"
                  userData={{
                    testId: getEnemyLetterId(enemy, actualIndex),
                  }}
                  name={getEnemyLetterId(enemy, actualIndex)}
                >
                  {letter}
                </Text>
              </group>
            );
          })}

          {/* Render exploding letter particles with orange glow */}
          {explodingLetters.map((particle, index) => (
            <group
              key={`explosion-${enemy.id}-${index.toString()}`}
              position={particle.position}
              rotation={particle.rotation}
            >
              <Text
                fontSize={particle.scale}
                color="#ff9800"
                anchorX="center"
                anchorY="middle"
                outlineWidth={TUNING.particleOutlineRatio * particle.scale}
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
      {!isDestroying && enemy.typedCharacters > 0 && (
        <mesh
          position={[0, TUNING.progressRingHeight, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[
              TUNING.progressRingInnerRadius,
              2,
              TUNING.progressRingSegments,
            ]}
          />
          <meshBasicMaterial
            color="#09ff00"
            opacity={0.7}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Health bar for boss */}
      {!isDestroying && enemy.isBoss && (
        <group position={[0, TUNING.bossHealthBarHeight, 0]}>
          {/* Background */}
          <mesh>
            <planeGeometry
              args={[
                TUNING.bossHealthBarWidth,
                TUNING.bossHealthBarBackgroundHeight,
              ]}
            />
            <meshBasicMaterial color="#333333" />
          </mesh>
          {/* Health fill */}
          <mesh
            position={[
              -(
                TUNING.bossHealthBarWidth -
                (TUNING.bossHealthBarWidth * enemy.health) / enemy.maxHealth
              ) / 2,
              0,
              TUNING.bossHealthBarDepth,
            ]}
          >
            <planeGeometry
              args={[
                (TUNING.bossHealthBarWidth * enemy.health) / enemy.maxHealth,
                TUNING.bossHealthBarFillHeight,
              ]}
            />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </group>
      )}

      {/* Glow effect */}
      {!isDestroying && (
        <pointLight
          color={getColor()}
          intensity={
            enemy.isBoss
              ? TUNING.bossGlowIntensity
              : TUNING.regularGlowIntensity
          }
          distance={15}
          decay={2}
        />
      )}

      {/* Render debris particles on ship destruction */}
      {debrisParticles.map((particle, index) => (
        <mesh
          key={`debris-${enemy.id}-${index.toString()}`}
          position={particle.position}
          rotation={particle.rotation}
          scale={particle.scale}
        >
          <boxGeometry
            args={[
              TUNING.debrisBoxSize,
              TUNING.debrisBoxSize,
              TUNING.debrisBoxSize,
            ]}
          />
          <meshStandardMaterial
            color={particle.color}
            opacity={particle.opacity}
            transparent
            emissive={particle.color}
            emissiveIntensity={TUNING.debrisEmissiveIntensity}
          />
        </mesh>
      ))}
    </group>
  );
};

// Memoize component to prevent unnecessary re-renders
// Position changes are handled via Three.js refs, not React re-renders
export const EnemyShip = memo(EnemyShipComponent);

EnemyShip.displayName = "EnemyShip";
