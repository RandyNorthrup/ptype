/**
 * SpaceScene - 3D space environment with stars, asteroids, and nebula
 * Rendered inside React Three Fiber Canvas
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Star field component
function StarField() {
  const starsRef = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(5000 * 3);
    const colors = new Float32Array(5000 * 3);
    
    for (let i = 0; i < 5000; i++) {
      const i3 = i * 3;
      
      // Random position in a large sphere - works for both menu and game cameras
      const radius = 200 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi) - 400; // Centered around origin
      
      // Star colors - white, blue, yellow tints
      const colorType = Math.random();
      if (colorType < 0.7) {
        // White stars
        colors[i3] = 1;
        colors[i3 + 1] = 1;
        colors[i3 + 2] = 1;
      } else if (colorType < 0.85) {
        // Blue stars
        colors[i3] = 0.7;
        colors[i3 + 1] = 0.8;
        colors[i3 + 2] = 1;
      } else {
        // Yellow/orange stars
        colors[i3] = 1;
        colors[i3 + 1] = 0.9;
        colors[i3 + 2] = 0.7;
      }
    }
    
    return [positions, colors];
  }, []);
  
  // Gentle rotation
  useFrame((_state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.01;
      starsRef.current.rotation.x += delta * 0.005;
    }
  });
  
  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        map={(() => {
          // Create round star texture
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d')!;
          const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
          gradient.addColorStop(0, 'rgba(255,255,255,1)');
          gradient.addColorStop(0.4, 'rgba(255,255,255,0.6)');
          gradient.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 32, 32);
          const texture = new THREE.CanvasTexture(canvas);
          return texture;
        })()}
      />
    </points>
  );
}

// Asteroid component
function Asteroid({ position, size, rotationSpeed }: { 
  position: [number, number, number]; 
  size: number;
  rotationSpeed: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed[0] * delta;
      meshRef.current.rotation.y += rotationSpeed[1] * delta;
      meshRef.current.rotation.z += rotationSpeed[2] * delta;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
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
  const cloudRefs = useRef<any[]>([]);
  
  const clouds = useMemo(() => {
    return Array.from({ length: 3 }, (_, cloudIndex) => {
      const particleCount = 1000;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      // Cloud colors - richer and more vibrant
      const cloudColors = [
        [0.7, 0.2, 1.0], // Vivid Purple
        [0.2, 0.8, 1.0], // Bright Cyan
        [1.0, 0.3, 0.8], // Hot Pink
      ][cloudIndex];
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Cluster particles in a cloud shape - centered at origin, each cloud at different depth
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 100;
        const height = (Math.random() - 0.5) * 60;
        
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = height;
        positions[i3 + 2] = Math.sin(angle) * radius;
        
        colors[i3] = cloudColors[0];
        colors[i3 + 1] = cloudColors[1];
        colors[i3 + 2] = cloudColors[2];
      }
      
      return { positions, colors };
    });
  }, []); // Static positions
  
  useFrame((_state, delta) => {
    cloudRefs.current.forEach((cloud, index) => {
      if (cloud) {
        cloud.rotation.z += delta * 0.05 * (index % 2 === 0 ? 1 : -1);
      }
    });
  });
  
  return (
    <>
      {clouds.map((cloud, index) => (
        <points 
          key={index}
          position={[0, 0, 80 + index * 40]} // Nebula clouds in the distance
          ref={(el) => {
            if (el) cloudRefs.current[index] = el;
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={cloud.positions.length / 3}
              array={cloud.positions}
              itemSize={3}
              args={[cloud.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              count={cloud.colors.length / 3}
              array={cloud.colors}
              itemSize={3}
              args={[cloud.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={5}
            vertexColors
            transparent
            opacity={0.5}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            map={(() => {
              // Create round particle texture
              const canvas = document.createElement('canvas');
              canvas.width = 32;
              canvas.height = 32;
              const ctx = canvas.getContext('2d')!;
              const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
              gradient.addColorStop(0, 'rgba(255,255,255,1)');
              gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
              gradient.addColorStop(1, 'rgba(255,255,255,0)');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, 32, 32);
              const texture = new THREE.CanvasTexture(canvas);
              return texture;
            })()}
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
    return Array.from({ length: 50 }, () => ({
      position: [
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 600,
        -300 - Math.random() * 800,
      ] as [number, number, number],
      size: 3 + Math.random() * 8,
      rotationSpeed: [
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
      ] as [number, number, number],
    }));
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
