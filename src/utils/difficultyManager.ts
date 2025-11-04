/**
 * Difficulty Manager
 * Manages progressive difficulty scaling based on initial setting + level progress
 */

export type DifficultyLevel = 'Easy' | 'Normal' | 'Hard' | 'Expert' | 'Master';

/**
 * Get the starting difficulty from settings
 */
export function getStartingDifficulty(): DifficultyLevel {
  try {
    const savedSettings = localStorage.getItem('game-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings.difficulty ?? 'Normal';
    }
  } catch (err) {
    console.error('Failed to load difficulty setting:', err);
  }
  return 'Normal';
}

/**
 * Calculate current difficulty level based on starting difficulty + level progress
 * The game progressively gets harder as levels increase
 * 
 * @param level - Current game level (1-100)
 * @param startingDifficulty - Initial difficulty from settings
 * @returns Current difficulty level
 */
export function getCurrentDifficulty(level: number, startingDifficulty?: DifficultyLevel): DifficultyLevel {
  const starting = startingDifficulty ?? getStartingDifficulty();
  
  // Define difficulty thresholds based on starting difficulty
  // Each starting difficulty has different progression curves
  const thresholds = {
    Easy: {
      Easy: [0, 40],      // Stay Easy until level 40
      Normal: [40, 70],   // Normal from 40-70
      Hard: [70, 85],     // Hard from 70-85
      Expert: [85, 95],   // Expert from 85-95
      Master: [95, 100],  // Master at 95+
    },
    Normal: {
      Easy: [0, 0],       // Never Easy
      Normal: [0, 30],    // Normal until level 30
      Hard: [30, 60],     // Hard from 30-60
      Expert: [60, 85],   // Expert from 60-85
      Master: [85, 100],  // Master at 85+
    },
    Hard: {
      Easy: [0, 0],       // Never Easy
      Normal: [0, 0],     // Never Normal
      Hard: [0, 25],      // Hard until level 25
      Expert: [25, 60],   // Expert from 25-60
      Master: [60, 100],  // Master at 60+
    },
  };
  
  // Handle Expert/Master starting difficulties as Hard
  const startKey = (starting === 'Expert' || starting === 'Master') ? 'Hard' : starting;
  const progression = thresholds[startKey];
  
  if (level >= progression.Master[0]) return 'Master';
  if (level >= progression.Expert[0]) return 'Expert';
  if (level >= progression.Hard[0]) return 'Hard';
  if (level >= progression.Normal[0]) return 'Normal';
  return 'Easy';
}

/**
 * Get difficulty multiplier for enemy speed/spawning
 * This multiplier increases as difficulty progresses
 * 
 * @param currentDifficulty - The current difficulty level
 * @returns Speed multiplier (0.6 to 2.0)
 */
export function getDifficultyMultiplier(currentDifficulty: DifficultyLevel): number {
  switch (currentDifficulty) {
    case 'Easy':
      return 0.6;
    case 'Normal':
      return 1.0;
    case 'Hard':
      return 1.35;
    case 'Expert':
      return 1.65;
    case 'Master':
      return 2.0;
    default:
      return 1.0;
  }
}

/**
 * Get display color for difficulty level
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'Easy':
      return '#4ade80'; // Green
    case 'Normal':
      return '#60a5fa'; // Blue
    case 'Hard':
      return '#fbbf24'; // Yellow
    case 'Expert':
      return '#f97316'; // Orange
    case 'Master':
      return '#ef4444'; // Red
    default:
      return '#94a3b8'; // Gray
  }
}
