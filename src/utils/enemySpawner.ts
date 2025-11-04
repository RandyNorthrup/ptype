/**
 * Enemy Spawner
 * Manages enemy spawning based on level, difficulty, and game mode
 */

import type { Enemy, GameMode, ProgrammingLanguage } from '../types';
import { GAME_CONSTANTS } from '../types';
import { wordDictionary } from './wordDictionary';
import { debug, error as logError } from './logger';
import { getDifficultyMultiplier, type DifficultyLevel } from './difficultyManager';

// Counter persists across spawner instances to prevent duplicate keys
let globalEnemyIdCounter = 0;

export class EnemySpawner {
  private spawnTimer = 0;
  private lastSpawnPoint: number = -1; // Track last used spawn point to ensure variety

  /**
   * Get spawn rate based on level
   */
  private getSpawnRate(level: number): number {
    // Base spawn rate: 4 seconds at level 1
    // Decreases as level increases but never too fast
    const baseRate = 4.0; // seconds
    const minRate = 1.5; // minimum 1.5 seconds to prevent overlap
    
    // Gradually decrease spawn time
    const rate = baseRate - (level * 0.03);
    return Math.max(minRate, rate);
  }

  /**
   * Get target WPM for this level (ported from Python)
   */
  private getTargetWPM(level: number): number {
    const { BASE_WPM, MAX_WPM, MAX_LEVEL } = GAME_CONSTANTS;
    return BASE_WPM + ((MAX_WPM - BASE_WPM) * (level - 1) / Math.max(1, MAX_LEVEL - 1));
  }

  /**
   * Get enemy speed based on level and WPM (ported from Python)
   */
  private getEnemySpeed(level: number, wordLength: number, isBoss: boolean, mode: GameMode, currentDifficulty: string): number {
    const targetWPM = this.getTargetWPM(level);
    
    // Characters per second based on target WPM
    // WPM assumes 5 characters per word on average
    const charsPerSecond = (targetWPM * 5) / 60;
    
    // Baseline speed: time needed to type this word
    const baseline = charsPerSecond * Math.max(3, wordLength) / 18;
    
    // Scale factor increases with level - much faster starting speed
    const speedScale = 2.0 + Math.min(level, 30) * 0.04; // Increased from 1.2 to 2.0
    
    // Calculate final speed with higher minimum and maximum
    let speed = Math.max(1.8, Math.min(10.0, baseline * speedScale)); // Increased from 1.0-8.0 to 1.8-10.0
    
    // Boss enemies move slower but still reasonably fast
    if (isBoss) {
      const isProgramming = mode === 'programming';
      const lengthFactor = wordLength > 40 ? 0.8 : 1.0;
      const baseScale = isProgramming ? 0.6 : 0.7; // Increased from 0.5/0.6
      const levelFactor = 0.85 + Math.min(level, 120) / 240;
      speed = Math.max(0.6, Math.min(3.5, speed * baseScale * lengthFactor * levelFactor)); // Increased from 0.4-2.5 to 0.6-3.5
    }
    
    // Apply progressive difficulty multiplier
    const difficultyMultiplier = getDifficultyMultiplier(currentDifficulty as DifficultyLevel);
    speed *= difficultyMultiplier;
    
    return speed;
  }

  /**
   * Get enemy health based on level and type
   */
  private getEnemyHealth(level: number, isBoss: boolean): number {
    if (isBoss) {
      // Boss health scales significantly with level
      return 100 + (level * 10);
    }
    
    // Regular enemies
    const baseHealth = 10;
    return baseHealth + (level * 0.5);
  }

  /**
   * Get spawn position based on spawn point (0 = left, 1 = center, 2 = right)
   */
  private getSpawnPosition(spawnPoint: number, isBoss: boolean): { x: number; y: number; z: number; spawnPoint: number } {
    const spawnZ = 35; // Spawn farther back to give more time before overlap
    
    if (isBoss) {
      // Boss spawns center
      return { x: 0, y: 0, z: spawnZ, spawnPoint: 1 };
    }
    
    // Three spawn points very far apart: left (-25), center (0), right (25)
    const spawnPositions = [-25, 0, 25];
    
    return {
      x: spawnPositions[spawnPoint],
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
    this.lastSpawnPoint = (this.lastSpawnPoint + 1) % 3;
    return this.lastSpawnPoint;
  }

  /**
   * Check if current level is a boss level
   */
  private isBossLevel(level: number): boolean {
    return level % 3 === 0;
  }

  /**
   * Determine enemy type based on level
   * Basic ships early game, fast ships appear in later levels
   */
  private determineEnemyType(level: number, isBoss: boolean): 'basic' | 'fast' {
    if (isBoss) {
      // Bosses are always basic type (but large)
      return 'basic';
    }
    
    // Fast enemies start appearing at level 5
    if (level < 5) {
      return 'basic';
    }
    
    // Gradually increase fast enemy probability
    // Level 5-10: 20% fast, Level 10-20: 40% fast, Level 20+: 60% fast
    const fastProbability = Math.min(0.6, (level - 5) * 0.04 + 0.2);
    return Math.random() < fastProbability ? 'fast' : 'basic';
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
    enemyType: 'basic' | 'fast',
    currentDifficulty: string
  ): Enemy {
    const positionData = this.getSpawnPosition(spawnPoint, isBoss);
    const speed = this.getEnemySpeed(level, word.length, isBoss, mode, currentDifficulty);
    const health = this.getEnemyHealth(level, isBoss);

    return {
      id: `enemy_${globalEnemyIdCounter++}`,
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
    currentDifficulty: string
  ): Enemy | null {
    this.spawnTimer += deltaTime;

    const spawnRate = this.getSpawnRate(level);
    const maxEnemies = 3 + Math.floor(level / 15); // Start with 3, slowly increase to prevent overlap

    debug(`Spawner: timer=${this.spawnTimer.toFixed(2)} rate=${spawnRate.toFixed(2)} current=${currentEnemyCount} max=${maxEnemies}`, 
          undefined, 'enemySpawner');

    // Check if it's time to spawn
    if (this.spawnTimer >= spawnRate && currentEnemyCount < maxEnemies) {
      this.spawnTimer = 0;

      // Get next spawn point (rotates through points)
      const spawnPoint = this.getNextSpawnPoint();

      // Spawn boss first if it's a boss level and no enemies yet
      const isBoss = this.isBossLevel(level) && currentEnemyCount === 0;
      
      try {
        // Get language key for word dictionary
        const langKey = wordDictionary.getLanguageKey(mode, language);
        
        // Determine enemy type first
        const enemyType = this.determineEnemyType(level, isBoss);
        debug(`Getting word: langKey=${langKey} level=${level} isBoss=${isBoss} enemyType=${enemyType} spawnPoint=${spawnPoint}`, 
              undefined, 'enemySpawner');
        
        // Get word from dictionary (fast enemies prefer longer words)
        let word = wordDictionary.getWord(langKey, level, isBoss);
        
        // For fast enemies, try to get a longer word (retry up to 3 times)
        if (!isBoss && enemyType === 'fast') {
          let longestWord = word;
          for (let i = 0; i < 2; i++) {
            const candidateWord = wordDictionary.getWord(langKey, level, isBoss);
            if (candidateWord.length > longestWord.length) {
              longestWord = candidateWord;
            }
          }
          word = longestWord;
        }
        
        debug(`Got word: ${word}`, undefined, 'enemySpawner');
        
        // Create enemy at the spawn point
        const enemy = this.createEnemy(word, level, isBoss, mode, spawnPoint, enemyType, currentDifficulty);
        debug(`Created enemy: ${enemy.id}`, enemy, 'enemySpawner');
        return enemy;
      } catch (err) {
        logError('Failed to create enemy', err, 'enemySpawner');
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
    isBoss: boolean = false,
    currentDifficulty: string = 'Normal'
  ): Enemy | null {
    // Get next spawn point
    const spawnPoint = this.getNextSpawnPoint();

    try {
      const langKey = wordDictionary.getLanguageKey(mode, language);
      const enemyType = this.determineEnemyType(level, isBoss);
      const word = wordDictionary.getWord(langKey, level, isBoss);
      const enemy = this.createEnemy(word, level, isBoss, mode, spawnPoint, enemyType, currentDifficulty);
      return enemy;
    } catch (err) {
      logError('Failed to force spawn enemy', err, 'enemySpawner');
      return null;
    }
  }
}

// Singleton instance
export const enemySpawner = new EnemySpawner();
