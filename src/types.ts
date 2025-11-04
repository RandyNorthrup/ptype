/**
 * Core type definitions for P-Type Web
 * Ported from Python core/types.py
 */

export enum GameMode {
  PROFILE_SELECT = 'profile_select',
  MENU = 'menu',
  NORMAL = 'normal',
  PROGRAMMING = 'programming',
  PAUSE = 'pause',
  GAME_OVER = 'game_over',
  STATS = 'stats',
  SETTINGS = 'settings',
  ABOUT = 'about',
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

export enum DifficultyBucket {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
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
  currentDifficulty: string; // Current difficulty level (scales with progress)
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

export interface WordConfig {
  bucket: DifficultyBucket;
  maxLength: number;
  minLength: number;
}

// Game constants
export const GAME_CONSTANTS = {
  FPS: 60,
  BOSS_LEVELS: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99],
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

// Level difficulty mapping (ported from Python)
export const LEVEL_DIFFICULTY_MAPPING: Record<string, WordConfig> = {
  '1-3': { bucket: DifficultyBucket.BEGINNER, maxLength: 5, minLength: 2 },
  '4-6': { bucket: DifficultyBucket.BEGINNER, maxLength: 8, minLength: 3 },
  '7-9': { bucket: DifficultyBucket.BEGINNER, maxLength: 10, minLength: 4 },
  '10-12': { bucket: DifficultyBucket.INTERMEDIATE, maxLength: 12, minLength: 5 },
  '13-15': { bucket: DifficultyBucket.INTERMEDIATE, maxLength: 15, minLength: 6 },
  '16-18': { bucket: DifficultyBucket.INTERMEDIATE, maxLength: 18, minLength: 7 },
  '19-21': { bucket: DifficultyBucket.ADVANCED, maxLength: 22, minLength: 8 },
  '22-25': { bucket: DifficultyBucket.ADVANCED, maxLength: 26, minLength: 9 },
  '26-100': { bucket: DifficultyBucket.ADVANCED, maxLength: 999, minLength: 10 },
};

export function getDifficultyForLevel(level: number): WordConfig {
  for (const [range, config] of Object.entries(LEVEL_DIFFICULTY_MAPPING)) {
    const [min, max] = range.split('-').map(Number);
    if (level >= min && level <= max) {
      return config;
    }
  }
  return LEVEL_DIFFICULTY_MAPPING['26-100'];
}

export function isBossLevel(level: number): boolean {
  return (GAME_CONSTANTS.BOSS_LEVELS as readonly number[]).includes(level);
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
