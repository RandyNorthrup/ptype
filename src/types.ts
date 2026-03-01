import type { DifficultyLevel } from './utils/difficultyManager';

/**
 * Core type definitions for P-Type Web
 * Ported from Python core/types.py
 */

export enum GameMode {
  MENU = 'menu',
  NORMAL = 'normal',
  PROGRAMMING = 'programming',
  GAME_OVER = 'game_over',
  TRIVIA = 'trivia',
}

export enum ProgrammingLanguage {
  PYTHON = 'Python',
  JAVA = 'Java',
  JAVASCRIPT = 'JavaScript',
  CSHARP = 'C#',
  CPLUSPLUS = 'C++',
  CSS = 'CSS',
  HTML = 'HTML',
}

export enum BonusItemType {
  OFFENSIVE = 'offensive',
  DEFENSIVE = 'defensive',
}

export enum TriviaCategory {
  POP_CULTURE = 'pop_culture',
  SPORTS = 'sports',
  HISTORY = 'history',
  GEOGRAPHY = 'geography',
  MATHEMATICS = 'mathematics',
  ART = 'art',
  NATURE = 'nature',
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: string;
  category: string;
}

export interface BonusItem {
  itemId: number; // 0-3
  name: string;
  description: string;
  iconName: string; // Icon identifier
  duration: number; // Duration in frames (60 = 1 second)
  uses: number;
  effectValue: number;
  type: BonusItemType;
}

export interface PlayerProfile {
  name: string;
  createdAt: string;
  lastPlayed: string;
  totalScore: number;
  highScore: number;
  totalWordsTyped: number;
  totalAccuracy: number;
  totalGamesPlayed: number;
  totalTimePlayed: number; // seconds
  averageWPM: number;
  bestWPM: number;
  achievements: string[]; // achievement IDs
  level: number;
  currentStreak: number;
  longestStreak: number;
}

export interface GameState {
  mode: GameMode;
  level: number;
  score: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  wordsTyped: number;
  wordsCorrect: number;
  wordsMissed: number;
  currentWord: string;
  activeEnemyId: string | null;
  wpm: number;
  accuracy: number;
  startTime: number;
  elapsedTime: number;
  bonusItems: BonusItem[];
  selectedBonusIndex: number;
  empCooldown: number;
  empMaxCooldown: number;
  isPaused: boolean;
  isGameOver: boolean;
  programmingLanguage?: ProgrammingLanguage;
  bossesDefeated: number; // Track bosses defeated for trivia triggers
  currentDifficulty: DifficultyLevel; // Current difficulty level (scales with progress)
  /** Mode before GAME_OVER was set, so Play Again can restart correctly */
  previousMode?: GameMode;
  /** Language before GAME_OVER was set */
  previousLanguage?: ProgrammingLanguage;
}

export interface Enemy {
  id: string;
  word: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  speed: number; // Movement speed in units per second
  health: number;
  maxHealth: number;
  isBoss: boolean;
  enemyType?: 'basic' | 'fast'; // Enemy ship type
  modelUrl?: string;
  scale: number;
  typedCharacters: number;
  spawnPoint: number; // 0 = left, 1 = center, 2 = right
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

// Game constants
export const GAME_CONSTANTS = {
  FPS: 60,
  MAX_LEVEL: 100,
  BASE_WPM: 20,
  MAX_WPM: 400,
  STARTING_HEALTH: 100,
  STARTING_SHIELD: 50,
  EMP_COOLDOWN_FRAMES: 300, // 5 seconds
  ENEMY_SPAWN_BASE_RATE: 180, // frames between spawns
  CAMERA_FOV: 75,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 1000,
} as const;

export function isBossLevel(level: number): boolean {
  return level > 0 && level % 3 === 0;
}

/**
 * Get target WPM for a given level (ported from Python)
 */
export function getTargetWPM(level: number): number {
  const { BASE_WPM, MAX_WPM, MAX_LEVEL } = GAME_CONSTANTS;
  return BASE_WPM + ((MAX_WPM - BASE_WPM) * (level - 1) / Math.max(1, MAX_LEVEL - 1));
}

/**
 * Get color for WPM display based on difficulty
 */
export function getWPMColor(wpm: number): string {
  if (wpm <= 50) return '#39ff14'; // Neon green - Easy
  if (wpm <= 100) return '#00ffff'; // Cyan - Moderate
  if (wpm <= 150) return '#ffeb3b'; // Yellow - Challenging
  if (wpm <= 200) return '#ff9800'; // Orange - Hard
  if (wpm <= 250) return '#ff1493'; // Pink - Very Hard
  return '#ff4444'; // Red - Extreme
}

/**
 * Map ProgrammingLanguage enum values to YAML file keys
 */
export const LANGUAGE_FILE_MAP: Record<string, string> = {
  'Python': 'python',
  'JavaScript': 'javascript',
  'Java': 'java',
  'C#': 'csharp',
  'C++': 'cplusplus',
  'CSS': 'css',
  'HTML': 'html',
} as const;
