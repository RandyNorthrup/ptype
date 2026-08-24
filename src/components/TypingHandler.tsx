/**
 * Typing Input Handler
 * Captures keyboard input and connects word matching to enemy destruction
 */
import { useEffect, useCallback, useRef } from "react";
import { useGameStore } from "../store/gameContext";
import { getAudioManager } from "../utils/audioManager";
import { triviaDatabase } from "../utils/triviaDatabase";
import { achievementsManager } from "../utils/achievementsManager";
import { BonusItemType, GameMode } from "../types";
import { error as logError } from "../utils/logger";

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
    triggerEMP,
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
    consumeSelectedBonus,
    heal,
    addShield,
    bonusItems,
  } = useGameStore();

  // One live-state ref keeps the global key listener stable during frame updates.
  const liveStateReference = useRef({
    enemies,
    activeEnemyId,
    mode,
    isPaused,
    isGameOver,
    empCooldown,
    level,
    programmingLanguage,
    bonusItems,
  });

  useEffect(() => {
    liveStateReference.current = {
      enemies,
      activeEnemyId,
      mode,
      isPaused,
      isGameOver,
      empCooldown,
      level,
      programmingLanguage,
      bonusItems,
    };
  }, [
    activeEnemyId,
    bonusItems,
    empCooldown,
    enemies,
    isGameOver,
    isPaused,
    level,
    mode,
    programmingLanguage,
  ]);

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
        const {
          level: currentBossLevel,
          mode,
          programmingLanguage,
        } = liveStateReference.current;
        if (currentBossLevel % 6 === 0) {
          const question = triviaDatabase.getQuestion(
            mode,
            programmingLanguage ?? null,
            currentBossLevel,
          );
          // Small delay so level-up is visible before trivia
          setTimeout(() => {
            showTrivia(question);
          }, 600);
        }
      }
    },
    [
      updateEnemy,
      incrementScore,
      submitWord,
      setActiveEnemy,
      incrementBossesDefeated,
      nextLevel,
      showTrivia,
    ],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      try {
        const key = event.key;
        const {
          mode: currentMode,
          isPaused: isCurrentlyPaused,
          isGameOver: isCurrentlyGameOver,
          enemies: currentEnemies,
          activeEnemyId: currentActiveId,
          empCooldown: currentEmpCooldown,
          bonusItems: currentBonusItems,
        } = liveStateReference.current;

        // ESC: pause / resume (not during trivia)
        if (
          !isCurrentlyGameOver &&
          key === "Escape" &&
          currentMode !== GameMode.MENU &&
          currentMode !== GameMode.TRIVIA
        ) {
          event.preventDefault();
          if (isCurrentlyPaused) {
            resumeGame();
          } else {
            pauseGame();
          }
          return;
        }

        // Gate: only handle input during active gameplay
        if (
          isCurrentlyPaused ||
          isCurrentlyGameOver ||
          currentMode === GameMode.MENU ||
          currentMode === GameMode.TRIVIA
        ) {
          return;
        }

        // Prevent default for typing keys and special keys
        if (
          key === "Enter" ||
          key === " " ||
          key === "Tab" ||
          key === "ArrowUp" ||
          key === "ArrowDown" ||
          key === "Backspace" ||
          key.length === 1
        ) {
          event.preventDefault();
        }

        // --- TAB: switch target ---
        if (key === "Tab") {
          if (currentEnemies.length === 0) return;
          // Reset current enemy progress
          if (currentActiveId) {
            const current = currentEnemies.find(
              (e) => e.id === currentActiveId,
            );
            if (current && current.typedCharacters > 0) {
              updateEnemy(currentActiveId, { typedCharacters: 0 });
            }
          }
          const currentIndex = currentEnemies.findIndex(
            (e) => e.id === currentActiveId,
          );
          const nextIndex =
            currentIndex === -1
              ? 0
              : (currentIndex + 1) % currentEnemies.length;
          const nextEnemy = currentEnemies[nextIndex];
          if (!nextEnemy) return;
          setActiveEnemy(nextEnemy.id);
          setCurrentWord("");
          return;
        }

        // --- ENTER: EMP ---
        if (key === "Enter") {
          if (currentEmpCooldown === 0) {
            triggerEMP();
          }
          return;
        }

        // --- ArrowUp: cycle bonus items ---
        if (key === "ArrowUp") {
          if (currentBonusItems.length > 0) {
            selectNextBonus();
          }
          return;
        }

        // --- ArrowDown: use selected bonus ---
        if (key === "ArrowDown") {
          const bonus = consumeSelectedBonus();
          if (bonus) {
            const audioManager = getAudioManager();
            if (bonus.type === BonusItemType.DEFENSIVE) {
              if (bonus.name.toLowerCase().includes("shield")) {
                addShield(bonus.effectValue);
              } else {
                heal(bonus.effectValue);
              }
            }
            // Offensive bonuses (EMP-like) handled via effectValue
            if (bonus.type === BonusItemType.OFFENSIVE) {
              // Bonus offensive items act as a free EMP
              triggerEMP();
            }
            audioManager.playWordComplete();
          }
          return;
        }

        // --- Typing characters ---
        if (key.length === 1) {
          // Look for the active enemy being typed
          const activeEnemy = currentActiveId
            ? currentEnemies.find(
                (e) =>
                  e.id === currentActiveId &&
                  e.typedCharacters > 0 &&
                  e.typedCharacters < e.word.length,
              )
            : null;

          if (activeEnemy) {
            // Continue typing the active enemy's word
            const nextChar = activeEnemy.word.charAt(
              activeEnemy.typedCharacters,
            );

            if (nextChar.toLowerCase() === key.toLowerCase()) {
              const newTypedCount = activeEnemy.typedCharacters + 1;
              updateEnemy(activeEnemy.id, { typedCharacters: newTypedCount });
              typeCharacter(key);

              // Word complete?
              if (newTypedCount === activeEnemy.word.length) {
                completeWord(
                  activeEnemy.id,
                  activeEnemy.word,
                  activeEnemy.isBoss,
                );
              } else {
                getAudioManager().playTypeCorrect();
              }
            } else {
              // Wrong character
              achievementsManager.onTypingMistake();
              getAudioManager().playTypeIncorrect();
            }
          } else {
            // Start typing a new word — find an enemy whose word starts with this key
            const matchingEnemy = currentEnemies.find(
              (e) =>
                e.typedCharacters === 0 &&
                e.word.charAt(0).toLowerCase() === key.toLowerCase(),
            );

            if (matchingEnemy) {
              setActiveEnemy(matchingEnemy.id);
              updateEnemy(matchingEnemy.id, { typedCharacters: 1 });
              typeCharacter(key);

              // Single-character word → instant completion
              if (matchingEnemy.word.length === 1) {
                completeWord(
                  matchingEnemy.id,
                  matchingEnemy.word,
                  matchingEnemy.isBoss,
                );
              } else {
                getAudioManager().playTypeCorrect();
              }
            } else {
              // No matching enemy
              achievementsManager.onTypingMistake();
              getAudioManager().playTypeIncorrect();
            }
          }
        }
      } catch (error) {
        logError("Failed to handle keypress", error, "TypingHandler");
      }
    },
    // All store callbacks are stable (useCallback with []) — safe to list
    [
      pauseGame,
      resumeGame,
      triggerEMP,
      setActiveEnemy,
      updateEnemy,
      typeCharacter,
      setCurrentWord,
      completeWord,
      selectNextBonus,
      consumeSelectedBonus,
      heal,
      addShield,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return null;
}
