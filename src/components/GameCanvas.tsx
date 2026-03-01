/**
 * GameCanvas Component
 * Game content rendered inside the main App Canvas
 * No longer creates its own Canvas - eliminates WebGL context switching
 */
import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameContext';
import { enemySpawner } from '../utils/enemySpawner';
import { EnemyShip } from '../entities/EnemyShip';
import { PlayerShip } from '../entities/PlayerShip';
import { CanvasHUD } from './CanvasHUD';
import { LaserTargetHelper } from './LaserTargetHelper';
import { getAudioManager } from '../utils/audioManager';
import { isBossLevel } from '../types';
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
    takeDamage,
    updateStats,
    isPaused,
    isGameOver,
    currentDifficulty,
    decrementEmpCooldown,
    incrementWordsMissed,
    wordsCorrect,
    wordsMissed,
    startTime,
  } = store;
  
  const spawnerInitialized = useRef(false);
  const firstSpawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Ref-based position map to avoid O(N²) state updates per frame
  const livePositionsRef = useRef(new Map<string, { x: number; y: number; z: number }>());
  // Ref for enemies so handleEnemyReachPlayer doesn't depend on enemies array
  const enemiesRef = useRef(enemies);
  enemiesRef.current = enemies;
  // Enemies with live positions merged in for collision avoidance
  const [liveEnemies, setLiveEnemies] = useState<typeof enemies>([]);
  const liveEnemiesUpdateRef = useRef(0);
  // Ref for stats calculation
  const lastStatsUpdateRef = useRef(0);

  // Initialize spawner when game starts
  useEffect(() => {
    if (mode === 'normal' || mode === 'programming') {
      enemySpawner.reset();
      spawnerInitialized.current = true;
      info('Enemy spawner initialized', { mode }, 'GameCanvas');
      
      firstSpawnTimeoutRef.current = setTimeout(() => {
        const isBoss = isBossLevel(level);
        debug('Force spawning first enemy', { level, isBoss, difficulty: store.currentDifficulty }, 'GameCanvas');
        const firstEnemy = enemySpawner.forceSpawn(level, mode, programmingLanguage, isBoss, store.currentDifficulty);
        if (firstEnemy) {
          debug('First enemy spawned', { word: firstEnemy.word, isBoss: firstEnemy.isBoss }, 'GameCanvas');
          addEnemy(firstEnemy);
        } else {
          logError('Failed to spawn first enemy', undefined, 'GameCanvas');
        }
      }, 1000);
    }

    return () => {
      if (firstSpawnTimeoutRef.current) clearTimeout(firstSpawnTimeoutRef.current);
    };
  }, [mode, level, programmingLanguage, addEnemy]);

  // Game loop - spawning, updates, and stats calculation
  useFrame((_state, delta) => {
    // Only run if in active game mode
    if (mode !== 'normal' && mode !== 'programming') {
      return;
    }
    if (isPaused || isGameOver) {
      return;
    }

    // Tick EMP cooldown each frame
    decrementEmpCooldown();

    // Calculate WPM and accuracy every second
    const now = Date.now();
    if (now - lastStatsUpdateRef.current >= 1000) {
      lastStatsUpdateRef.current = now;
      const elapsedMinutes = Math.max((now - startTime) / 60000, 1 / 60); // min 1 second
      const wpm = Math.round(wordsCorrect / elapsedMinutes);
      const totalAttempts = wordsCorrect + wordsMissed;
      const accuracy = totalAttempts > 0 ? Math.round((wordsCorrect / totalAttempts) * 1000) / 10 : 100;
      updateStats(wpm, accuracy);
    }

    // Every 5 frames, merge live positions into the enemy list for collision avoidance
    liveEnemiesUpdateRef.current++;
    if (liveEnemiesUpdateRef.current % 5 === 0) {
      const posMap = livePositionsRef.current;
      if (posMap.size > 0) {
        setLiveEnemies(
          enemies.map(e => {
            const livePos = posMap.get(e.id);
            return livePos ? { ...e, position: livePos } : e;
          })
        );
      } else {
        setLiveEnemies(enemies);
      }
    }

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

  // Handle enemy reaching player — deal damage, play sounds, increment missed, and remove
  // Boss collision is always fatal (instant kill)
  const handleEnemyReachPlayer = useCallback((enemyId: string) => {
    const enemy = enemiesRef.current.find(e => e.id === enemyId);
    if (enemy) {
      const damage = enemy.isBoss ? 99999 : 10;
      debug('Enemy reached player', { damage, isBoss: enemy.isBoss }, 'GameCanvas');
      getAudioManager().playDamage();
      getAudioManager().playExplosion();
      takeDamage(damage);
      incrementWordsMissed();
      removeEnemy(enemyId);
      livePositionsRef.current.delete(enemyId);
    }
  }, [takeDamage, removeEnemy, incrementWordsMissed]);

  // Handle enemy destruction
  const handleEnemyDestroy = useCallback((enemyId: string) => {
    debug('Enemy destroyed', { id: enemyId }, 'GameCanvas');
    removeEnemy(enemyId);
    livePositionsRef.current.delete(enemyId);
  }, [removeEnemy]);

  // Handle enemy position updates — store in ref map (no state churn)
  const handlePositionUpdate = useCallback((enemyId: string, position: { x: number; y: number; z: number }) => {
    livePositionsRef.current.set(enemyId, position);
  }, []);

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
          allEnemies={liveEnemies}
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