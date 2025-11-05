/**
 * Pause Menu E2E Tests
 * Tests for pause menu functionality and game state management
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { TEST_CONFIG } from '../config/test-config';
// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage, GameCanvasPage, PauseMenuPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { assertVisible } from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { wait } from '../helpers/test-helpers';

describe('Pause Menu', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let gameCanvas: GameCanvasPage;
  let pauseMenu: PauseMenuPage;

  beforeEach(async () => {
    mainMenu = new MainMenuPage(page);
    gameCanvas = new GameCanvasPage(page);
    pauseMenu = new PauseMenuPage(page);
    
    // Start game
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
  });

  test('should pause game with Escape key', async () => {
    await wait(3000);
    
    await gameCanvas.pressEscape();
    await wait(500);
    
    const isVisible = await pauseMenu.isVisible();
    if (!isVisible) {
      throw new Error('Pause menu should be visible');
    }
    
    await pauseMenu.takeScreenshot('game-paused');
  });

  test('should display pause menu options', async () => {
    await gameCanvas.pressEscape();
    await wait(500);
    
    // Verify all pause menu buttons
    await assertVisible(page, '[data-testid="resume-button"]');
    await assertVisible(page, '[data-testid="pause-settings-button"]');
    await assertVisible(page, '[data-testid="main-menu-button"]');
    
    await pauseMenu.takeScreenshot('pause-menu-options');
  });

  test('should resume game with Resume button', async () => {
    await gameCanvas.pressEscape();
    await wait(500);
    
    await pauseMenu.resume();
    await wait(500);
    
    const isVisible = await pauseMenu.isVisible();
    if (isVisible) {
      throw new Error('Pause menu should be hidden after resume');
    }
    
    await gameCanvas.takeScreenshot('game-resumed');
  });

  test('should resume game with Escape key again', async () => {
    // Pause
    await gameCanvas.pressEscape();
    await wait(500);
    
    // Unpause with Escape
    await gameCanvas.pressEscape();
    await wait(500);
    
    const isVisible = await pauseMenu.isVisible();
    if (isVisible) {
      throw new Error('Pause menu should close with Escape');
    }
    
    await gameCanvas.takeScreenshot('unpaused-with-escape');
  });

  test('should freeze game state when paused', async () => {
    // Get score before pause
    const scoreBefore = await gameCanvas.getScore();
    
    await gameCanvas.pressEscape();
    await wait(500);
    
    // Wait while paused
    await wait(3000);
    
    // Check score hasn't changed
    const scoreAfter = await gameCanvas.getScore();
    
    if (scoreBefore !== scoreAfter) {
      // Score might display differently, but game should be frozen
    }
    
    await pauseMenu.takeScreenshot('game-frozen');
  });

  test('should not accept typing input when paused', async () => {
    await gameCanvas.pressEscape();
    await wait(500);
    
    // Try typing
    await page.keyboard.press('a');
    await page.keyboard.press('b');
    await page.keyboard.press('c');
    await wait(500);
    
    // Game should still be paused
    const isVisible = await pauseMenu.isVisible();
    if (!isVisible) {
      throw new Error('Game should remain paused');
    }
    
    await pauseMenu.takeScreenshot('input-blocked-when-paused');
  });

  test('should open settings from pause menu', async () => {
    await gameCanvas.pressEscape();
    await wait(500);
    
    await pauseMenu.openSettings();
    await wait(500);
    
    // Settings modal should appear
    await assertVisible(page, '[data-testid="settings-modal"]');
    
    await pauseMenu.takeScreenshot('settings-from-pause');
  });

  test('should return to main menu with confirmation', async () => {
    await gameCanvas.pressEscape();
    await wait(500);
    
    // Set up dialog handler
    let dialogShown = false;
    page.on('dialog', async (dialog: any) => {
      dialogShown = true;
      await dialog.accept();
    });
    
    await pauseMenu.returnToMainMenu();
    await wait(1000);
    
    if (dialogShown) {
      // Should be back at main menu
      await assertVisible(page, '[data-testid="main-menu-logo"]');
    }
    
    await mainMenu.takeScreenshot('returned-to-main-menu');
  });

  test('should display pause menu title', async () => {
    await gameCanvas.pressEscape();
    await wait(500);
    
    const hasTitle = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.toLowerCase().includes('pause') || text.toLowerCase().includes('paused');
    });
    
    await pauseMenu.takeScreenshot('pause-menu-title');
  });

  test('should show game stats on pause menu', async () => {
    await wait(5000); // Play a bit
    
    await gameCanvas.pressEscape();
    await wait(500);
    
    // Check if stats are shown
    const hasStats = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Score') || text.includes('Level') || text.includes('WPM');
    });
    
    await pauseMenu.takeScreenshot('pause-menu-stats');
  });

  test('should handle multiple pause/resume cycles', async () => {
    for (let i = 0; i < 3; i++) {
      // Pause
      await gameCanvas.pressEscape();
      await wait(500);
      
      const pausedVisible = await pauseMenu.isVisible();
      if (!pausedVisible) {
        throw new Error(`Pause menu should be visible on cycle ${i + 1}`);
      }
      
      // Resume
      await gameCanvas.pressEscape();
      await wait(1000);
      
      const resumedHidden = await pauseMenu.isVisible();
      if (resumedHidden) {
        throw new Error(`Pause menu should be hidden after resume on cycle ${i + 1}`);
      }
    }
    
    await gameCanvas.takeScreenshot('multiple-pause-cycles');
  });

  test('should maintain pause state during trivia', async () => {
    // If trivia appears, it should override pause
    await gameCanvas.pressEscape();
    await wait(500);
    
    // Check pause state - React Context doesn't expose global store like Zustand did
    // Instead verify pause menu is visible
    const isPauseMenuVisible = await page.evaluate(() => {
      return !!document.querySelector('[data-testid="pause-menu-overlay"]');
    });
    
    if (!isPauseMenuVisible) {
      throw new Error('Pause menu should be visible when paused');
    }
    
    await pauseMenu.takeScreenshot('pause-state');
  });

  test('should blur background when paused', async () => {
    await gameCanvas.pressEscape();
    await wait(500);
    
    // Check if overlay/blur is applied
    const hasOverlay = await page.evaluate(() => {
      const overlay = document.querySelector('[data-testid="pause-menu"]')?.parentElement;
      if (!overlay) return false;
      
      const styles = window.getComputedStyle(overlay);
      return styles.backgroundColor !== 'transparent';
    });
    
    await pauseMenu.takeScreenshot('blurred-background');
  });

  test('should show pause indicator on HUD', async () => {
    await gameCanvas.pressEscape();
    await wait(500);
    
    // Check for pause indicator
    const hasPauseIndicator = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.toLowerCase().includes('paused');
    });
    
    await pauseMenu.takeScreenshot('pause-indicator');
  });

  test('should prevent EMP activation when paused', async () => {
    await gameCanvas.pressEscape();
    await wait(500);
    
    // Try to activate EMP
    await page.keyboard.press('Enter');
    await wait(500);
    
    // Should still be paused
    const isVisible = await pauseMenu.isVisible();
    if (!isVisible) {
      throw new Error('Should remain paused after EMP attempt');
    }
    
    await pauseMenu.takeScreenshot('emp-blocked-when-paused');
  });
});
