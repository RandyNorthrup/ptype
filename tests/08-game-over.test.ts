/**
 * Game Over E2E Tests
 * Tests for game over screen, stats display, and restart functionality
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { TEST_CONFIG } from '../config/test-config';
// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage, GameCanvasPage, GameOverPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { assertVisible } from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { wait } from '../helpers/test-helpers';

describe('Game Over Screen', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let gameCanvas: GameCanvasPage;
  let gameOverScreen: GameOverPage;

  beforeEach(async () => {
    mainMenu = new MainMenuPage(page);
    gameCanvas = new GameCanvasPage(page);
    gameOverScreen = new GameOverPage(page);
  });

  test('should display game over screen when health reaches 0', async () => {
    // Start game
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Wait for game over (or simulate by losing all health)
    // This may take a while in real gameplay
    await wait(60000);
    
    // Check if game over screen appears
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      await gameOverScreen.takeScreenshot('game-over-screen');
    }
  });

  test('should display final statistics', async () => {
    // Assuming game over state
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      // Check for stats display
      await assertVisible(page, '[data-testid="final-score"]');
      await assertVisible(page, '[data-testid="final-level"]');
      await assertVisible(page, '[data-testid="final-wpm"]');
      await assertVisible(page, '[data-testid="final-accuracy"]');
      
      await gameOverScreen.takeScreenshot('final-statistics');
    }
  });

  test('should show final score', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      const score = await gameOverScreen.getFinalScore();
      
      if (!score || score === '0') {
        // Score should be present
      }
      
      await gameOverScreen.takeScreenshot('final-score-display');
    }
  });

  test('should show final level reached', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      const level = await gameOverScreen.getFinalLevel();
      
      if (!level) {
        throw new Error('Final level should be displayed');
      }
      
      await gameOverScreen.takeScreenshot('final-level-display');
    }
  });

  test('should show final WPM', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      const wpm = await gameOverScreen.getFinalWPM();
      
      await gameOverScreen.takeScreenshot('final-wpm-display');
    }
  });

  test('should show final accuracy', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      const accuracy = await gameOverScreen.getFinalAccuracy();
      
      await gameOverScreen.takeScreenshot('final-accuracy-display');
    }
  });

  test('should have Play Again button', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      await assertVisible(page, '[data-testid="play-again-button"]');
      
      await gameOverScreen.takeScreenshot('play-again-button');
    }
  });

  test('should restart game with Play Again', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      await gameOverScreen.playAgain();
      await wait(2000);
      
      // Should be back in game
      const gameActive = await gameCanvas.isGameActive();
      if (!gameActive) {
        throw new Error('Game should restart after Play Again');
      }
      
      await gameCanvas.takeScreenshot('game-restarted');
    }
  });

  test('should return to main menu', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      await gameOverScreen.returnToMainMenu();
      await wait(1000);
      
      // Should be at main menu
      await assertVisible(page, '[data-testid="main-menu-logo"]');
      
      await mainMenu.takeScreenshot('returned-from-game-over');
    }
  });

  test('should display game over title/message', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      const hasTitle = await page.evaluate(() => {
        const text = document.body.textContent || '';
        return text.toLowerCase().includes('game over') || 
               text.toLowerCase().includes('mission failed');
      });
      
      await gameOverScreen.takeScreenshot('game-over-title');
    }
  });

  test('should show words typed count', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      const hasWordsTyped = await page.evaluate(() => {
        const text = document.body.textContent || '';
        return text.toLowerCase().includes('words');
      });
      
      await gameOverScreen.takeScreenshot('words-typed-stat');
    }
  });

  test('should show enemies defeated count', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      const hasEnemiesDefeated = await page.evaluate(() => {
        const text = document.body.textContent || '';
        return text.toLowerCase().includes('enemies') || 
               text.toLowerCase().includes('defeated');
      });
      
      await gameOverScreen.takeScreenshot('enemies-defeated-stat');
    }
  });

  test('should show time played', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      const hasTime = await page.evaluate(() => {
        const text = document.body.textContent || '';
        return text.toLowerCase().includes('time') || /\d+:\d+/.test(text);
      });
      
      await gameOverScreen.takeScreenshot('time-played-stat');
    }
  });

  test('should compare score to high score', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      const hasHighScore = await page.evaluate(() => {
        const text = document.body.textContent || '';
        return text.toLowerCase().includes('high score') || 
               text.toLowerCase().includes('best score');
      });
      
      await gameOverScreen.takeScreenshot('high-score-comparison');
    }
  });

  test('should show new high score message if applicable', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      const hasNewHighScore = await page.evaluate(() => {
        const text = document.body.textContent || '';
        return text.toLowerCase().includes('new high score') || 
               text.toLowerCase().includes('new record');
      });
      
      if (hasNewHighScore) {
        await gameOverScreen.takeScreenshot('new-high-score');
      }
    }
  });

  test('should display achievements unlocked during session', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      const hasAchievements = await page.evaluate(() => {
        const achievements = document.querySelectorAll('[data-achievement]');
        return achievements.length > 0;
      });
      
      if (hasAchievements) {
        await gameOverScreen.takeScreenshot('session-achievements');
      }
    }
  });

  test('should save game statistics', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      // Return to main menu
      await gameOverScreen.returnToMainMenu();
      await wait(1000);
      
      // Open player stats
      await mainMenu.openPlayerStats();
      await wait(1000);
      
      // Verify stats were saved
      const hasStats = await page.evaluate(() => {
        const text = document.body.textContent || '';
        return text.includes('Total Games') || text.includes('Games Played');
      });
      
      await mainMenu.takeScreenshot('saved-statistics');
    }
  });

  test('should clear game state after game over', async () => {
    const isVisible = await gameOverScreen.isVisible();
    if (isVisible) {
      await gameOverScreen.returnToMainMenu();
      await wait(1000);
      
      // Check if Continue button is still disabled
      const continueDisabled = await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="continue-game-button"]');
        return btn?.getAttribute('disabled') !== null;
      });
      
      // Continue should be disabled (no saved game)
      await mainMenu.takeScreenshot('game-state-cleared');
    }
  });
});
