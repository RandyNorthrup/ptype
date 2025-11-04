/**
 * Typing Input Handler
 * Captures keyboard input and handles word matching logic
 */
import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { debug, error as logError } from '../utils/logger';

export function TypingHandler() {
  const {
    currentWord,
    enemies,
    typeCharacter,
    deleteCharacter,
    submitWord,
    isPaused,
    isGameOver,
    mode,
    pauseGame,
    resumeGame,
    useEMP,
    empCooldown,
    activeEnemyId,
  } = useGameStore();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      try {
        const key = event.key;

        // Handle ESC key for pause/resume (only in game, not during trivia)
        if (key === 'Escape' && mode !== 'menu' && mode !== 'profile_select' && mode !== 'trivia' && !isGameOver) {
          event.preventDefault();
          if (isPaused) {
            resumeGame();
          } else {
            pauseGame();
          }
          return;
        }

      // Don't handle input if paused, trivia, game over, or in menu
      if (isPaused || isGameOver || mode === 'menu' || mode === 'profile_select' || mode === 'trivia') {
        return;
      }

      // Prevent default for typing keys to avoid scrolling, etc.
      if (key.length === 1 || key === 'Backspace' || key === 'Enter' || key === ' ') {
        event.preventDefault();
      }

      // Handle Tab - switch to next enemy
      if (key === 'Tab') {
        event.preventDefault();
        // Find current active enemy
        const currentIndex = enemies.findIndex(e => e.id === activeEnemyId);
        if (currentIndex >= 0 && enemies.length > 1) {
          // Switch to next enemy (wrap around)
          const nextIndex = (currentIndex + 1) % enemies.length;
          const nextEnemy = enemies[nextIndex];
          // Start typing the next enemy's word from beginning
          typeCharacter(nextEnemy.word.charAt(0));
        }
        return;
      }

      // Handle backspace - delete character
      if (key === 'Backspace') {
        deleteCharacter();
        return;
      }

      // Handle Enter - EMP weapon activation
      if (key === 'Enter') {
        if (empCooldown === 0) {
          useEMP();
        }
        return;
      }

      // Handle alphanumeric and symbol characters for typing words
      if (key.length === 1) {
        // Find the currently active enemy (one being typed)
        const activeEnemy = enemies.find(e => e.typedCharacters > 0 && e.typedCharacters < e.word.length);

        // If no active enemy, try to start typing a new word
        if (!activeEnemy) {
          const matchingEnemy = enemies.find(e =>
            e.word.toLowerCase().charAt(0) === key.toLowerCase() && e.typedCharacters === 0
          );
          
          if (matchingEnemy) {
            // Start typing this enemy's word
            typeCharacter(key);
            debug('Started typing word', { word: matchingEnemy.word, key }, 'TypingHandler');
            
            // Auto-complete if word is just one character
            if (matchingEnemy.word.length === 1) {
              setTimeout(() => submitWord(), 50);
            }
          } else {
            // Wrong key - no matching enemy found
            debug('No enemy starts with key', { key }, 'TypingHandler');
            // TODO: Add wrong char flash visual feedback
          }
        } else {
          // Continue typing the active word
          const nextChar = activeEnemy.word.charAt(activeEnemy.typedCharacters);
          
          if (nextChar.toLowerCase() === key.toLowerCase()) {
            // Correct character!
            typeCharacter(key);
            debug('Correct character typed', { key, word: activeEnemy.word }, 'TypingHandler');
            
            // Check if word is complete
            if (activeEnemy.typedCharacters + 1 === activeEnemy.word.length) {
              setTimeout(() => submitWord(), 50);
            }
          } else {
            // Wrong character for this word
            debug('Wrong character typed', { key, expected: nextChar, word: activeEnemy.word }, 'TypingHandler');
            // TODO: Add wrong char flash visual feedback, increment mistakes counter
          }
        }
      }
      } catch (err) {
        logError('Failed to handle keypress', err, 'TypingHandler');
      }
    },
    [
      currentWord,
      enemies,
      typeCharacter,
      deleteCharacter,
      submitWord,
      isPaused,
      isGameOver,
      mode,
      pauseGame,
      resumeGame,
      useEMP,
      empCooldown,
      activeEnemyId,
    ]
  );

  useEffect(() => {
    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // This component doesn't render anything
  return null;
}
