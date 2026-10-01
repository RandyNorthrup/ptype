/**
 * SpaceScene - 3D space environment with stars, asteroids, and nebula
 * Rendered inside React Three Fiber Canvas
 */
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TUNING = {
  particleTextureRadiusPx: 16,
  particleGlowStop: 0.4,
  particleTextureSizePx: 32,
  randomIndexFrequency: 12.9898,
  randomSaltFrequency: 78.233,
  randomAmplitude: 43_758.5453,
  starCount: 5000,
  vectorComponents: 3,
  starMinimumRadius: 200,
  starRadiusRange: 800,
  starLatitudeSalt: 3,
  starDepthOffset: 400,
  starColorSalt: 4,
  whiteStarProbability: 0.7,
  blueStarCumulativeProbability: 0.85,
  starYawRadiansPerSecond: 0.01,
  starPitchRadiansPerSecond: 0.005,
  cloudAngleSalt: 5,
  cloudRadiusSalt: 6,
  cloudHeightSalt: 7,
  cloudHeightRange: 60,
  cloudRotationRadiansPerSecond: 0.05,
  cloudInitialDepth: 80,
  cloudDepthSpacing: 40,
  asteroidXSalt: 8,
  asteroidWidth: 1000,
  asteroidYSalt: 9,
  asteroidHeight: 600,
  asteroidInitialDepth: -300,
  asteroidDepthSalt: 10,
  asteroidDepthRange: 800,
  asteroidPitchSalt: 12,
  asteroidYawSalt: 13,
  asteroidRollSalt: 14,
  asteroidRotationRange: 0.5,
  cloudOpacity: 0.5,
  minimumAsteroidSize: 3,
  asteroidSizeSalt: 11,
  asteroidSizeRange: 8,
} as const;

const NEBULA_CLOUD_COLORS = [
  { red: 0.7, green: 0.2, blue: 1 },
  { red: 0.2, green: 0.8, blue: 1 },
  { red: 1, green: 0.3, blue: 0.8 },
] as const;

function createParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TUNING.particleTextureSizePx;
  canvas.height = TUNING.particleTextureSizePx;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable");
  const gradient = context.createRadialGradient(
    TUNING.particleTextureRadiusPx,
    TUNING.particleTextureRadiusPx,
    0,
    TUNING.particleTextureRadiusPx,
    TUNING.particleTextureRadiusPx,
    TUNING.particleTextureRadiusPx,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(TUNING.particleGlowStop, "rgba(255,255,255,0.6)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(
    0,
    0,
    TUNING.particleTextureSizePx,
    TUNING.particleTextureSizePx,
  );
  return new THREE.CanvasTexture(canvas);
}

function deterministicRandom(index: number, salt: number): number {
  const value =
    Math.sin(
      index * TUNING.randomIndexFrequency + salt * TUNING.randomSaltFrequency,
    ) * TUNING.randomAmplitude;
  return value - Math.floor(value);
}

// Star field component
function StarField() {
  const starsReference = useRef<THREE.Points>(null);
  const starTexture = useMemo(() => createParticleTexture(), []);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(
      TUNING.starCount * TUNING.vectorComponents,
    );
    const colors = new Float32Array(TUNING.starCount * TUNING.vectorComponents);

    for (let index = 0; index < TUNING.starCount; index++) {
      const index3 = index * TUNING.vectorComponents;

      // Random position in a large sphere - works for both menu and game cameras
      const radius =
        TUNING.starMinimumRadius +
        deterministicRandom(index, 1) * TUNING.starRadiusRange;
      const theta = deterministicRandom(index, 2) * Math.PI * 2;
      const phi = Math.acos(
        2 * deterministicRandom(index, TUNING.starLatitudeSalt) - 1,
      );

      positions[index3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[index3 + 2] = radius * Math.cos(phi) - TUNING.starDepthOffset; // Centered around origin

      // Star colors - white, blue, yellow tints
      const colorType = deterministicRandom(index, TUNING.starColorSalt);
      if (colorType < TUNING.whiteStarProbability) {
        // White stars
        colors[index3] = 1;
        colors[index3 + 1] = 1;
        colors[index3 + 2] = 1;
      } else if (colorType < TUNING.blueStarCumulativeProbability) {
        // Blue stars
        colors[index3] = 0.7;
        colors[index3 + 1] = 0.8;
        colors[index3 + 2] = 1;
      } else {
        // Yellow/orange stars
        colors[index3] = 1;
        colors[index3 + 1] = 0.9;
        colors[index3 + 2] = 0.7;
      }
    }

    return [positions, colors];
  }, []);

  // Gentle rotation
  useFrame((_state, delta) => {
    if (!starsReference.current) {
      return;
    }

    starsReference.current.rotation.y += delta * TUNING.starYawRadiansPerSecond;
    starsReference.current.rotation.x +=
      delta * TUNING.starPitchRadiansPerSecond;
  });

  return (
    <points ref={starsReference}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / TUNING.vectorComponents}
          array={positions}
          itemSize={3}
          args={[positions, TUNING.vectorComponents]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / TUNING.vectorComponents}
          array={colors}
          itemSize={3}
          args={[colors, TUNING.vectorComponents]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        map={starTexture}
      />
    </points>
  );
}

// Asteroid component
function Asteroid({
  position,
  size,
  rotationSpeed,
}: {
  position: [number, number, number];
  size: number;
  rotationSpeed: [number, number, number];
}) {
  const meshReference = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (!meshReference.current) {
      return;
    }

    meshReference.current.rotation.x += rotationSpeed[0] * delta;
    meshReference.current.rotation.y += rotationSpeed[1] * delta;
    meshReference.current.rotation.z += rotationSpeed[2] * delta;
  });

  return (
    <mesh ref={meshReference} position={position}>
      <dodecahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color="#555555"
        roughness={0.9}
        metalness={0.1}
        emissive="#111111"
      />
    </mesh>
  );
}

// Nebula cloud using particles
function NebulaClouds() {
  const cloudReferences = useRef<
    (THREE.Points<
      THREE.BufferGeometry<THREE.NormalOrGLBufferAttributes>
    > | null)[]
  >([]);
  const nebulaTexture = useMemo(() => createParticleTexture(), []);

  const clouds = useMemo(() => {
    return Array.from({ length: 3 }, (_, cloudIndex) => {
      const particleCount = 1000;
      const positions = new Float32Array(
        particleCount * TUNING.vectorComponents,
      );
      const colors = new Float32Array(particleCount * TUNING.vectorComponents);

      // Cloud colors - richer and more vibrant
      const cloudColors =
        NEBULA_CLOUD_COLORS[cloudIndex] ?? NEBULA_CLOUD_COLORS[0];

      for (let index = 0; index < particleCount; index++) {
        const index3 = index * TUNING.vectorComponents;

        // Cluster particles in a cloud shape - centered at origin, each cloud at different depth
        const randomIndex = cloudIndex * particleCount + index;
        const angle =
          deterministicRandom(randomIndex, TUNING.cloudAngleSalt) * Math.PI * 2;
        const radius =
          deterministicRandom(randomIndex, TUNING.cloudRadiusSalt) * 100;
        const height =
          (deterministicRandom(randomIndex, TUNING.cloudHeightSalt) - 0.5) *
          TUNING.cloudHeightRange;

        positions[index3] = Math.cos(angle) * radius;
        positions[index3 + 1] = height;
        positions[index3 + 2] = Math.sin(angle) * radius;

        colors[index3] = cloudColors.red;
        colors[index3 + 1] = cloudColors.green;
        colors[index3 + 2] = cloudColors.blue;
      }

      return { positions, colors };
    });
  }, []); // Static positions

  useFrame((_state, delta) => {
    for (const [index, cloud] of cloudReferences.current.entries()) {
      if (cloud) {
        cloud.rotation.z +=
          delta *
          TUNING.cloudRotationRadiansPerSecond *
          (index % 2 === 0 ? 1 : -1);
      }
    }
  });

  return (
    <>
      {clouds.map((cloud, index) => (
        <points
          key={index}
          position={[
            0,
            0,
            TUNING.cloudInitialDepth + index * TUNING.cloudDepthSpacing,
          ]} // Nebula clouds in the distance
          ref={(element) => {
            if (element) cloudReferences.current[index] = element;
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={cloud.positions.length / TUNING.vectorComponents}
              array={cloud.positions}
              itemSize={3}
              args={[cloud.positions, TUNING.vectorComponents]}
            />
            <bufferAttribute
              attach="attributes-color"
              count={cloud.colors.length / TUNING.vectorComponents}
              array={cloud.colors}
              itemSize={3}
              args={[cloud.colors, TUNING.vectorComponents]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={5}
            vertexColors
            transparent
            opacity={TUNING.cloudOpacity}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            map={nebulaTexture}
          />
        </points>
      ))}
    </>
  );
}

// Main space scene component
export function SpaceScene() {
  // Generate asteroid positions
  const asteroids = useMemo(() => {
    return Array.from({ length: 50 }, (_, index) => {
      const position: [number, number, number] = [
        (deterministicRandom(index, TUNING.asteroidXSalt) - 0.5) *
          TUNING.asteroidWidth,
        (deterministicRandom(index, TUNING.asteroidYSalt) - 0.5) *
          TUNING.asteroidHeight,
        TUNING.asteroidInitialDepth -
          deterministicRandom(index, TUNING.asteroidDepthSalt) *
            TUNING.asteroidDepthRange,
      ];
      const rotationSpeed: [number, number, number] = [
        (deterministicRandom(index, TUNING.asteroidPitchSalt) - 0.5) *
          TUNING.asteroidRotationRange,
        (deterministicRandom(index, TUNING.asteroidYawSalt) - 0.5) *
          TUNING.asteroidRotationRange,
        (deterministicRandom(index, TUNING.asteroidRollSalt) - 0.5) *
          TUNING.asteroidRotationRange,
      ];
      return {
        position,
        size:
          TUNING.minimumAsteroidSize +
          deterministicRandom(index, TUNING.asteroidSizeSalt) *
            TUNING.asteroidSizeRange,
        rotationSpeed,
      };
    });
  }, []);

  return (
    <>
      {/* Ambient lighting for the scene */}
      <ambientLight intensity={0.1} />

      {/* Star field */}
      <StarField />

      {/* Nebula clouds */}
      <NebulaClouds />

      {/* Asteroids */}
      {asteroids.map((asteroid, index) => (
        <Asteroid key={index} {...asteroid} />
      ))}
    </>
  );
}
