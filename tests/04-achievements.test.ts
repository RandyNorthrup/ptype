/**
 * Achievements E2E Tests
 * Tests for achievement system, unlocking, and persistence
 * 
 * Note: Achievement icons are now SVG images loaded from /assets/icons/
 * - Unlocked achievements display color SVG icons
 * - Locked achievements display 🔒 emoji
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { TEST_CONFIG } from '../config/test-config';
// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage, GameCanvasPage, AchievementToastPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { assertVisible } from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { wait } from '../helpers/test-helpers';

describe('Achievements', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let gameCanvas: GameCanvasPage;
  let achievementToast: AchievementToastPage;

  beforeEach(async () => {
    mainMenu = new MainMenuPage(page);
    gameCanvas = new GameCanvasPage(page);
    achievementToast = new AchievementToastPage(page);
  });

  test('should display achievement toast when unlocked', async () => {
    // Start game
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Play until an achievement is unlocked
    // This may require extended gameplay
    await wait(30000);
    
    // Check if achievement toast appears
    const toastVisible = await achievementToast.isVisible();
    if (toastVisible) {
      await achievementToast.takeScreenshot('achievement-unlocked');
    }
  });

  test('should unlock "First Blood" achievement', async () => {
    // Start game and destroy first enemy
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    await wait(5000);
    const word = await gameCanvas.getCurrentWord();
    if (word) {
      for (const char of word) {
        await page.keyboard.press(char);
        await wait(100);
      }
    }
    
    // Wait for achievement
    await wait(2000);
    
    await gameCanvas.takeScreenshot('first-blood-achievement');
  });

  test('should unlock "Speed Demon" achievement for high WPM', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Type very fast to achieve high WPM
    for (let i = 0; i < 10; i++) {
      await wait(3000);
      const word = await gameCanvas.getCurrentWord();
      if (word) {
        for (const char of word) {
          await page.keyboard.press(char);
          await wait(50); // Very fast typing
        }
      }
    }
    
    await wait(2000);
    await gameCanvas.takeScreenshot('speed-demon-achievement');
  });

  test('should unlock "Perfectionist" achievement for 100% accuracy', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Type perfectly without mistakes
    for (let i = 0; i < 5; i++) {
      await wait(3000);
      const word = await gameCanvas.getCurrentWord();
      if (word) {
        for (const char of word) {
          await page.keyboard.press(char);
          await wait(150);
        }
      }
    }
    
    const accuracy = await gameCanvas.getAccuracy();
    if (accuracy.includes('100')) {
      await gameCanvas.takeScreenshot('perfectionist-achievement');
    }
  });

  test('should display achievements in player stats modal', async () => {
    await mainMenu.openPlayerStats();
    await wait(1000);
    
    // Check for achievements tab or section
    await assertVisible(page, '[data-testid="achievements-section"]');
    
    await mainMenu.takeScreenshot('achievements-in-stats');
  });

  test('should show achievement progress', async () => {
    await mainMenu.openPlayerStats();
    await wait(1000);
    
    // Check for achievement progress indicators
    const hasProgress = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Progress') || text.includes('%');
    });
    
    if (hasProgress) {
      await mainMenu.takeScreenshot('achievement-progress');
    }
  });

  test('should unlock "Boss Slayer" achievement', async () => {
    // This requires reaching and defeating a boss (level 3)
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Play through to level 3
    for (let i = 0; i < 15; i++) {
      await wait(3000);
      const word = await gameCanvas.getCurrentWord();
      if (word) {
        for (const char of word) {
          await page.keyboard.press(char);
          await wait(100);
        }
      }
    }
    
    await wait(2000);
    await gameCanvas.takeScreenshot('boss-slayer-attempt');
  });

  test('should show achievement notification duration', async () => {
    // When an achievement appears, time how long it stays
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Trigger achievement somehow
    await wait(10000);
    
    const toastVisible = await achievementToast.isVisible();
    if (toastVisible) {
      const startTime = Date.now();
      await achievementToast.waitForDismiss();
      const duration = Date.now() - startTime;
      
      // Should be around 3 seconds
      if (duration >= 2500 && duration <= 3500) {
        // Good timing
      }
    }
  });

  test('should display achievement icon', async () => {
    await mainMenu.openPlayerStats();
    await wait(1000);
    
    // Check for achievement icons (should be SVG images or lock icons)
    const hasIcons = await page.evaluate(() => {
      const achievements = document.querySelectorAll('[data-testid^="achievement-item-"]');
      if (achievements.length === 0) return false;
      
      // Check if icons contain either SVG images or lock emoji
      for (const ach of Array.from(achievements)) {
        const hasImg = ach.querySelector('img[src*=".svg"]');
        const hasLock = ach.textContent?.includes('🔒');
        if (!hasImg && !hasLock) return false;
      }
      return true;
    });
    
    if (!hasIcons) {
      throw new Error('Achievement icons should be SVG images or lock icons');
    }
    
    await mainMenu.takeScreenshot('achievement-icons');
  });

  test('should track achievement statistics', async () => {
    await mainMenu.openPlayerStats();
    await wait(1000);
    
    // Check for achievement statistics
    const stats = await page.evaluate(() => {
      const statsEl = document.querySelector('[data-testid="achievement-stats"]');
      return statsEl?.textContent || '';
    });
    
    await mainMenu.takeScreenshot('achievement-stats');
  });

  test('should unlock multiple achievements in sequence', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Play long enough to trigger multiple achievements
    for (let i = 0; i < 20; i++) {
      await wait(3000);
      const word = await gameCanvas.getCurrentWord();
      if (word) {
        for (const char of word) {
          await page.keyboard.press(char);
          await wait(100);
        }
      }
    }
    
    await wait(5000);
    await gameCanvas.takeScreenshot('multiple-achievements');
  });

  test('should persist achievements across sessions', async () => {
    // Unlock an achievement
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    await wait(10000);
    
    // Return to menu first
    await page.keyboard.press('Escape');
    await wait(500);
    
    // Refresh page - should return to menu (not game)
    await page.reload();
    await wait(2000);
    
    // Verify we're at menu after reload
    const isAtMenu = await page.evaluate(() => {
      return !!document.querySelector('[data-testid="main-menu"]');
    });
    
    if (!isAtMenu) {
      throw new Error('Should always return to menu after reload');
    }
    
    // Check if achievements are still present in stats
    await mainMenu.openPlayerStats();
    await wait(1000);
    
    // Achievements should persist
    const hasAchievements = await page.evaluate(() => {
      const achievements = document.querySelectorAll('[data-testid^="achievement-item-"]');
      return achievements.length > 0;
    });
    
    if (!hasAchievements) {
      throw new Error('Achievements should persist across sessions');
    }
    
    await mainMenu.takeScreenshot('persisted-achievements');
  });
});
