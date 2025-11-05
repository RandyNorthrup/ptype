/**
 * Achievement Components
 * SVG icon-based achievement badges and display trophies
 * 19 total achievements matching core/achievements.py
 * Icons from Icons8 (high-quality color SVGs)
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { error as logError } from '../utils/logger';

interface AchievementProps {
  position?: [number, number, number];
  scale?: number;
  rotating?: boolean;
  iconPath: string;
  color: string;
  emissiveColor?: string;
}

// Generic achievement badge with SVG icon
export function AchievementBadge({ 
  position = [0, 0, 0], 
  scale = 1, 
  rotating = false,
  iconPath,
  color,
  emissiveColor = color,
}: AchievementProps) {
  const groupRef = useRef<any>(null);
  
  // Load texture with error handling
  let iconTexture;
  try {
    iconTexture = useTexture(iconPath);
  } catch (err) {
    logError(`Failed to load achievement icon: ${iconPath}`, err, 'Trophies');
    // Return a basic badge without icon on error
    return (
      <group ref={groupRef} position={position} scale={scale}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial 
            color={color} 
            metalness={0.85} 
            roughness={0.15}
            emissive={emissiveColor}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    );
  }
  
  // Configure texture for SVG
  useMemo(() => {
    if (iconTexture) {
      iconTexture.colorSpace = THREE.SRGBColorSpace;
      iconTexture.minFilter = THREE.LinearFilter;
      iconTexture.magFilter = THREE.LinearFilter;
    }
  }, [iconTexture]);
  
  useFrame(() => {
    if (groupRef.current && rotating) groupRef.current.rotation.y += 0.01;
  });
  
  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Badge circle */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.85} 
          roughness={0.15}
          emissive={emissiveColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Icon plane with SVG texture */}
      <mesh position={[0, 0, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshBasicMaterial 
          map={iconTexture} 
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Specific achievement components
export function FirstSteps(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/baby-bottle.svg" color="#90EE90" emissiveColor="#00ff00" />;
}

export function SpeedDemon(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/lightning-bolt.svg" color="#FF6B6B" emissiveColor="#ff0000" />;
}

export function AccuracyMaster(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/accuracy.svg" color="#4ECDC4" emissiveColor="#00ffff" />;
}

export function BossSlayer(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/sword.svg" color="#800080" emissiveColor="#ff00ff" />;
}

export function Level10(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/bronze-medal.svg" color="#CD7F32" emissiveColor="#ffaa00" />;
}

export function Level20(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/star.svg" color="#FFD700" emissiveColor="#ff0066" />;
}

export function PerfectGame(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/checkmark.svg" color="#09ff00" emissiveColor="#00ff00" />;
}

export function Marathon(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/stopwatch.svg" color="#FF8C00" emissiveColor="#ff6600" />;
}

export function Polyglot(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/code.svg" color="#9370DB" emissiveColor="#8800ff" />;
}

export function HighScorer(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/dollar-coin.svg" color="#FFD700" emissiveColor="#ffdd00" />;
}

export function Veteran(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/army-star.svg" color="#4169E1" emissiveColor="#cc6600" />;
}

export function WordMaster(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/dictionary.svg" color="#1E90FF" emissiveColor="#0066ff" />;
}

export function TriviaNovice(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/question-mark.svg" color="#87CEEB" emissiveColor="#00aaff" />;
}

export function TriviaExpert(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/brain.svg" color="#4169E1" emissiveColor="#0044ff" />;
}

export function TriviaMaster(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/graduation-cap.svg" color="#8A2BE2" emissiveColor="#6600ff" />;
}

export function TriviaGenius(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/wizard.svg" color="#9400D3" emissiveColor="#8800ff" />;
}

export function PerfectTrivia(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/checkmark.svg" color="#FFD700" emissiveColor="#ffee00" />;
}

export function BonusCollector(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/gift.svg" color="#FF69B4" emissiveColor="#ff00aa" />;
}

export function BonusMaster(props: Omit<AchievementProps, 'iconPath' | 'color' | 'emissiveColor'>) {
  return <AchievementBadge {...props} iconPath="/assets/icons/crown.svg" color="#FF1493" emissiveColor="#ff0088" />;
}

// ========== Display Trophies ==========

interface TrophyProps {
  position?: [number, number, number];
  scale?: number;
  rotating?: boolean;
}

export function BronzeTrophy({ position = [0, 0, 0], scale = 1, rotating = false }: TrophyProps) {
  const groupRef = useRef<any>(null);
  useFrame(() => {
    if (groupRef.current && rotating) groupRef.current.rotation.y += 0.01;
  });
  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.2, 32]} />
        <meshStandardMaterial color="#2d1810" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.4, 32]} />
        <meshStandardMaterial color="#3d2010" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.4, 32]} />
        <meshStandardMaterial color="#cd7f32" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.35, 0.25, 0.3, 32]} />
        <meshStandardMaterial color="#b87333" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.35, 0.05, 16, 32]} />
        <meshStandardMaterial color="#cd7f32" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} emissive="#ffa500" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export function SilverTrophy({ position = [0, 0, 0], scale = 1, rotating = false }: TrophyProps) {
  const groupRef = useRef<any>(null);
  useFrame(() => {
    if (groupRef.current && rotating) groupRef.current.rotation.y += 0.01;
  });
  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.2, 32]} />
        <meshStandardMaterial color="#2d1810" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.4, 32]} />
        <meshStandardMaterial color="#3d2010" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.4, 32]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.35, 0.25, 0.3, 32]} />
        <meshStandardMaterial color="#b8b8b8" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.35, 0.05, 16, 32]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.98} roughness={0.02} />
      </mesh>
      <mesh position={[-0.45, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.15, 0.04, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[0.45, 0.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.15, 0.04, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.02} emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export function GoldTrophy({ position = [0, 0, 0], scale = 1, rotating = false }: TrophyProps) {
  const groupRef = useRef<any>(null);
  useFrame(() => {
    if (groupRef.current && rotating) groupRef.current.rotation.y += 0.01;
  });
  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.45, 0.55, 0.25, 32]} />
        <meshStandardMaterial color="#2d1810" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.32, 0.38, 0.5, 32]} />
        <meshStandardMaterial color="#3d2010" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.45, 32]} />
        <meshStandardMaterial color="#ffd700" metalness={0.98} roughness={0.02} emissive="#ffaa00" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.38, 0.28, 0.35, 32]} />
        <meshStandardMaterial color="#ffdd00" metalness={0.98} roughness={0.02} emissive="#ffaa00" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.38, 0.06, 16, 32]} />
        <meshStandardMaterial color="#ffd700" metalness={0.99} roughness={0.01} emissive="#ffaa00" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.48, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.18, 0.05, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#ffcc00" metalness={0.98} roughness={0.02} emissive="#ffaa00" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.48, 0.25, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.18, 0.05, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#ffcc00" metalness={0.98} roughness={0.02} emissive="#ffaa00" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <torusGeometry args={[0.32, 0.02, 16, 32]} />
        <meshStandardMaterial color="#ffdd00" metalness={0.98} roughness={0.02} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.36, 0.02, 16, 32]} />
        <meshStandardMaterial color="#ffdd00" metalness={0.98} roughness={0.02} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#ffffff" metalness={0.99} roughness={0.01} emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function PlatinumTrophy({ position = [0, 0, 0], scale = 1, rotating = false }: TrophyProps) {
  const groupRef = useRef<any>(null);
  useFrame(() => {
    if (groupRef.current && rotating) groupRef.current.rotation.y += 0.01;
  });
  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh position={[0, -0.95, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.3, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.35, 0.42, 0.6, 32]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.5, 32]} />
        <meshStandardMaterial color="#e5e4e2" metalness={0.99} roughness={0.01} emissive="#ccffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.42, 0.3, 0.4, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.99} roughness={0.01} emissive="#aaddff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <torusGeometry args={[0.42, 0.07, 16, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.99} roughness={0.01} emissive="#00ffff" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.5, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.2, 0.05, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#e5e4e2" metalness={0.98} roughness={0.02} emissive="#00ffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.5, 0.25, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.2, 0.05, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#e5e4e2" metalness={0.98} roughness={0.02} emissive="#00ffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <torusGeometry args={[0.35, 0.02, 16, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.02} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.4, 0.02, 16, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.02} />
      </mesh>
    </group>
  );
}
