/**
 * GameCanvas Component
 * Game content rendered inside the main App Canvas
 * No longer creates its own Canvas - eliminates WebGL context switching
 */
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameContext';
import { enemySpawner } from '../utils/enemySpawner';
import { EnemyShip } from '../entities/EnemyShip';
import { PlayerShip } from '../entities/PlayerShip';
import { CanvasHUD } from './CanvasHUD';
import { LaserTargetHelper } from './LaserTargetHelper';
import { getAudioManager } from '../utils/audioManager';
import { debug, error as logError, info } from '../utils/logger';

function GameLogic() {
  const store = useGameStore();
  const { 
    level, 
    mode, 
    programmingLanguage, 
    enemies,
    addEnemy,
    removeEnemy,
    updateEnemy,
    takeDamage,
    isPaused,
    isGameOver,
    currentDifficulty,
  } = useGameStore();
  
  const spawnerInitialized = useRef(false);

  // Initialize spawner when game starts
  useEffect(() => {
    if (mode === 'normal' || mode === 'programming') {
      enemySpawner.reset();
      spawnerInitialized.current = true;
      info('Enemy spawner initialized', { mode }, 'GameCanvas');
      
      // Force spawn first enemy after a short delay
      setTimeout(() => {
        const isBossLevel = level % 3 === 0 && level > 0;
        debug('Force spawning first enemy', { level, isBoss: isBossLevel, difficulty: store.currentDifficulty }, 'GameCanvas');
        const firstEnemy = enemySpawner.forceSpawn(level, mode, programmingLanguage, isBossLevel, store.currentDifficulty);
        if (firstEnemy) {
          debug('First enemy spawned', { word: firstEnemy.word, isBoss: firstEnemy.isBoss }, 'GameCanvas');
          addEnemy(firstEnemy);
        } else {
          logError('Failed to spawn first enemy', undefined, 'GameCanvas');
        }
      }, 1000);
    }
  }, [mode, level, programmingLanguage, addEnemy]);

  // Game loop - spawning and updates
  useFrame((_state, delta) => {
    // Only spawn if in active game mode
    if (mode !== 'normal' && mode !== 'programming') {
      return;
    }
    if (isPaused || isGameOver) {
      return;
    }

    // Check for collisions between enemies and player
    const playerPos = { x: 0, y: 0, z: -20 };
    const playerRadius = 3; // Player collision radius (player ship scale is 2)
    
    enemies.forEach(enemy => {
      const dx = enemy.position.x - playerPos.x;
      const dy = enemy.position.y - playerPos.y;
      const dz = enemy.position.z - playerPos.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      // Match ship scales: 1.5 for regular, 2.5 for boss
      const enemyRadius = enemy.isBoss ? 4 : 2.5;
      const collisionDistance = playerRadius + enemyRadius;
      
      // Check if enemy collided with player (when noses touch)
      if (distance < collisionDistance) {
        // Deal damage and remove enemy
        const damage = enemy.isBoss ? 50 : 10;
        debug('Ship collision', { word: enemy.word, damage, isBoss: enemy.isBoss }, 'GameCanvas');
        
        // Play collision effects
        getAudioManager().playDamage();
        getAudioManager().playExplosion();
        
        takeDamage(damage);
        removeEnemy(enemy.id);
      }
    });

    // Try to spawn new enemy
    const newEnemy = enemySpawner.update(
      delta,
      level,
      mode,
      programmingLanguage,
      enemies.length,
      currentDifficulty
    );

    if (newEnemy) {
      debug('Spawned enemy', { word: newEnemy.word, position: newEnemy.position }, 'GameCanvas');
      addEnemy(newEnemy);
    }
  });

  // Handle enemy reaching player
  const handleEnemyReachPlayer = (enemyId: string) => {
    const enemy = enemies.find(e => e.id === enemyId);
    if (enemy) {
      // Deal damage based on enemy type
      const damage = enemy.isBoss ? 50 : 10;
      debug('Enemy reached player', { damage, isBoss: enemy.isBoss }, 'GameCanvas');
      takeDamage(damage);
      removeEnemy(enemyId);
    }
  };

  // Handle enemy destruction
  const handleEnemyDestroy = (enemyId: string) => {
    debug('Enemy destroyed', { id: enemyId }, 'GameCanvas');
    removeEnemy(enemyId);
  };

  // Handle enemy position updates for accurate collision detection
  const handlePositionUpdate = (enemyId: string, position: { x: number; y: number; z: number }) => {
    updateEnemy(enemyId, { position });
  };

  return (
    <>
      {/* Render all enemies */}
      {enemies.map(enemy => (
        <EnemyShip
          key={enemy.id}
          enemy={enemy}
          onReachPlayer={handleEnemyReachPlayer}
          onDestroy={handleEnemyDestroy}
          onPositionUpdate={handlePositionUpdate}
          allEnemies={enemies}
        />
      ))}
    </>
  );
}

// GameCanvas is now just the game content, no longer creates its own Canvas
// It's rendered inside the main App Canvas
export function GameCanvas() {
  return (
    <>
      {/* Game lighting */}
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[20, 5, -10]} color="#ff0088" intensity={0.8} distance={50} />
      <pointLight position={[0, 15, -30]} color="#0088ff" intensity={0.8} distance={50} />

      {/* Player ship with Rodin model */}
      <PlayerShip />

      {/* Game logic component */}
      <GameLogic />
      
      {/* Laser target helper - updates laser target position */}
      <LaserTargetHelper />
      
      {/* HUD rendered inside Canvas */}
      <CanvasHUD />
    </>
  );
}