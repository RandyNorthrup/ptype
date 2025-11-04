/**
 * Optimized Zustand selectors to prevent unnecessary re-renders
 * Use these selectors instead of accessing the full state
 */
import { useGameStore } from './gameStore';

// Game mode selector
export const useGameMode = () => useGameStore(state => state.mode);

// Enemy selectors
export const useEnemies = () => useGameStore(state => state.enemies);
export const useEnemyCount = () => useGameStore(state => state.enemies.length);
export const useActiveEnemyId = () => useGameStore(state => state.activeEnemyId);

// Player stats selectors
export const usePlayerStats = () => useGameStore(
  state => ({
    health: state.health,
    maxHealth: state.maxHealth,
    shield: state.shield,
    maxShield: state.maxShield,
  })
);

export const useScore = () => useGameStore(state => state.score);
export const useLevel = () => useGameStore(state => state.level);
export const useWPM = () => useGameStore(state => state.wpm);
export const useAccuracy = () => useGameStore(state => state.accuracy);

// Game state selectors
export const useIsPaused = () => useGameStore(state => state.isPaused);
export const useIsGameOver = () => useGameStore(state => state.isGameOver);

// Current word selector
export const useCurrentWord = () => useGameStore(state => state.currentWord);

// Trivia selectors
export const useCurrentTrivia = () => useGameStore(state => state.currentTrivia);
export const useTriviaState = () => useGameStore(
  state => ({
    currentTrivia: state.currentTrivia,
    triviaAnswered: state.triviaAnswered,
    triviaResult: state.triviaResult,
    selectedTriviaAnswer: state.selectedTriviaAnswer,
  })
);

// Bonus items selectors
export const useBonusItems = () => useGameStore(state => state.bonusItems);
export const useSelectedBonusIndex = () => useGameStore(state => state.selectedBonusIndex);

// EMP selector
export const useEMPCooldown = () => useGameStore(state => state.empCooldown);

// Achievements selector
export const useAchievements = () => useGameStore(state => state.achievements);

// Profile selector
export const useCurrentProfile = () => useGameStore(state => state.currentProfile);

// Game actions selectors (these don't cause re-renders)
export const useGameActions = () => useGameStore(
  state => ({
    startGame: state.startGame,
    pauseGame: state.pauseGame,
    resumeGame: state.resumeGame,
    endGame: state.endGame,
    resetGame: state.resetGame,
  })
);

export const useEnemyActions = () => useGameStore(
  state => ({
    addEnemy: state.addEnemy,
    removeEnemy: state.removeEnemy,
    updateEnemy: state.updateEnemy,
    clearEnemies: state.clearEnemies,
  })
);

export const useTypingActions = () => useGameStore(
  state => ({
    typeCharacter: state.typeCharacter,
    deleteCharacter: state.deleteCharacter,
    submitWord: state.submitWord,
  })
);
