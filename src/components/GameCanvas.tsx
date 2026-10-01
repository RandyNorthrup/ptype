/**
 * GameCanvas Component
 * Game content rendered inside the main App Canvas
 * No longer creates its own Canvas - eliminates WebGL context switching
 */
import { useFrame } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { useGameStore } from "../store/gameContext";
import { enemySpawner } from "../utils/enemySpawner";
import { EnemyShip } from "../entities/EnemyShip";
import { PlayerShip } from "../entities/PlayerShip";
import { CanvasHUD } from "./CanvasHUD";
import { LaserTargetHelper } from "./LaserTargetHelper";
import { getAudioManager } from "../utils/audioManager";
import { GameMode, isBossLevel } from "../types";
import { debug, error as logError, info } from "../utils/logger";

const TUNING = {
  firstSpawnDelayMs: 1000,
  statsUpdateIntervalMs: 1000,
  millisecondsPerMinute: 60_000,
  secondsPerMinute: 60,
  accuracyTenthsScale: 1000,
  accuracyDecimalScale: 10,
  positionSyncFrames: 5,
  fatalBossCollisionDamage: 99_999,
  regularCollisionDamage: 10,
  keyLightHorizontalOffset: 10,
  keyLightHeight: 20,
  pinkLightX: 20,
  pinkLightY: 5,
  pinkLightZ: -10,
  blueLightY: 15,
  blueLightZ: -30,
} as const;

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

  const isActive =
    !isPaused &&
    !isGameOver &&
    (mode === GameMode.NORMAL || mode === GameMode.PROGRAMMING);
  const firstSpawnTimeoutReference = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);
  // Ref-based position map to avoid O(N²) state updates per frame
  const livePositionsReference = useRef(
    new Map<string, { x: number; y: number; z: number }>(),
  );
  // Ref for enemies so handleEnemyReachPlayer doesn't depend on enemies array
  const enemiesReference = useRef(enemies);
  useEffect(() => {
    enemiesReference.current = enemies;
  }, [enemies]);
  // Enemies with live positions merged in for collision avoidance
  const [liveEnemies, setLiveEnemies] = useState<typeof enemies>([]);
  const liveEnemiesUpdateReference = useRef(0);
  // Ref for stats calculation
  const lastStatsUpdateReference = useRef(0);

  const spawnFirstEnemy = useEffectEvent(() => {
    if (!isActive) return;
    const isBoss = isBossLevel(level);
    const firstEnemy = enemySpawner.forceSpawn(
      level,
      mode,
      programmingLanguage,
      isBoss,
      currentDifficulty,
    );
    if (firstEnemy) addEnemy(firstEnemy);
    else logError("Failed to spawn first enemy", undefined, "GameCanvas");
  });

  // Initialize spawner when game starts
  useEffect(() => {
    if (mode === GameMode.NORMAL || mode === GameMode.PROGRAMMING) {
      enemySpawner.reset();
      info("Enemy spawner initialized", { mode }, "GameCanvas");

      firstSpawnTimeoutReference.current = setTimeout(() => {
        spawnFirstEnemy();
      }, TUNING.firstSpawnDelayMs);
    }

    return () => {
      if (firstSpawnTimeoutReference.current)
        clearTimeout(firstSpawnTimeoutReference.current);
    };
  }, [mode, level, programmingLanguage, currentDifficulty, addEnemy]);

  // Game loop - spawning, updates, and stats calculation
  useFrame((_state, delta) => {
    // Only run if in active game mode
    if (!isActive) return;

    // Tick EMP cooldown each frame
    decrementEmpCooldown();

    // Calculate WPM and accuracy every second
    const now = Date.now();
    if (
      now - lastStatsUpdateReference.current >=
      TUNING.statsUpdateIntervalMs
    ) {
      lastStatsUpdateReference.current = now;
      const elapsedMinutes = Math.max(
        (now - startTime) / TUNING.millisecondsPerMinute,
        1 / TUNING.secondsPerMinute,
      ); // min 1 second
      const wpm = Math.round(wordsCorrect / elapsedMinutes);
      const totalAttempts = wordsCorrect + wordsMissed;
      const accuracy =
        totalAttempts > 0
          ? Math.round(
              (wordsCorrect / totalAttempts) * TUNING.accuracyTenthsScale,
            ) / TUNING.accuracyDecimalScale
          : 100;
      updateStats(wpm, accuracy);
    }

    // Every 5 frames, merge live positions into the enemy list for collision avoidance
    liveEnemiesUpdateReference.current++;
    if (liveEnemiesUpdateReference.current % TUNING.positionSyncFrames === 0) {
      const posMap = livePositionsReference.current;
      if (posMap.size > 0) {
        setLiveEnemies(
          enemies.map((e) => {
            const livePos = posMap.get(e.id);
            return livePos ? { ...e, position: livePos } : e;
          }),
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
      currentDifficulty,
    );

    if (newEnemy) {
      debug(
        "Spawned enemy",
        { word: newEnemy.word, position: newEnemy.position },
        "GameCanvas",
      );
      addEnemy(newEnemy);
    }
  });

  // Handle enemy reaching player — deal damage, play sounds, increment missed, and remove
  // Boss collision is always fatal (instant kill)
  const handleEnemyReachPlayer = useCallback(
    (enemyId: string) => {
      const enemy = enemiesReference.current.find((e) => e.id === enemyId);
      if (enemy) {
        const damage = enemy.isBoss
          ? TUNING.fatalBossCollisionDamage
          : TUNING.regularCollisionDamage;
        debug(
          "Enemy reached player",
          { damage, isBoss: enemy.isBoss },
          "GameCanvas",
        );
        getAudioManager().playDamage();
        getAudioManager().playExplosion();
        takeDamage(damage);
        incrementWordsMissed();
        removeEnemy(enemyId);
        livePositionsReference.current.delete(enemyId);
      }
    },
    [takeDamage, removeEnemy, incrementWordsMissed],
  );

  // Handle enemy destruction
  const handleEnemyDestroy = useCallback(
    (enemyId: string) => {
      debug("Enemy destroyed", { id: enemyId }, "GameCanvas");
      removeEnemy(enemyId);
      livePositionsReference.current.delete(enemyId);
    },
    [removeEnemy],
  );

  // Handle enemy position updates — store in ref map (no state churn)
  const handlePositionUpdate = useCallback(
    (enemyId: string, position: { x: number; y: number; z: number }) => {
      livePositionsReference.current.set(enemyId, position);
    },
    [],
  );

  return (
    <>
      {/* Render all enemies */}
      {enemies.map((enemy) => (
        <EnemyShip
          key={enemy.id}
          enemy={enemy}
          isActive={isActive}
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
      <directionalLight
        position={[
          TUNING.keyLightHorizontalOffset,
          TUNING.keyLightHeight,
          TUNING.keyLightHorizontalOffset,
        ]}
        intensity={1}
        castShadow
      />
      <pointLight
        position={[TUNING.pinkLightX, TUNING.pinkLightY, TUNING.pinkLightZ]}
        color="#ff0088"
        intensity={0.8}
        distance={50}
      />
      <pointLight
        position={[0, TUNING.blueLightY, TUNING.blueLightZ]}
        color="#0088ff"
        intensity={0.8}
        distance={50}
      />

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
