/**
 * Global game state management using Zustand
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GameState, PlayerProfile, Enemy, Achievement, ProgrammingLanguage, BonusItem, TriviaQuestion } from '../types';
import { GAME_CONSTANTS, GameMode } from '../types';
import { achievementsManager, ACHIEVEMENTS_DEFINITIONS } from '../utils/achievementsManager';
import { debug, info } from '../utils/logger';
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
  answerTrivia: (answerIndex: number, correct: boolean, bonusItem: BonusItem | null) => void;
  hideTrivia: () => void;
  
  // Game state actions
  startGame: (mode: GameMode, language?: ProgrammingLanguage) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // Enemy management
  enemies: Enemy[];
  activeEnemyId: string | null;
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (id: string) => void;
  updateEnemy: (id: string, updates: Partial<Enemy>) => void;
  clearEnemies: () => void;
  
  // Typing actions
  typeCharacter: (char: string) => void;
  deleteCharacter: () => void;
  submitWord: () => void;
  
  // Stats updates
  updateWPM: (wpm: number) => void;
  updateAccuracy: (accuracy: number) => void;
  incrementScore: (points: number) => void;
  takeDamage: (damage: number) => void;
  heal: (amount: number) => void;
  restoreShield: (amount: number) => void;
  
  // Bonus items
  selectNextBonusItem: () => void;
  selectPreviousBonusItem: () => void;
  useBonusItem: () => void;
  addBonusItem: (item: BonusItem) => void;
  
  // EMP
  useEMP: () => void;
  updateEMPCooldown: () => void;
  
  // Level progression
  levelUp: () => void;
  
  // Achievements
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
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
  bossesDefeated: 0,
  currentDifficulty: 'Normal', // Will be updated based on settings + level
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialGameState,
        currentProfile: null,
        enemies: [],
        activeEnemyId: null,
        achievements: ACHIEVEMENTS_DEFINITIONS.map(def => ({
          ...def,
          progress: 0,
          unlocked: false,
          unlockedAt: undefined,
        })),
        highScores: [],
        currentTrivia: null,
        triviaAnswered: false,
        triviaResult: false,
        selectedTriviaAnswer: 0,

        setProfile: (profile) => set({ currentProfile: profile }),

        // High scores management
        addHighScore: (entry) => {
          const { highScores } = get();
          
          // Add entry to high scores
          const newScores = [...highScores, entry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 100); // Keep top 100
          
          set({ highScores: newScores });
          
          // Find position (1-indexed)
          const position = newScores.findIndex(s => 
            s.timestamp === entry.timestamp && s.score === entry.score
          ) + 1;
          
          return position;
        },

        getHighScores: (mode, language, limit = 10) => {
          const { highScores } = get();
          return highScores
            .filter(s => {
              if (s.mode !== mode) return false;
              if (language && s.language !== language) return false;
              return true;
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        },

        // Trivia system
        showTrivia: (question) => {
          set({
            currentTrivia: question,
            triviaAnswered: false,
            triviaResult: false,
            selectedTriviaAnswer: 0,
            isPaused: true,
            mode: 'trivia' as GameMode,
          });
        },

        answerTrivia: (answerIndex, correct, bonusItem) => {
          set({
            triviaAnswered: true,
            triviaResult: correct,
            selectedTriviaAnswer: answerIndex,
          });
          
          // Add bonus item if correct
          if (correct && bonusItem) {
            get().addBonusItem(bonusItem);
          }
          
          // Track trivia achievement
          achievementsManager.onTriviaAnswered(correct);
        },

        hideTrivia: () => {
          const previousMode = get().mode;
          set({
            currentTrivia: null,
            triviaAnswered: false,
            triviaResult: false,
            selectedTriviaAnswer: 0,
            isPaused: false,
            mode: previousMode === 'trivia' ? 'normal' as GameMode : previousMode,
          });
        },

        startGame: (mode, language) => {
          debug('Starting game', { mode, language }, 'GameStore');
          
          // Calculate initial difficulty based on settings
          const startingDifficulty = getStartingDifficulty();
          const initialDifficulty = getCurrentDifficulty(1, startingDifficulty);
          
          set({
            ...initialGameState,
            mode,
            programmingLanguage: language,
            startTime: Date.now(),
            isPaused: false,
            isGameOver: false,
            enemies: [], // Clear enemies
            activeEnemyId: null, // Clear active enemy
            currentWord: '', // Clear current word
            currentDifficulty: initialDifficulty,
          });
          
          // Track language played for polyglot achievement
          if (language) {
            achievementsManager.onLanguagePlayed(language);
          }
          
          debug('Game started successfully', undefined, 'GameStore');
        },

        pauseGame: () => set({ isPaused: true }),
        resumeGame: () => set({ isPaused: false }),
        
        endGame: () => {
          const state = get();
          
          // Track end game achievements
          const playTimeSeconds = Math.floor((Date.now() - state.startTime) / 1000);
          achievementsManager.onGameEnd({
            score: state.score,
            level: state.level,
            wpm: state.wpm,
            accuracy: state.accuracy,
            playTimeSeconds,
          });
          
          // Save high score (capture mode before setting to game_over)
          const gameMode = state.mode === 'trivia' ? 'normal' : state.mode; // Use normal if trivia interrupted
          if (state.currentProfile && state.score > 0) {
            const entry: HighScoreEntry = {
              playerName: state.currentProfile.name,
              score: state.score,
              level: state.level,
              wpm: state.wpm,
              accuracy: state.accuracy,
              timestamp: new Date().toISOString(),
              mode: gameMode as GameMode,
              language: state.programmingLanguage,
            };
            
            const position = get().addHighScore(entry);
            info(`High score saved at position #${position}`, { score: state.score, mode: gameMode, position }, 'GameStore');
          }
          
          set({ isGameOver: true, mode: 'game_over' as GameMode });
        },
        
        resetGame: () => {
          // Reset to initial state, always returning to menu
          set({
            ...initialGameState,
            mode: 'menu' as GameMode,
            programmingLanguage: undefined,
            enemies: [],
            activeEnemyId: null,
            currentTrivia: null,
            triviaAnswered: false,
            triviaResult: false,
            selectedTriviaAnswer: 0,
            // Preserve profile, achievements, and high scores (handled by persist)
            currentProfile: get().currentProfile,
            achievements: get().achievements,
            highScores: get().highScores,
          });
        },

        addEnemy: (enemy) => {
          set((state) => ({
            enemies: [...state.enemies, enemy],
          }));
        },

        removeEnemy: (id) => {
          set((state) => {
            const updates: any = {
              enemies: state.enemies.filter((e) => e.id !== id),
            };
            
            // Clear active enemy if it's the one being removed
            if (state.activeEnemyId === id) {
              updates.activeEnemyId = null;
              updates.currentWord = '';
            }
            
            return updates;
          });
        },

        updateEnemy: (id, updates) => {
          set((state) => ({
            enemies: state.enemies.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          }));
        },

        clearEnemies: () => set({ enemies: [] }),

        typeCharacter: (char) => {
          const { currentWord, activeEnemyId, enemies } = get();
          const newWord = currentWord + char;
          
          // If we have an active enemy (even with empty currentWord), continue typing it
          if (activeEnemyId) {
            const activeEnemy = enemies.find(e => e.id === activeEnemyId);
            
            if (activeEnemy && activeEnemy.word.toLowerCase().startsWith(newWord.toLowerCase())) {
              set({ currentWord: newWord });
              get().updateEnemy(activeEnemy.id, { typedCharacters: newWord.length });
            } else {
              // Wrong character for current word
              debug('Wrong character typed', { 
                expected: activeEnemy?.word[newWord.length - 1],
                word: activeEnemy?.word 
              }, 'GameStore');
            }
          } else if (currentWord === '') {
            // No active enemy - find enemy that starts with this character
            const targetEnemy = enemies.find(e => 
              e.word.toLowerCase().startsWith(char.toLowerCase()) && e.typedCharacters === 0
            );
            
            if (targetEnemy) {
              set({ 
                currentWord: char,
                activeEnemyId: targetEnemy.id
              });
              get().updateEnemy(targetEnemy.id, { typedCharacters: 1 });
            } else {
              // Wrong character - no enemy starts with this
              debug('No enemy starts with character', { char }, 'GameStore');
            }
          }
        },

        deleteCharacter: () => {
          const { currentWord, activeEnemyId } = get();
          const newWord = currentWord.slice(0, -1);
          
          // Keep the active enemy even when deleting all characters
          // Only Tab or destroying the enemy will change the target
          set({ currentWord: newWord });
          
          // Update enemy typed characters
          if (activeEnemyId) {
            get().updateEnemy(activeEnemyId, { typedCharacters: newWord.length });
          }
        },

        submitWord: () => {
          const { currentWord, activeEnemyId, enemies } = get();
          
          if (!currentWord || !activeEnemyId) return;
          
          // Find the active enemy
          const targetEnemy = enemies.find(e => e.id === activeEnemyId);
          
          if (targetEnemy && targetEnemy.word.toLowerCase() === currentWord.toLowerCase()) {
            // Correct word - remove enemy
            const isBoss = targetEnemy.isBoss;
            get().removeEnemy(targetEnemy.id);
            set((state) => ({
              wordsCorrect: state.wordsCorrect + 1,
              wordsTyped: state.wordsTyped + 1,
              currentWord: '',
              activeEnemyId: null,
              score: state.score + targetEnemy.word.length * 10 * (isBoss ? 2 : 1),
            }));
            
            // Track achievements
            achievementsManager.onWordTyped(true);
            if (isBoss) {
              achievementsManager.onBossDefeated();
              
              // Track bosses defeated and trigger trivia every 3 bosses
              set((state) => ({
                bossesDefeated: state.bossesDefeated + 1,
              }));
              
              // Trigger trivia every 3 bosses defeated
              const { bossesDefeated } = get();
              if (bossesDefeated % 3 === 0) {
                // Import and get trivia question asynchronously
                import('../utils/triviaDatabase').then(({ triviaDatabase }) => {
                  const { mode, programmingLanguage, level } = get();
                  const triviaQuestion = triviaDatabase.getQuestion(mode, programmingLanguage, level);
                  if (triviaQuestion) {
                    get().showTrivia(triviaQuestion);
                  }
                });
              }
            }

            // Level progression: every 5 words defeated (or immediately after boss)
            const { wordsCorrect } = get();
            if (isBoss || wordsCorrect % 5 === 0) {
              get().levelUp();
            }
          } else {
            // Incorrect word or incomplete
            set((state) => ({
              wordsMissed: state.wordsMissed + 1,
              wordsTyped: state.wordsTyped + 1,
              currentWord: '',
              activeEnemyId: null,
            }));
            
            // Track achievements (incorrect word)
            achievementsManager.onWordTyped(false);
          }
          
          // Update accuracy
          const state = get();
          const accuracy = (state.wordsCorrect / Math.max(state.wordsTyped, 1)) * 100;
          set({ accuracy });
        },

        updateWPM: (wpm) => set({ wpm }),
        updateAccuracy: (accuracy) => set({ accuracy }),
        incrementScore: (points) => set((state) => ({ score: state.score + points })),
        
        takeDamage: (damage) => {
          set((state) => {
            let remainingDamage = damage;
            let newShield = state.shield;
            let newHealth = state.health;
            
            // Shield absorbs damage first
            if (newShield > 0) {
              if (remainingDamage <= newShield) {
                newShield -= remainingDamage;
                remainingDamage = 0;
              } else {
                remainingDamage -= newShield;
                newShield = 0;
              }
            }
            
            // Remaining damage affects health
            if (remainingDamage > 0) {
              newHealth = Math.max(0, newHealth - remainingDamage);
            }
            
            return {
              shield: newShield,
              health: newHealth,
              isGameOver: newHealth <= 0,
            };
          });
        },

        heal: (amount) => {
          set((state) => ({
            health: Math.min(state.maxHealth, state.health + amount),
          }));
        },

        restoreShield: (amount) => {
          set((state) => ({
            shield: Math.min(state.maxShield, state.shield + amount),
          }));
        },

        selectNextBonusItem: () => {
          set((state) => ({
            selectedBonusIndex: (state.selectedBonusIndex + 1) % Math.max(state.bonusItems.length, 1),
          }));
        },

        selectPreviousBonusItem: () => {
          set((state) => ({
            selectedBonusIndex: state.selectedBonusIndex === 0 
              ? Math.max(0, state.bonusItems.length - 1)
              : state.selectedBonusIndex - 1,
          }));
        },

        useBonusItem: () => {
          const { bonusItems, selectedBonusIndex } = get();
          const item = bonusItems[selectedBonusIndex];
          
          if (!item || item.uses <= 0) return;
          
          // Decrease uses
          set((state) => ({
            bonusItems: state.bonusItems.map((bi, idx) =>
              idx === selectedBonusIndex
                ? { ...bi, uses: bi.uses - 1 }
                : bi
            ).filter(bi => bi.uses > 0), // Remove items with 0 uses
          }));
          
          // Track bonus item usage
          achievementsManager.onBonusItemUsed();
          
          // Apply effect (will be handled by game engine)
        },

        addBonusItem: (item) => {
          set((state) => {
            const existingItem = state.bonusItems.find(bi => bi.itemId === item.itemId);
            
            if (existingItem) {
              // Increment uses
              return {
                bonusItems: state.bonusItems.map(bi =>
                  bi.itemId === item.itemId
                    ? { ...bi, uses: bi.uses + item.uses }
                    : bi
                ),
              };
            } else {
              // Add new item
              return {
                bonusItems: [...state.bonusItems, item],
              };
            }
          });
          
          // Track bonus item collection
          achievementsManager.onBonusItemCollected();
        },

        useEMP: () => {
          const { empCooldown } = get();
          if (empCooldown > 0) return;
          
          // Clear all non-boss enemies
          set((state) => ({
            enemies: state.enemies.filter(e => e.isBoss),
            empCooldown: state.empMaxCooldown,
          }));
        },

        updateEMPCooldown: () => {
          set((state) => ({
            empCooldown: Math.max(0, state.empCooldown - 1),
          }));
        },

        levelUp: () => {
          set((state) => {
            const newLevel = Math.min(GAME_CONSTANTS.MAX_LEVEL, state.level + 1);
            const startingDifficulty = getStartingDifficulty();
            const newDifficulty = getCurrentDifficulty(newLevel, startingDifficulty);
            
            return {
              level: newLevel,
              currentDifficulty: newDifficulty,
            };
          });
        },

        unlockAchievement: (id) => {
          set((state) => ({
            achievements: state.achievements.map(a =>
              a.id === id
                ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
                : a
            ),
          }));
        },
        
        // Initialize achievements from manager
        syncAchievements: () => {
          const managerAchievements = achievementsManager.getAchievements();
          set({ achievements: managerAchievements });
        },

      }),
      {
        name: 'ptype-game-storage',
        partialize: (state) => ({
          // Only persist: profile, achievements, and high scores
          // Game state is never persisted - always start fresh from menu
          currentProfile: state.currentProfile,
          achievements: state.achievements,
          highScores: state.highScores,
        }),
        merge: (persistedState, currentState) => {
          // Explicitly merge only the persisted fields, ensuring game state is NOT restored
          return {
            ...currentState,
            ...(persistedState as Partial<GameStore>),
            // Force reset all game state to initial values
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
            bossesDefeated: 0,
            enemies: [],
            currentTrivia: null,
            triviaAnswered: false,
            triviaResult: false,
            selectedTriviaAnswer: 0,
            programmingLanguage: undefined,
          };
        },
      }
    )
  )
);
