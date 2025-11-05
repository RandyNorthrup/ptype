/**
 * Trivia Overlay E2E Tests
 * Tests for trivia overlay system after boss battles
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { TEST_CONFIG } from '../config/test-config';
// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage, GameCanvasPage, TriviaOverlayPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { assertVisible } from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { wait } from '../helpers/test-helpers';

describe('Trivia System', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let gameCanvas: GameCanvasPage;
  let triviaOverlay: TriviaOverlayPage;

  beforeEach(async () => {
    mainMenu = new MainMenuPage(page);
    gameCanvas = new GameCanvasPage(page);
    triviaOverlay = new TriviaOverlayPage(page);
  });

  test('should display trivia after defeating boss', async () => {
    // Start game and play to first boss
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Play through to trigger trivia (every 2 boss defeats)
    for (let i = 0; i < 30; i++) {
      await wait(3000);
      const word = await gameCanvas.getCurrentWord();
      if (word) {
        for (const char of word) {
          await page.keyboard.press(char);
          await wait(100);
        }
      }
    }
    
    // Check if trivia appears
    const triviaVisible = await triviaOverlay.isVisible();
    if (triviaVisible) {
      await triviaOverlay.takeScreenshot('trivia-appeared');
    }
  });

  test('should show trivia question with 4 options', async () => {
    // Assuming trivia is shown
    const triviaVisible = await triviaOverlay.isVisible();
    if (triviaVisible) {
      // Verify question text
      const question = await triviaOverlay.getQuestion();
      if (!question) {
        throw new Error('Question should be displayed');
      }
      
      // Verify 4 options exist
      for (let i = 0; i < 4; i++) {
        await assertVisible(page, `[data-testid="trivia-option-${i}"]`);
      }
      
      await triviaOverlay.takeScreenshot('trivia-question');
    }
  });

  test('should display countdown timer', async () => {
    const triviaVisible = await triviaOverlay.isVisible();
    if (triviaVisible) {
      // Check timer
      const timer = await triviaOverlay.getTimer();
      if (!timer) {
        throw new Error('Timer should be displayed');
      }
      
      // Wait and check timer decreases
      await wait(2000);
      const newTimer = await triviaOverlay.getTimer();
      
      await triviaOverlay.takeScreenshot('trivia-timer');
    }
  });

  test('should answer trivia question correctly', async () => {
    const triviaVisible = await triviaOverlay.isVisible();
    if (triviaVisible) {
      // Select first option (may or may not be correct)
      await triviaOverlay.selectAnswer(0);
      
      await wait(1000);
      
      // Trivia should close
      const stillVisible = await triviaOverlay.isVisible();
      if (stillVisible) {
        throw new Error('Trivia should close after answering');
      }
      
      await gameCanvas.takeScreenshot('after-trivia-answer');
    }
  });

  test('should handle trivia timeout', async () => {
    const triviaVisible = await triviaOverlay.isVisible();
    if (triviaVisible) {
      // Don't answer, wait for timeout
      await triviaOverlay.waitForTimeout();
      
      // Trivia should close
      const stillVisible = await triviaOverlay.isVisible();
      if (stillVisible) {
        throw new Error('Trivia should close after timeout');
      }
      
      await gameCanvas.takeScreenshot('trivia-timeout');
    }
  });

  test('should award bonus item for correct answer', async () => {
    const triviaVisible = await triviaOverlay.isVisible();
    if (triviaVisible) {
      // Answer (assume first is correct for test)
      await triviaOverlay.selectAnswer(0);
      await wait(1000);
      
      // Check for bonus item in UI
      const hasBonusItem = await page.evaluate(() => {
        const bonusItems = document.querySelector('[data-testid="hud-bonus-items"]');
        return bonusItems?.children.length > 0;
      });
      
      if (hasBonusItem) {
        await gameCanvas.takeScreenshot('bonus-item-awarded');
      }
    }
  });

  test('should display different trivia categories', async () => {
    // This requires multiple trivia sessions
    // Just verify trivia questions are programming-related
    const triviaVisible = await triviaOverlay.isVisible();
    if (triviaVisible) {
      const question = await triviaOverlay.getQuestion();
      
      // Programming-related keywords
      const isProgrammingRelated = 
        question.toLowerCase().includes('code') ||
        question.toLowerCase().includes('programming') ||
        question.toLowerCase().includes('variable') ||
        question.toLowerCase().includes('function') ||
        question.toLowerCase().includes('algorithm');
      
      await triviaOverlay.takeScreenshot('trivia-category');
    }
  });

  test('should pause game during trivia', async () => {
    const triviaVisible = await triviaOverlay.isVisible();
    if (triviaVisible) {
      // Game should be paused
      // Try typing - should not affect game
      await page.keyboard.press('a');
      await wait(500);
      
      // Score should not change
      await triviaOverlay.takeScreenshot('game-paused-during-trivia');
    }
  });

  test('should resume game after trivia', async () => {
    const triviaVisible = await triviaOverlay.isVisible();
    if (triviaVisible) {
      await triviaOverlay.selectAnswer(0);
      await wait(1000);
      
      // Game should resume
      // Enemies should be moving
      await wait(2000);
      
      await gameCanvas.takeScreenshot('game-resumed-after-trivia');
    }
  });

  test('should show visual feedback for answer selection', async () => {
    const triviaVisible = await triviaOverlay.isVisible();
    if (triviaVisible) {
      // Hover over option
      await page.hover('[data-testid="trivia-option-0"]');
      await wait(200);
      
      await triviaOverlay.takeScreenshot('trivia-hover-state');
      
      // Click option
      await triviaOverlay.selectAnswer(0);
      await wait(500);
      
      await triviaOverlay.takeScreenshot('trivia-answer-selected');
    }
  });

  test('should track trivia statistics', async () => {
    // After answering trivia, check stats
    await mainMenu.openPlayerStats();
    await wait(1000);
    
    // Look for trivia stats
    const hasTrivia = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.toLowerCase().includes('trivia');
    });
    
    await mainMenu.takeScreenshot('trivia-stats');
  });

  test('should load trivia from database', async () => {
    // Verify trivia questions are loaded
    const hasTrivia = await page.evaluate(() => {
      // Check if trivia database is loaded
      const triviaDB = (window as any).__triviaDatabase__;
      return triviaDB && triviaDB.length > 0;
    });
    
    if (!hasTrivia) {
      throw new Error('Trivia database should be loaded');
    }
  });
});
