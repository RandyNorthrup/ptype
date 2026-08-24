/**
 * Game state management using React Context + localStorage
 * Optimized with useMemo to prevent unnecessary re-renders
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type {
  GameState,
  PlayerProfile,
  Enemy,
  Achievement,
  ProgrammingLanguage,
  BonusItem,
  TriviaQuestion,
} from "../types";
import { GAME_CONSTANTS, GameMode } from "../types";
import {
  achievementsManager,
  ACHIEVEMENTS_DEFINITIONS,
} from "../utils/achievementsManager";
import { debug, error as logError } from "../utils/logger";
import {
  getCurrentDifficulty,
  getStartingDifficulty,
} from "../utils/difficultyManager";

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

  // Trivia system
  currentTrivia: TriviaQuestion | null;
  triviaAnswered: boolean;
  triviaResult: boolean;
  selectedTriviaAnswer: number;
  showTrivia: (question: TriviaQuestion) => void;
  answerTrivia: (
    answerIndex: number,
    correct: boolean,
    bonusItem?: BonusItem | null,
  ) => void;
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

  // Game state updates
  setCurrentWord: (word: string) => void;
  incrementScore: (points: number) => void;
  incrementBossesDefeated: () => void;
  updateStats: (wpm: number, accuracy: number) => void;
  incrementWordsMissed: () => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  addShield: (amount: number) => void;
  nextLevel: () => void;

  // Typing actions
  typeCharacter: (char: string) => void;
  submitWord: () => void;

  // Bonus system
  addBonusItem: (bonus: BonusItem) => void;
  selectNextBonus: () => void;
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
  mode: GameMode.MENU,
  level: 1,
  score: 0,
  health: GAME_CONSTANTS.STARTING_HEALTH,
  maxHealth: GAME_CONSTANTS.STARTING_HEALTH,
  shield: GAME_CONSTANTS.STARTING_SHIELD,
  maxShield: GAME_CONSTANTS.STARTING_SHIELD,
  wordsTyped: 0,
  wordsCorrect: 0,
  wordsMissed: 0,
  currentWord: "",
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
  currentDifficulty: "Normal",
  previousMode: undefined,
  previousLanguage: undefined,
};

// localStorage persistence - ONLY for: high scores, achievements, stats
// NOTE: Settings are stored separately in 'game-settings' key (musicVolume, sfxVolume, difficulty)
const STORAGE_KEY = "ptype-game-storage";

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
    logError("Failed to load persisted state", error, "GameStore");
  }
  return {};
};

const savePersistedState = (state: PersistedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    logError("Failed to save persisted state", error, "GameStore");
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

/**
Helper to clamp selectedBonusIndex safely
*/
function clampBonusIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return Math.min(index, length - 1);
}

const createDefaultProfile = (): PlayerProfile => ({
  name: "Player",
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
  const [currentProfile, setCurrentProfile] = useState<PlayerProfile | null>(
    createDefaultProfile(),
  );
  const [achievements, setAchievements] = useState<Achievement[]>(
    ACHIEVEMENTS_DEFINITIONS.map((def) => ({
      ...def,
      progress: 0,
      unlocked: false,
    })),
  );
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [stats, setStats] = useState<PlayerStats>(initialStats);
  const [currentTrivia, setCurrentTrivia] = useState<TriviaQuestion | null>(
    null,
  );
  const [triviaAnswered, setTriviaAnswered] = useState(false);
  const [triviaResult, setTriviaResult] = useState(false);
  const [selectedTriviaAnswer, setSelectedTriviaAnswer] = useState(0);

  // Refs for stable access in callbacks without closure staleness
  const gameStateReference = useRef(gameState);
  gameStateReference.current = gameState;
  const enemiesReference = useRef(enemies);
  enemiesReference.current = enemies;
  const currentProfileReference = useRef(currentProfile);
  currentProfileReference.current = currentProfile;

  // Ref for takeDamage timeout cleanup
  const deathTimeoutReference = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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

  // Cleanup death timeout on unmount
  useEffect(() => {
    return () => {
      if (deathTimeoutReference.current) {
        clearTimeout(deathTimeoutReference.current);
      }
    };
  }, []);

  const setProfile = useCallback((profile: PlayerProfile) => {
    setCurrentProfile(profile);
  }, []);

  const addHighScore = useCallback((entry: HighScoreEntry): number => {
    let position = 0;
    setHighScores((previous) => {
      const newScores = [...previous, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);

      position =
        newScores.findIndex(
          (s) => s.timestamp === entry.timestamp && s.score === entry.score,
        ) + 1;

      return newScores;
    });
    return position;
  }, []);

  const showTrivia = useCallback((question: TriviaQuestion) => {
    setCurrentTrivia(question);
    setTriviaAnswered(false);
    setTriviaResult(false);
    setSelectedTriviaAnswer(0);
    setGameState((previous) => ({
      ...previous,
      isPaused: true,
      previousMode: previous.mode, // save pre-trivia mode for restoration
      mode: GameMode.TRIVIA,
    }));
  }, []);

  const answerTrivia = useCallback(
    (answerIndex: number, correct: boolean, bonusItem?: BonusItem | null) => {
      setTriviaAnswered(true);
      setTriviaResult(correct);
      setSelectedTriviaAnswer(answerIndex);

      if (correct && bonusItem) {
        setGameState((previous) => ({
          ...previous,
          bonusItems: [...previous.bonusItems, bonusItem],
        }));
      }

      achievementsManager.onTriviaAnswered(correct);
    },
    [],
  );

  const hideTrivia = useCallback(() => {
    // Set trivia state outside of setGameState updater to avoid nested setState
    setCurrentTrivia(null);
    setTriviaAnswered(false);
    setTriviaResult(false);
    setSelectedTriviaAnswer(0);
    setGameState((previous) => ({
      ...previous,
      isPaused: false,
      mode:
        previous.mode === GameMode.TRIVIA
          ? (previous.previousMode ?? GameMode.NORMAL)
          : previous.mode,
    }));
  }, []);

  const startGame = useCallback(
    (mode: GameMode, language?: ProgrammingLanguage) => {
      debug("Starting game", { mode, language }, "GameStore");

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
        currentWord: "",
        currentDifficulty: initialDifficulty,
      });

      setEnemies([]);

      if (language) {
        achievementsManager.onLanguagePlayed(language);
      }

      debug("Game started successfully", undefined, "GameStore");
    },
    [],
  );

  const pauseGame = useCallback(() => {
    setGameState((previous) => ({ ...previous, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState((previous) => ({ ...previous, isPaused: false }));
  }, []);

  const resetGame = useCallback(() => {
    if (deathTimeoutReference.current) {
      clearTimeout(deathTimeoutReference.current);
      deathTimeoutReference.current = null;
    }
    setGameState(initialGameState);
    setEnemies([]);
  }, []);

  const endGame = useCallback(() => {
    // Read from refs for stable access instead of stale closures
    const state = gameStateReference.current;
    const profile = currentProfileReference.current;

    const playTimeSeconds = Math.max(
      0,
      Math.floor((Date.now() - state.startTime) / 1000),
    );
    achievementsManager.onGameEnd({
      score: state.score,
      level: state.level,
      wpm: state.wpm,
      accuracy: state.accuracy,
      playTimeSeconds,
    });

    const gameMode =
      state.previousMode ??
      (state.mode === GameMode.TRIVIA ? GameMode.NORMAL : state.mode);
    if (profile && state.score > 0) {
      const entry: HighScoreEntry = {
        playerName: profile.name,
        score: state.score,
        level: state.level,
        wpm: state.wpm,
        accuracy: state.accuracy,
        timestamp: new Date().toISOString(),
        mode: gameMode,
        ...(state.programmingLanguage
          ? { language: state.programmingLanguage }
          : {}),
      };
      addHighScore(entry);
    }

    // Update player stats
    setStats((previousStats) => ({
      totalGamesPlayed: previousStats.totalGamesPlayed + 1,
      totalScore: previousStats.totalScore + state.score,
      totalWordsTyped: previousStats.totalWordsTyped + state.wordsTyped,
      totalWordsCorrect: previousStats.totalWordsCorrect + state.wordsCorrect,
      totalWordsMissed: previousStats.totalWordsMissed + state.wordsMissed,
      totalTimePlayed: previousStats.totalTimePlayed + playTimeSeconds,
      bestScore: Math.max(previousStats.bestScore, state.score),
      bestLevel: Math.max(previousStats.bestLevel, state.level),
      bestWPM: Math.max(previousStats.bestWPM, state.wpm),
      bestAccuracy: Math.max(previousStats.bestAccuracy, state.accuracy),
    }));

    setGameState((previous) => ({
      ...previous,
      isGameOver: true,
      isPaused: true,
      previousMode: gameMode,
      previousLanguage: state.programmingLanguage,
      mode: GameMode.GAME_OVER,
    }));
  }, [addHighScore]);

  const addEnemy = useCallback((enemy: Enemy) => {
    setEnemies((previous) => [...previous, enemy]);
  }, []);

  const updateEnemy = useCallback((id: string, updates: Partial<Enemy>) => {
    setEnemies((previous) =>
      previous.map((e: Enemy) => (e.id === id ? { ...e, ...updates } : e)),
    );
  }, []);

  const removeEnemy = useCallback((id: string) => {
    setEnemies((previous) => previous.filter((e: Enemy) => e.id !== id));
    setGameState((previous) => ({
      ...previous,
      activeEnemyId:
        previous.activeEnemyId === id ? null : previous.activeEnemyId,
    }));
  }, []);

  const setActiveEnemy = useCallback((id: string | null) => {
    setGameState((previous) => ({ ...previous, activeEnemyId: id }));
  }, []);

  const setCurrentWord = useCallback((word: string) => {
    setGameState((previous) => ({ ...previous, currentWord: word }));
  }, []);

  const incrementScore = useCallback((points: number) => {
    setGameState((previous) => ({
      ...previous,
      score: previous.score + points,
    }));
  }, []);

  const updateStats = useCallback((wpm: number, accuracy: number) => {
    setGameState((previous) => ({ ...previous, wpm, accuracy }));
  }, []);

  const incrementWordsMissed = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      wordsMissed: previous.wordsMissed + 1,
      wordsTyped: previous.wordsTyped + 1,
    }));
    achievementsManager.onWordMissed();
  }, []);

  const takeDamage = useCallback(
    (amount: number) => {
      if (amount <= 0) return;
      setGameState((previous) => {
        const shieldDamage = Math.min(previous.shield, amount);
        const healthDamage = amount - shieldDamage;
        const newShield = Math.max(0, previous.shield - shieldDamage);
        const newHealth = Math.max(0, previous.health - healthDamage);

        if (newHealth <= 0 && !deathTimeoutReference.current) {
          deathTimeoutReference.current = setTimeout(() => {
            deathTimeoutReference.current = null;
            endGame();
          }, 100);
        }

        return {
          ...previous,
          shield: newShield,
          health: newHealth,
        };
      });
    },
    [endGame],
  );

  const heal = useCallback((amount: number) => {
    if (amount <= 0) return;
    setGameState((previous) => ({
      ...previous,
      health: Math.min(previous.maxHealth, previous.health + amount),
    }));
  }, []);

  const addShield = useCallback((amount: number) => {
    if (amount <= 0) return;
    setGameState((previous) => ({
      ...previous,
      shield: Math.min(previous.maxShield, previous.shield + amount),
    }));
  }, []);

  const incrementBossesDefeated = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      bossesDefeated: previous.bossesDefeated + 1,
    }));
    achievementsManager.onBossDefeated();
  }, []);

  const nextLevel = useCallback(() => {
    setGameState((previous) => {
      const newLevel = previous.level + 1;
      const startingDifficulty = getStartingDifficulty();
      const newDifficulty = getCurrentDifficulty(newLevel, startingDifficulty);

      return {
        ...previous,
        level: newLevel,
        currentDifficulty: newDifficulty,
      };
    });
  }, []);

  const typeCharacter = useCallback((char: string) => {
    setGameState((previous) => ({
      ...previous,
      currentWord: previous.currentWord + char,
    }));
  }, []);

  const submitWord = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      wordsTyped: previous.wordsTyped + 1,
      wordsCorrect: previous.wordsCorrect + 1,
      currentWord: "",
    }));
    achievementsManager.onWordCompleted();
  }, []);

  const addBonusItem = useCallback((bonus: BonusItem) => {
    setGameState((previous) => ({
      ...previous,
      bonusItems: [...previous.bonusItems, bonus],
    }));
    achievementsManager.onBonusCollected();
  }, []);

  const selectNextBonus = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      selectedBonusIndex:
        (previous.selectedBonusIndex + 1) %
        Math.max(1, previous.bonusItems.length),
    }));
  }, []);

  const useSelectedBonus = useCallback((): BonusItem | null => {
    // Read current state from ref to get synchronous result
    const state = gameStateReference.current;
    const bonus = state.bonusItems[state.selectedBonusIndex] || null;
    if (bonus) {
      setGameState((previous) => {
        const newBonusItems = previous.bonusItems.filter(
          (_, index) => index !== previous.selectedBonusIndex,
        );
        return {
          ...previous,
          bonusItems: newBonusItems,
          selectedBonusIndex: clampBonusIndex(
            previous.selectedBonusIndex,
            newBonusItems.length,
          ),
        };
      });
      achievementsManager.onBonusUsed();
    }
    return bonus;
  }, []);

  const setEmpCooldown = useCallback((frames: number) => {
    setGameState((previous) => ({ ...previous, empCooldown: frames }));
  }, []);

  const decrementEmpCooldown = useCallback(() => {
    setGameState((previous) => ({
      ...previous,
      empCooldown: Math.max(0, previous.empCooldown - 1),
    }));
  }, []);

  const useEMP = useCallback(() => {
    // Read current state from ref to avoid stale closures
    const state = gameStateReference.current;
    if (state.empCooldown !== 0) return;

    const currentEnemies = enemiesReference.current;
    const nonBossEnemies = currentEnemies.filter((e) => !e.isBoss);

    // Remove non-boss enemies (separate setState, not nested)
    if (nonBossEnemies.length > 0) {
      const totalPoints = nonBossEnemies.reduce(
        (sum, e) => sum + e.word.length * 10,
        0,
      );
      setEnemies((previousEnemies) => previousEnemies.filter((e) => e.isBoss));
      setGameState((previous) => ({
        ...previous,
        empCooldown: previous.empMaxCooldown,
        score: previous.score + totalPoints,
        activeEnemyId: nonBossEnemies.some(
          (e) => e.id === previous.activeEnemyId,
        )
          ? null
          : previous.activeEnemyId,
      }));
    } else {
      setGameState((previous) => ({
        ...previous,
        empCooldown: previous.empMaxCooldown,
      }));
    }
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements((previous) =>
      previous.map((a) =>
        a.id === achievementId && !a.unlocked
          ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
          : a,
      ),
    );
  }, []);

  const updateAchievementProgress = useCallback(
    (achievementId: string, progress: number) => {
      setAchievements((previous) =>
        previous.map((a) => (a.id === achievementId ? { ...a, progress } : a)),
      );
    },
    [],
  );

  const syncAchievements = useCallback(() => {
    const managerAchievements = achievementsManager.getAchievements();
    // Create new array + shallow-clone each object so React detects the change
    setAchievements(managerAchievements.map((a) => ({ ...a })));
  }, []);

  // CRITICAL: Memoize the store object so context consumers don't re-render
  // unless actual state values change
  const store: GameStore = useMemo(
    () => ({
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
      setCurrentWord,
      incrementScore,
      incrementBossesDefeated,
      updateStats,
      incrementWordsMissed,
      takeDamage,
      heal,
      addShield,
      nextLevel,
      typeCharacter,
      submitWord,
      addBonusItem,
      selectNextBonus,
      useSelectedBonus,
      setEmpCooldown,
      decrementEmpCooldown,
      useEMP,
      unlockAchievement,
      updateAchievementProgress,
      syncAchievements,
    }),
    [
      gameState,
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
      setCurrentWord,
      incrementScore,
      incrementBossesDefeated,
      updateStats,
      incrementWordsMissed,
      takeDamage,
      heal,
      addShield,
      nextLevel,
      typeCharacter,
      submitWord,
      addBonusItem,
      selectNextBonus,
      useSelectedBonus,
      setEmpCooldown,
      decrementEmpCooldown,
      useEMP,
      unlockAchievement,
      updateAchievementProgress,
      syncAchievements,
    ],
  );

  return (
    <GameStoreContext.Provider value={store}>
      {children}
    </GameStoreContext.Provider>
  );
};

export const useGameStore = () => {
  const context = useContext(GameStoreContext);
  if (!context) {
    throw new Error("useGameStore must be used within GameStoreProvider");
  }
  return context;
};
