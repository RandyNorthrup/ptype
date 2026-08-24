/**
 * Enemy Spawner
 * Manages enemy spawning based on level, difficulty, and game mode
 */

import type { Enemy, ProgrammingLanguage } from "../types";
import { GameMode, isBossLevel, getTargetWPM } from "../types";
import { wordDictionary } from "./wordDictionary";
import { debug, error as logError } from "./logger";
import {
  getDifficultyMultiplier,
  type DifficultyLevel,
} from "./difficultyManager";

const SPAWN_CONFIG = {
  rate: { baseSeconds: 4, minimumSeconds: 1.5, levelStep: 0.03 },
  typing: { averageWordLength: 5, secondsPerMinute: 60, travelScale: 18 },
  speed: {
    minimumWordLength: 3,
    levelCap: 30,
    levelStep: 0.04,
    baseScale: 2,
    minimum: 1.8,
    maximum: 10,
  },
  bossSpeed: {
    longWordThreshold: 40,
    longWordFactor: 0.8,
    programmingScale: 0.6,
    normalScale: 0.7,
    baseLevelFactor: 0.85,
    levelCap: 120,
    levelDivisor: 240,
    minimum: 0.6,
    maximum: 3.5,
  },
  bossHealth: { base: 100, perLevel: 10 },
  enemyHealth: { base: 10, perLevel: 0.5 },
  position: { depth: 35, lanes: { left: -25, center: 0, right: 25 } },
  fastEnemy: {
    minimumLevel: 5,
    maximumProbability: 0.6,
    probabilityStep: 0.04,
    baseProbability: 0.2,
    candidateRetries: 2,
  },
  enemies: { initialMaximum: 3, levelsPerAdditional: 15 },
} as const;

// Counter persists across spawner instances to prevent duplicate keys.
const enemyIdSequence = { next: 0 };

export class EnemySpawner {
  private spawnTimer = 0;
  private lastSpawnPoint = -1; // Track last used spawn point to ensure variety

  /**
   * Get spawn rate based on level
   */
  private getSpawnRate(level: number): number {
    // Base spawn rate: 4 seconds at level 1
    // Decreases as level increases but never too fast
    const { baseSeconds, minimumSeconds, levelStep } = SPAWN_CONFIG.rate;
    return Math.max(minimumSeconds, baseSeconds - level * levelStep);
  }

  /**
   * Get enemy speed based on level and WPM
   */
  private getEnemySpeed(
    level: number,
    wordLength: number,
    isBoss: boolean,
    mode: GameMode,
    currentDifficulty: DifficultyLevel,
  ): number {
    const targetWPM = getTargetWPM(level);

    // Characters per second based on target WPM
    // WPM assumes 5 characters per word on average
    const { averageWordLength, secondsPerMinute, travelScale } =
      SPAWN_CONFIG.typing;
    const charsPerSecond = (targetWPM * averageWordLength) / secondsPerMinute;

    // Baseline speed: time needed to type this word
    const {
      minimumWordLength,
      levelCap,
      levelStep,
      baseScale,
      minimum,
      maximum,
    } = SPAWN_CONFIG.speed;
    const baseline =
      (charsPerSecond * Math.max(minimumWordLength, wordLength)) / travelScale;

    // Scale factor increases with level - much faster starting speed
    const speedScale = baseScale + Math.min(level, levelCap) * levelStep;

    // Calculate final speed with higher minimum and maximum
    let speed = Math.max(minimum, Math.min(maximum, baseline * speedScale));

    // Boss enemies move slower but still reasonably fast
    if (isBoss) {
      const bossSpeed = SPAWN_CONFIG.bossSpeed;
      const isProgramming = mode === GameMode.PROGRAMMING;
      const lengthFactor =
        wordLength > bossSpeed.longWordThreshold ? bossSpeed.longWordFactor : 1;
      const bossBaseScale = isProgramming
        ? bossSpeed.programmingScale
        : bossSpeed.normalScale;
      const levelFactor =
        bossSpeed.baseLevelFactor +
        Math.min(level, bossSpeed.levelCap) / bossSpeed.levelDivisor;
      speed = Math.max(
        bossSpeed.minimum,
        Math.min(
          bossSpeed.maximum,
          speed * bossBaseScale * lengthFactor * levelFactor,
        ),
      );
    }

    // Apply progressive difficulty multiplier
    const difficultyMultiplier = getDifficultyMultiplier(currentDifficulty);
    speed *= difficultyMultiplier;

    return speed;
  }

  /**
   * Get enemy health based on level and type
   */
  private getEnemyHealth(level: number, isBoss: boolean): number {
    if (isBoss) {
      // Boss health scales significantly with level
      const { base, perLevel } = SPAWN_CONFIG.bossHealth;
      return base + level * perLevel;
    }

    // Regular enemies
    const { base, perLevel } = SPAWN_CONFIG.enemyHealth;
    return base + level * perLevel;
  }

  /**
   * Get spawn position based on spawn point (0 = left, 1 = center, 2 = right)
   */
  private getSpawnPosition(
    spawnPoint: number,
    isBoss: boolean,
  ): { x: number; y: number; z: number; spawnPoint: number } {
    const spawnZ = SPAWN_CONFIG.position.depth;

    if (isBoss) {
      // Boss spawns center
      return { x: 0, y: 0, z: spawnZ, spawnPoint: 1 };
    }

    // Three spawn points very far apart: left (-25), center (0), right (25)
    const spawnPositions = Object.values(SPAWN_CONFIG.position.lanes);

    return {
      x: spawnPositions[spawnPoint] ?? 0,
      y: 0, // Same Y level as player
      z: spawnZ, // Spawn farther back
      spawnPoint,
    };
  }

  /**
   * Get next spawn point (rotates through points for variety)
   */
  private getNextSpawnPoint(): number {
    // Rotate to next spawn point (0 -> 1 -> 2 -> 0)
    this.lastSpawnPoint =
      (this.lastSpawnPoint + 1) %
      Object.keys(SPAWN_CONFIG.position.lanes).length;
    return this.lastSpawnPoint;
  }

  /**
   * Check if current level is a boss level
   */
  private checkBossLevel(level: number): boolean {
    return isBossLevel(level);
  }

  /**
   * Determine enemy type based on level
   * Basic ships early game, fast ships appear in later levels
   */
  private determineEnemyType(level: number, isBoss: boolean): "basic" | "fast" {
    if (isBoss) {
      // Bosses are always basic type (but large)
      return "basic";
    }

    // Fast enemies start appearing at level 5
    const fastEnemy = SPAWN_CONFIG.fastEnemy;
    if (level < fastEnemy.minimumLevel) {
      return "basic";
    }

    // Gradually increase fast enemy probability
    // Level 5-10: 20% fast, Level 10-20: 40% fast, Level 20+: 60% fast
    const fastProbability = Math.min(
      fastEnemy.maximumProbability,
      (level - fastEnemy.minimumLevel) * fastEnemy.probabilityStep +
        fastEnemy.baseProbability,
    );
    return Math.random() < fastProbability ? "fast" : "basic";
  }

  /**
   * Create a new enemy
   */
  private createEnemy(
    word: string,
    level: number,
    isBoss: boolean,
    mode: GameMode,
    spawnPoint: number,
    enemyType: "basic" | "fast",
    currentDifficulty: DifficultyLevel,
  ): Enemy {
    const positionData = this.getSpawnPosition(spawnPoint, isBoss);
    const speed = this.getEnemySpeed(
      level,
      word.length,
      isBoss,
      mode,
      currentDifficulty,
    );
    const health = this.getEnemyHealth(level, isBoss);

    const enemy: Enemy = {
      id: `enemy_${enemyIdSequence.next.toString()}`,
      word,
      position: { x: positionData.x, y: positionData.y, z: positionData.z },
      velocity: { x: 0, y: 0, z: speed },
      speed,
      health,
      maxHealth: health,
      isBoss,
      enemyType,
      scale: isBoss ? 2 : 1,
      typedCharacters: 0,
      spawnPoint: positionData.spawnPoint,
    };
    enemyIdSequence.next += 1;
    return enemy;
  }

  /**
   * Update spawner (called each frame)
   * @param deltaTime Time since last frame in seconds
   * @param level Current game level
   * @param mode Game mode
   * @param language Programming language (if in programming mode)
   * @param currentEnemyCount Number of enemies currently on screen
   * @param currentDifficulty Current difficulty level (scales with progress)
   * @returns New enemy if one should be spawned, null otherwise
   */
  update(
    deltaTime: number,
    level: number,
    mode: GameMode,
    language: ProgrammingLanguage | undefined,
    currentEnemyCount: number,
    currentDifficulty: DifficultyLevel,
  ): Enemy | null {
    this.spawnTimer += deltaTime;

    const spawnRate = this.getSpawnRate(level);
    const maxEnemies =
      SPAWN_CONFIG.enemies.initialMaximum +
      Math.floor(level / SPAWN_CONFIG.enemies.levelsPerAdditional);

    // Check if it's time to spawn
    if (this.spawnTimer >= spawnRate && currentEnemyCount < maxEnemies) {
      this.spawnTimer = 0;

      // Get next spawn point (rotates through points)
      const spawnPoint = this.getNextSpawnPoint();

      // Boss is force-spawned at level start (GameCanvas); this only triggers if field is clear
      const isBoss = this.checkBossLevel(level) && currentEnemyCount === 0;

      try {
        // Get language key for word dictionary
        const langKey = wordDictionary.getLanguageKey(mode, language);

        // Determine enemy type first
        const enemyType = this.determineEnemyType(level, isBoss);
        debug(
          `Getting word: langKey=${langKey} level=${level.toString()} isBoss=${isBoss.toString()} enemyType=${enemyType} spawnPoint=${spawnPoint.toString()}`,
          undefined,
          "enemySpawner",
        );

        // Get word from dictionary (fast enemies prefer longer words)
        let word = wordDictionary.getWord(langKey, level, isBoss);

        // For fast enemies, try to get a longer word (retry up to 3 times)
        if (!isBoss && enemyType === "fast") {
          let longestWord = word;
          for (
            let index = 0;
            index < SPAWN_CONFIG.fastEnemy.candidateRetries;
            index++
          ) {
            const candidateWord = wordDictionary.getWord(
              langKey,
              level,
              isBoss,
            );
            if (candidateWord.length > longestWord.length) {
              longestWord = candidateWord;
            }
          }
          word = longestWord;
        }

        debug(`Got word: ${word}`, undefined, "enemySpawner");

        // Create enemy at the spawn point
        const enemy = this.createEnemy(
          word,
          level,
          isBoss,
          mode,
          spawnPoint,
          enemyType,
          currentDifficulty,
        );
        debug(`Created enemy: ${enemy.id}`, enemy, "enemySpawner");
        return enemy;
      } catch (error) {
        logError("Failed to create enemy", error, "enemySpawner");
        return null;
      }
    }

    return null;
  }

  /**
   * Reset spawner state
   */
  reset(): void {
    this.spawnTimer = 0;
    this.lastSpawnPoint = -1; // Reset spawn point rotation
    // Note: globalEnemyIdCounter is NOT reset to prevent duplicate keys across game sessions
  }

  /**
   * Force spawn an enemy immediately (for testing or special events)
   */
  forceSpawn(
    level: number,
    mode: GameMode,
    language: ProgrammingLanguage | undefined,
    isBoss = false,
    currentDifficulty: DifficultyLevel = "Normal",
  ): Enemy | null {
    // Get next spawn point
    const spawnPoint = this.getNextSpawnPoint();

    try {
      const langKey = wordDictionary.getLanguageKey(mode, language);
      const enemyType = this.determineEnemyType(level, isBoss);
      const word = wordDictionary.getWord(langKey, level, isBoss);
      const enemy = this.createEnemy(
        word,
        level,
        isBoss,
        mode,
        spawnPoint,
        enemyType,
        currentDifficulty,
      );
      return enemy;
    } catch (error) {
      logError("Failed to force spawn enemy", error, "enemySpawner");
      return null;
    }
  }
}

// Singleton instance
export const enemySpawner = new EnemySpawner();
