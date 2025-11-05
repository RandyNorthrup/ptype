/**
 * Optimized selectors to prevent unnecessary re-renders
 * Use these selectors instead of accessing the full state
 */
import { useGameStore } from './gameContext';

// Game mode selector
export const useGameMode = () => useGameStore().mode;

// Enemy selectors
export const useEnemies = () => useGameStore().enemies;
export const useEnemyCount = () => useGameStore().enemies.length;
export const useActiveEnemyId = () => useGameStore().activeEnemyId;

// Health and shield selectors
export const useHealthAndShield = () => {
  const store = useGameStore();
  return {
    health: store.health,
    maxHealth: store.maxHealth,
    shield: store.shield,
    maxShield: store.maxShield,
  };
};

// Score and stats selectors
export const useScore = () => useGameStore().score;
export const useLevel = () => useGameStore().level;
export const useWPM = () => useGameStore().wpm;
export const useAccuracy = () => useGameStore().accuracy;

// State flags
export const useIsPaused = () => useGameStore().isPaused;
export const useIsGameOver = () => useGameStore().isGameOver;

// Typing selectors
export const useCurrentWord = () => useGameStore().currentWord;

// Trivia selectors
export const useCurrentTrivia = () => useGameStore().currentTrivia;
export const useTriviaState = () => {
  const store = useGameStore();
  return {
    currentTrivia: store.currentTrivia,
    triviaAnswered: store.triviaAnswered,
    triviaResult: store.triviaResult,
    selectedTriviaAnswer: store.selectedTriviaAnswer,
  };
};

// Bonus items selectors
export const useBonusItems = () => useGameStore().bonusItems;
export const useSelectedBonusIndex = () => useGameStore().selectedBonusIndex;

// EMP selectors
export const useEMPCooldown = () => useGameStore().empCooldown;

// Achievement selectors
export const useAchievements = () => useGameStore().achievements;

// Profile selectors
export const useCurrentProfile = () => useGameStore().currentProfile;

// Composite selectors for HUD
export const useHUDData = () => {
  const store = useGameStore();
  return {
    health: store.health,
    maxHealth: store.maxHealth,
    shield: store.shield,
    maxShield: store.maxShield,
    score: store.score,
    level: store.level,
    wpm: store.wpm,
    accuracy: store.accuracy,
  };
};

// Composite selectors for gameplay
export const useGameplayData = () => {
  const store = useGameStore();
  return {
    enemies: store.enemies,
    bonusItems: store.bonusItems,
    selectedBonusIndex: store.selectedBonusIndex,
    empCooldown: store.empCooldown,
    currentWord: store.currentWord,
    isPaused: store.isPaused,
  };
};
