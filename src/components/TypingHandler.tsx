/**
 * Typing Input Handler
 * Captures keyboard input and connects word matching to enemy destruction
 */
import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameContext';
import { getAudioManager } from '../utils/audioManager';
import { triviaDatabase } from '../utils/triviaDatabase';
import { achievementsManager } from '../utils/achievementsManager';
import { GameMode, BonusItemType } from '../types';
import { error as logError } from '../utils/logger';

export function TypingHandler() {
  const {
    enemies,
    typeCharacter,
    submitWord,
    isPaused,
    isGameOver,
    mode,
    level,
    programmingLanguage,
    pauseGame,
    resumeGame,
    useEMP,
    empCooldown,
    activeEnemyId,
    setActiveEnemy,
    updateEnemy,
    incrementScore,
    incrementBossesDefeated,
    nextLevel,
    showTrivia,
    setCurrentWord,
    selectNextBonus,
    useSelectedBonus,
    heal,
    addShield,
    bonusItems,
  } = useGameStore();

  // Refs for values that change frequently — avoids recreating the callback
  const enemiesRef = useRef(enemies);
  enemiesRef.current = enemies;
  const activeEnemyIdRef = useRef(activeEnemyId);
  activeEnemyIdRef.current = activeEnemyId;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;
  const empCooldownRef = useRef(empCooldown);
  empCooldownRef.current = empCooldown;
  const levelRef = useRef(level);
  levelRef.current = level;
  const programmingLanguageRef = useRef(programmingLanguage);
  programmingLanguageRef.current = programmingLanguage;
  const bonusItemsRef = useRef(bonusItems);
  bonusItemsRef.current = bonusItems;

  /**
   * Complete a word: destroy enemy, score points, advance level if boss
   */
  const completeWord = useCallback(
    (enemyId: string, word: string, isBoss: boolean) => {
      const audioManager = getAudioManager();

      // Set health to 0 → triggers death animation in EnemyShip
      updateEnemy(enemyId, { health: 0 });

      // Calculate score: word.length × 10, bosses ×5
      const basePoints = word.length * 10;
      const points = isBoss ? basePoints * 5 : basePoints;
      incrementScore(points);

      // Update word counters + clear currentWord
      submitWord();
      setActiveEnemy(null);

      // Sound effects
      audioManager.playWordComplete();

      if (isBoss) {
        audioManager.playExplosion();
        incrementBossesDefeated();
        nextLevel();

        // Show trivia every 2 boss defeats (i.e. every 6 levels)
        // Check the current boss level (levelRef hasn't changed yet since nextLevel is async)
        const currentBossLevel = levelRef.current;
        if (currentBossLevel % 6 === 0) {
          const currentMode = modeRef.current as GameMode;
          const question = triviaDatabase.getQuestion(
            currentMode,
            programmingLanguageRef.current ?? null,
            currentBossLevel,
          );
          if (question) {
            // Small delay so level-up is visible before trivia
            setTimeout(() => showTrivia(question), 600);
          }
        }
      }
    },
    [updateEnemy, incrementScore, submitWord, setActiveEnemy, incrementBossesDefeated, nextLevel, showTrivia],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      try {
        const key = event.key;
        const currentMode = modeRef.current;
        const paused = isPausedRef.current;
        const gameOver = isGameOverRef.current;

        // ESC: pause / resume (not during trivia)
        if (key === 'Escape' && currentMode !== 'menu' && currentMode !== 'trivia' && !gameOver) {
          event.preventDefault();
          if (paused) { resumeGame(); } else { pauseGame(); }
          return;
        }

        // Gate: only handle input during active gameplay
        if (paused || gameOver || currentMode === 'menu' || currentMode === 'trivia') {
          return;
        }

        // Prevent default for typing keys and special keys
        if (key.length === 1 || key === 'Enter' || key === ' ' || key === 'Tab' || key === 'ArrowUp' || key === 'ArrowDown' || key === 'Backspace') {
          event.preventDefault();
        }

        const currentEnemies = enemiesRef.current;
        const currentActiveId = activeEnemyIdRef.current;

        // --- TAB: switch target ---
        if (key === 'Tab') {
          if (currentEnemies.length === 0) return;
          // Reset current enemy progress
          if (currentActiveId) {
            const cur = currentEnemies.find(e => e.id === currentActiveId);
            if (cur && cur.typedCharacters > 0) {
              updateEnemy(currentActiveId, { typedCharacters: 0 });
            }
          }
          const curIdx = currentEnemies.findIndex(e => e.id === currentActiveId);
          const nextIdx = curIdx >= 0 ? (curIdx + 1) % currentEnemies.length : 0;
          setActiveEnemy(currentEnemies[nextIdx].id);
          setCurrentWord('');
          return;
        }

        // --- ENTER: EMP ---
        if (key === 'Enter') {
          if (empCooldownRef.current === 0) {
            useEMP();
          }
          return;
        }

        // --- ArrowUp: cycle bonus items ---
        if (key === 'ArrowUp') {
          if (bonusItemsRef.current.length > 0) {
            selectNextBonus();
          }
          return;
        }

        // --- ArrowDown: use selected bonus ---
        if (key === 'ArrowDown') {
          const bonus = useSelectedBonus();
          if (bonus) {
            const audioManager = getAudioManager();
            if (bonus.type === BonusItemType.DEFENSIVE) {
              if (bonus.name.toLowerCase().includes('shield')) {
                addShield(bonus.effectValue);
              } else {
                heal(bonus.effectValue);
              }
            }
            // Offensive bonuses (EMP-like) handled via effectValue
            if (bonus.type === BonusItemType.OFFENSIVE) {
              // Bonus offensive items act as a free EMP
              useEMP();
            }
            audioManager.playWordComplete();
          }
          return;
        }

        // --- Typing characters ---
        if (key.length === 1) {
          // Look for the active enemy being typed
          const activeEnemy = currentActiveId
            ? currentEnemies.find(e => e.id === currentActiveId && e.typedCharacters > 0 && e.typedCharacters < e.word.length)
            : null;

          if (!activeEnemy) {
            // Start typing a new word — find an enemy whose word starts with this key
            const matchingEnemy = currentEnemies.find(e =>
              e.typedCharacters === 0 && e.word.charAt(0).toLowerCase() === key.toLowerCase()
            );

            if (matchingEnemy) {
              setActiveEnemy(matchingEnemy.id);
              updateEnemy(matchingEnemy.id, { typedCharacters: 1 });
              typeCharacter(key);

              // Single-character word → instant completion
              if (matchingEnemy.word.length === 1) {
                completeWord(matchingEnemy.id, matchingEnemy.word, matchingEnemy.isBoss);
              } else {
                getAudioManager().playTypeCorrect();
              }
            } else {
              // No matching enemy
              achievementsManager.onTypingMistake();
              getAudioManager().playTypeIncorrect();
            }
          } else {
            // Continue typing the active enemy's word
            const nextChar = activeEnemy.word.charAt(activeEnemy.typedCharacters);

            if (nextChar.toLowerCase() === key.toLowerCase()) {
              const newTypedCount = activeEnemy.typedCharacters + 1;
              updateEnemy(activeEnemy.id, { typedCharacters: newTypedCount });
              typeCharacter(key);

              // Word complete?
              if (newTypedCount === activeEnemy.word.length) {
                completeWord(activeEnemy.id, activeEnemy.word, activeEnemy.isBoss);
              } else {
                getAudioManager().playTypeCorrect();
              }
            } else {
              // Wrong character
              achievementsManager.onTypingMistake();
              getAudioManager().playTypeIncorrect();
            }
          }
        }
      } catch (err) {
        logError('Failed to handle keypress', err, 'TypingHandler');
      }
    },
    // All store callbacks are stable (useCallback with []) — safe to list
    [
      pauseGame,
      resumeGame,
      useEMP,
      setActiveEnemy,
      updateEnemy,
      typeCharacter,
      setCurrentWord,
      completeWord,
      selectNextBonus,
      useSelectedBonus,
      heal,
      addShield,
    ],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return null;
}
