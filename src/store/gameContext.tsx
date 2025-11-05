/**
 * Game state management using React Context + localStorage
 * No external dependencies - pure React solution
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { GameState, PlayerProfile, Enemy, Achievement, ProgrammingLanguage, BonusItem, TriviaQuestion } from '../types';
import { GAME_CONSTANTS, GameMode } from '../types';
import { achievementsManager, ACHIEVEMENTS_DEFINITIONS } from '../utils/achievementsManager';
import { debug } from '../utils/logger';
import { getCurrentDifficulty, getStartingDifficulty } from '../utils/difficultyManager';

interface HighScoreEntry {
  playerName: string;
  score: number;
  level: number;
  wpm: number;
  accuracy: number;
  timestamp: string;
  mode: string;
  language?: string;
}

interface GameStore extends GameState {
  // Profile management
  currentProfile: PlayerProfile | null;
  setProfile: (profile: PlayerProfile) => void;
  
  // Player stats
  stats: PlayerStats;
  
  // High scores
  highScores: HighScoreEntry[];
  addHighScore: (entry: HighScoreEntry) => number;
  getHighScores: (mode: string, language?: string, limit?: number) => HighScoreEntry[];

  // Trivia system
  currentTrivia: TriviaQuestion | null;
  triviaAnswered: boolean;
  triviaResult: boolean;
  selectedTriviaAnswer: number;
  showTrivia: (question: TriviaQuestion) => void;
  answerTrivia: (answerIndex: number, correct: boolean, bonusItem?: BonusItem | null) => void;
  hideTrivia: () => void;

  // Game lifecycle
  startGame: (mode: GameMode, language?: ProgrammingLanguage) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  // Enemy management
  enemies: Enemy[];
  addEnemy: (enemy: Enemy) => void;
  updateEnemy: (id: string, updates: Partial<Enemy>) => void;
  removeEnemy: (id: string) => void;
  setActiveEnemy: (id: string | null) => void;
  getActiveEnemy: () => Enemy | null;

  // Game state updates
  setCurrentWord: (word: string) => void;
  incrementScore: (points: number) => void;
  updateStats: (wpm: number, accuracy: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  addShield: (amount: number) => void;
  nextLevel: () => void;
  
  // Typing actions
  typeCharacter: (char: string) => void;
  deleteCharacter: () => void;
  submitWord: () => void;
  
  // Bonus system
  addBonusItem: (bonus: BonusItem) => void;
  removeBonusItem: (id: string) => void;
  updateBonusItem: (id: string, updates: Partial<BonusItem>) => void;
  selectNextBonus: () => void;
  selectPreviousBonus: () => void;
  useSelectedBonus: () => BonusItem | null;
  
  // EMP system
  setEmpCooldown: (frames: number) => void;
  decrementEmpCooldown: () => void;
  useEMP: () => void;
  
  // Achievement system
  achievements: Achievement[];
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  syncAchievements: () => void;
}

const initialGameState: GameState = {
  mode: 'menu' as GameMode,
  level: 1,
  score: 0,
  health: GAME_CONSTANTS.STARTING_HEALTH,
  maxHealth: GAME_CONSTANTS.STARTING_HEALTH,
  shield: GAME_CONSTANTS.STARTING_SHIELD,
  maxShield: GAME_CONSTANTS.STARTING_SHIELD,
  wordsTyped: 0,
  wordsCorrect: 0,
  wordsMissed: 0,
  currentWord: '',
  activeEnemyId: null,
  wpm: 0,
  accuracy: 100,
  startTime: 0,
  elapsedTime: 0,
  bonusItems: [],
  selectedBonusIndex: 0,
  empCooldown: 0,
  empMaxCooldown: GAME_CONSTANTS.EMP_COOLDOWN_FRAMES,
  isPaused: false,
  isGameOver: false,
  programmingLanguage: undefined,
  bossesDefeated: 0,
  currentDifficulty: 'Normal',
};

// localStorage persistence - ONLY for: high scores, achievements, stats
// NOTE: Settings are stored separately in 'game-settings' key (musicVolume, sfxVolume, difficulty)
const STORAGE_KEY = 'ptype-game-storage';

interface PlayerStats {
  totalGamesPlayed: number;
  totalScore: number;
  totalWordsTyped: number;
  totalWordsCorrect: number;
  totalWordsMissed: number;
  totalTimePlayed: number; // seconds
  bestScore: number;
  bestLevel: number;
  bestWPM: number;
  bestAccuracy: number;
}

interface PersistedState {
  achievements: Achievement[];
  highScores: HighScoreEntry[];
  stats: PlayerStats;
}

const loadPersistedState = (): Partial<PersistedState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error);
  }
  return {};
};

const savePersistedState = (state: PersistedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save persisted state:', error);
  }
};

const GameStoreContext = createContext<GameStore | null>(null);

const initialStats: PlayerStats = {
  totalGamesPlayed: 0,
  totalScore: 0,
  totalWordsTyped: 0,
  totalWordsCorrect: 0,
  totalWordsMissed: 0,
  totalTimePlayed: 0,
  bestScore: 0,
  bestLevel: 0,
  bestWPM: 0,
  bestAccuracy: 0,
};

// Default player profile
const createDefaultProfile = (): PlayerProfile => ({
  name: 'Player',
  createdAt: new Date().toISOString(),
  lastPlayed: new Date().toISOString(),
  totalScore: 0,
  highScore: 0,
  totalWordsTyped: 0,
  totalAccuracy: 100,
  totalGamesPlayed: 0,
  totalTimePlayed: 0,
  averageWPM: 0,
  bestWPM: 0,
  achievements: [],
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
});

export const GameStoreProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [currentProfile, setCurrentProfile] = useState<PlayerProfile | null>(createDefaultProfile());
  const [achievements, setAchievements] = useState<Achievement[]>(
    ACHIEVEMENTS_DEFINITIONS.map(def => ({
      ...def,
      progress: 0,
      unlocked: false,
      unlockedAt: undefined,
    }))
  );
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [stats, setStats] = useState<PlayerStats>(initialStats);
  const [currentTrivia, setCurrentTrivia] = useState<TriviaQuestion | null>(null);
  const [triviaAnswered, setTriviaAnswered] = useState(false);
  const [triviaResult, setTriviaResult] = useState(false);
  const [selectedTriviaAnswer, setSelectedTriviaAnswer] = useState(0);

  // Load persisted state on mount
  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted.achievements) {
      setAchievements(persisted.achievements);
    }
    if (persisted.highScores) {
      setHighScores(persisted.highScores);
    }
    if (persisted.stats) {
      setStats(persisted.stats);
    }
  }, []);

  // Save to localStorage when relevant data changes (ONLY high scores, achievements, stats)
  useEffect(() => {
    savePersistedState({
      achievements,
      highScores,
      stats,
    });
  }, [achievements, highScores, stats]);

  const setProfile = useCallback((profile: PlayerProfile) => {
    setCurrentProfile(profile);
  }, []);

  const addHighScore = useCallback((entry: HighScoreEntry): number => {
    let position = 0;
    setHighScores(prev => {
      const newScores = [...prev, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);
      
      position = newScores.findIndex(s => 
        s.timestamp === entry.timestamp && s.score === entry.score
      ) + 1;
      
      return newScores;
    });
    return position;
  }, []);

  const getHighScores = useCallback((mode: string, language?: string, limit = 10): HighScoreEntry[] => {
    return highScores
      .filter(s => {
        if (s.mode !== mode) return false;
        if (language && s.language !== language) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }, [highScores]);

  const showTrivia = useCallback((question: TriviaQuestion) => {
    setCurrentTrivia(question);
    setTriviaAnswered(false);
    setTriviaResult(false);
    setSelectedTriviaAnswer(0);
    setGameState(prev => ({
      ...prev,
      isPaused: true,
      mode: 'trivia' as GameMode,
    }));
  }, []);

  const answerTrivia = useCallback((answerIndex: number, correct: boolean, bonusItem?: BonusItem | null) => {
    setTriviaAnswered(true);
    setTriviaResult(correct);
    setSelectedTriviaAnswer(answerIndex);
    
    if (correct && bonusItem) {
      setGameState(prev => ({
        ...prev,
        bonusItems: [...prev.bonusItems, bonusItem],
      }));
    }
    
    achievementsManager.onTriviaAnswered(correct);
  }, []);

  const hideTrivia = useCallback(() => {
    setGameState(prev => {
      const previousMode = prev.mode;
      setCurrentTrivia(null);
      setTriviaAnswered(false);
      setTriviaResult(false);
      setSelectedTriviaAnswer(0);
      return {
        ...prev,
        isPaused: false,
        mode: previousMode === 'trivia' ? 'normal' as GameMode : previousMode,
      };
    });
  }, []);

  const startGame = useCallback((mode: GameMode, language?: ProgrammingLanguage) => {
    debug('Starting game', { mode, language }, 'GameStore');
    
    const startingDifficulty = getStartingDifficulty();
    const initialDifficulty = getCurrentDifficulty(1, startingDifficulty);
    
    setGameState({
      ...initialGameState,
      mode,
      programmingLanguage: language,
      startTime: Date.now(),
      isPaused: false,
      isGameOver: false,
      activeEnemyId: null,
      currentWord: '',
      currentDifficulty: initialDifficulty,
    });
    
    setEnemies([]);
    
    if (language) {
      achievementsManager.onLanguagePlayed(language);
    }
    
    debug('Game started successfully', undefined, 'GameStore');
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    setEnemies([]);
  }, []);

  const endGame = useCallback(() => {
    setGameState(prev => {
      const playTimeSeconds = Math.floor((Date.now() - prev.startTime) / 1000);
      achievementsManager.onGameEnd({
        score: prev.score,
        level: prev.level,
        wpm: prev.wpm,
        accuracy: prev.accuracy,
        playTimeSeconds,
      });
      
      const gameMode = prev.mode === 'trivia' ? 'normal' : prev.mode;
      if (currentProfile && prev.score > 0) {
        const entry: HighScoreEntry = {
          playerName: currentProfile.name,
          score: prev.score,
          level: prev.level,
          wpm: prev.wpm,
          accuracy: prev.accuracy,
          timestamp: new Date().toISOString(),
          mode: gameMode as GameMode,
          language: prev.programmingLanguage,
        };
        addHighScore(entry);
      }
      
      // Update player stats
      setStats(prevStats => ({
        totalGamesPlayed: prevStats.totalGamesPlayed + 1,
        totalScore: prevStats.totalScore + prev.score,
        totalWordsTyped: prevStats.totalWordsTyped + prev.wordsTyped,
        totalWordsCorrect: prevStats.totalWordsCorrect + prev.wordsCorrect,
        totalWordsMissed: prevStats.totalWordsMissed + prev.wordsMissed,
        totalTimePlayed: prevStats.totalTimePlayed + playTimeSeconds,
        bestScore: Math.max(prevStats.bestScore, prev.score),
        bestLevel: Math.max(prevStats.bestLevel, prev.level),
        bestWPM: Math.max(prevStats.bestWPM, prev.wpm),
        bestAccuracy: Math.max(prevStats.bestAccuracy, prev.accuracy),
      }));
      
      return {
        ...prev,
        isGameOver: true,
        isPaused: true,
        mode: 'game_over' as GameMode,
      };
    });
  }, [currentProfile, addHighScore]);

  const addEnemy = useCallback((enemy: Enemy) => {
    setEnemies(prev => [...prev, enemy]);
  }, []);

  const updateEnemy = useCallback((id: string, updates: Partial<Enemy>) => {
    setEnemies(prev => prev.map((e: Enemy) => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const removeEnemy = useCallback((id: string) => {
    setEnemies(prev => prev.filter((e: Enemy) => e.id !== id));
    setGameState(prev => ({
      ...prev,
      activeEnemyId: prev.activeEnemyId === id ? null : prev.activeEnemyId,
    }));
  }, []);

  const setActiveEnemy = useCallback((id: string | null) => {
    setGameState(prev => ({ ...prev, activeEnemyId: id }));
  }, []);

  const getActiveEnemy = useCallback((): Enemy | null => {
    return enemies.find((e: Enemy) => e.id === gameState.activeEnemyId) || null;
  }, [enemies, gameState.activeEnemyId]);

  const setCurrentWord = useCallback((word: string) => {
    setGameState(prev => ({ ...prev, currentWord: word }));
  }, []);

  const incrementScore = useCallback((points: number) => {
    setGameState(prev => ({ ...prev, score: prev.score + points }));
  }, []);

  const updateStats = useCallback((wpm: number, accuracy: number) => {
    setGameState(prev => ({ ...prev, wpm, accuracy }));
  }, []);

  const takeDamage = useCallback((amount: number) => {
    setGameState(prev => {
      const shieldDamage = Math.min(prev.shield, amount);
      const healthDamage = amount - shieldDamage;
      const newShield = Math.max(0, prev.shield - shieldDamage);
      const newHealth = Math.max(0, prev.health - healthDamage);
      
      if (newHealth <= 0) {
        setTimeout(() => endGame(), 100);
      }
      
      return {
        ...prev,
        shield: newShield,
        health: newHealth,
      };
    });
  }, [endGame]);

  const heal = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      health: Math.min(prev.maxHealth, prev.health + amount),
    }));
  }, []);

  const addShield = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      shield: Math.min(prev.maxShield, prev.shield + amount),
    }));
  }, []);

  const nextLevel = useCallback(() => {
    setGameState(prev => {
      const newLevel = prev.level + 1;
      const startingDifficulty = getStartingDifficulty();
      const newDifficulty = getCurrentDifficulty(newLevel, startingDifficulty);
      
      return {
        ...prev,
        level: newLevel,
        currentDifficulty: newDifficulty,
      };
    });
  }, []);

  const typeCharacter = useCallback((char: string) => {
    setGameState(prev => ({
      ...prev,
      currentWord: prev.currentWord + char,
    }));
  }, []);

  const deleteCharacter = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentWord: prev.currentWord.slice(0, -1),
    }));
  }, []);

  const submitWord = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      wordsTyped: prev.wordsTyped + 1,
    }));
  }, []);

  const addBonusItem = useCallback((bonus: BonusItem) => {
    setGameState(prev => ({
      ...prev,
      bonusItems: [...prev.bonusItems, bonus],
    }));
  }, []);

  const removeBonusItem = useCallback((id: string) => {
    setGameState(prev => {
      const newBonusItems = prev.bonusItems.filter(b => b.type !== id);
      return {
        ...prev,
        bonusItems: newBonusItems,
        selectedBonusIndex: Math.min(prev.selectedBonusIndex, newBonusItems.length - 1),
      };
    });
  }, []);

  const updateBonusItem = useCallback((id: string, updates: Partial<BonusItem>) => {
    setGameState(prev => ({
      ...prev,
      bonusItems: prev.bonusItems.map(b => 
        b.type === id ? { ...b, ...updates } : b
      ),
    }));
  }, []);

  const selectNextBonus = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedBonusIndex: (prev.selectedBonusIndex + 1) % Math.max(1, prev.bonusItems.length),
    }));
  }, []);

  const selectPreviousBonus = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedBonusIndex: prev.selectedBonusIndex === 0 
        ? Math.max(0, prev.bonusItems.length - 1)
        : prev.selectedBonusIndex - 1,
    }));
  }, []);

  const useSelectedBonus = useCallback((): BonusItem | null => {
    let bonus: BonusItem | null = null;
    setGameState(prev => {
      bonus = prev.bonusItems[prev.selectedBonusIndex] || null;
      if (bonus) {
        const newBonusItems = prev.bonusItems.filter((_, i) => i !== prev.selectedBonusIndex);
        return {
          ...prev,
          bonusItems: newBonusItems,
          selectedBonusIndex: Math.min(prev.selectedBonusIndex, newBonusItems.length - 1),
        };
      }
      return prev;
    });
    return bonus;
  }, []);

  const setEmpCooldown = useCallback((frames: number) => {
    setGameState(prev => ({ ...prev, empCooldown: frames }));
  }, []);

  const decrementEmpCooldown = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      empCooldown: Math.max(0, prev.empCooldown - 1),
    }));
  }, []);

  const useEMP = useCallback(() => {
    if (gameState.empCooldown === 0) {
      setGameState(prev => ({
        ...prev,
        empCooldown: prev.empMaxCooldown,
      }));
      // EMP logic handled by caller
    }
  }, [gameState.empCooldown]);

  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev =>
      prev.map(a =>
        a.id === achievementId && !a.unlocked
          ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
          : a
      )
    );
  }, []);

  const updateAchievementProgress = useCallback((achievementId: string, progress: number) => {
    setAchievements(prev =>
      prev.map(a =>
        a.id === achievementId ? { ...a, progress } : a
      )
    );
  }, []);

  const syncAchievements = useCallback(() => {
    const managerAchievements = achievementsManager.getAchievements();
    setAchievements(managerAchievements);
  }, []);

  const store: GameStore = {
    ...gameState,
    currentProfile,
    achievements,
    highScores,
    stats,
    currentTrivia,
    triviaAnswered,
    triviaResult,
    selectedTriviaAnswer,
    enemies,
    setProfile,
    addHighScore,
    getHighScores,
    showTrivia,
    answerTrivia,
    hideTrivia,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    addEnemy,
    updateEnemy,
    removeEnemy,
    setActiveEnemy,
    getActiveEnemy,
    setCurrentWord,
    incrementScore,
    updateStats,
    takeDamage,
    heal,
    addShield,
    nextLevel,
    typeCharacter,
    deleteCharacter,
    submitWord,
    addBonusItem,
    removeBonusItem,
    updateBonusItem,
    selectNextBonus,
    selectPreviousBonus,
    useSelectedBonus,
    setEmpCooldown,
    decrementEmpCooldown,
    useEMP,
    unlockAchievement,
    updateAchievementProgress,
    syncAchievements,
  };

  return (
    <GameStoreContext.Provider value={store}>
      {children}
    </GameStoreContext.Provider>
  );
};

export const useGameStore = () => {
  const context = useContext(GameStoreContext);
  if (!context) {
    throw new Error('useGameStore must be used within GameStoreProvider');
  }
  return context;
};
