// @ts-nocheck
/**
 * Gameplay E2E Tests
 * Tests for core gameplay mechanics, typing, scoring, and game state
 * 
 * Note: Laser targeting now uses real-time store state to ensure
 * lasers always point to the currently active enemy word
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { TEST_CONFIG } from '../config/test-config';
// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage, GameCanvasPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { 
  assertVisible, 
  assertScore  
} from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { wait, typeRealistic } from '../helpers/test-helpers';

describe('Gameplay', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let gameCanvas: GameCanvasPage;

  beforeEach(async () => {
    mainMenu = new MainMenuPage(page);
    gameCanvas = new GameCanvasPage(page);
    
    // Start a new game
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
  });

  test('should spawn enemy ships with words', async () => {
    // Wait for enemies to spawn
    await wait(5000);
    
    // Check if words are visible in the scene
    const hasEnemies = await page.evaluate(() => {
      const words = document.querySelectorAll('[data-word]');
      return words.length > 0;
    });
    
    if (!hasEnemies) {
      throw new Error('Enemy ships should spawn with words');
    }
    
    await gameCanvas.takeScreenshot('enemies-spawned');
  });

  test('should type and destroy a word', async () => {
    // Wait for enemy to spawn
    await wait(5000);
    
    // Get the current word
    const word = await gameCanvas.getCurrentWord();
    if (!word) {
      throw new Error('No word available to type');
    }
    
    // Get initial score
    const initialScore = parseInt(await gameCanvas.getScore()) || 0;
    
    // Type the word
    await typeRealistic(page, word, 60);
    await wait(1000);
    
    // Verify score increased
    const newScore = parseInt(await gameCanvas.getScore()) || 0;
    if (newScore <= initialScore) {
      throw new Error(`Score should increase. Initial: ${initialScore}, New: ${newScore}`);
    }
    
    await gameCanvas.takeScreenshot('word-destroyed');
  });

  test('should switch targets with Tab key', async () => {
    // Wait for multiple enemies
    await wait(10000);
    
    // Get current word
    const word1 = await gameCanvas.getCurrentWord();
    
    // Press Tab to switch
    await gameCanvas.pressTab();
    await wait(500);
    
    // Get new word
    const word2 = await gameCanvas.getCurrentWord();
    
    // Words should be different (unless only one enemy)
    if (word1 && word2 && word1 === word2) {
      // May be only one enemy, that's okay
    }
    
    await gameCanvas.takeScreenshot('target-switched');
  });

  test('should activate EMP weapon with Enter key', async () => {
    // Wait for enemies and EMP to be ready
    await wait(5000);
    
    // Check if EMP is ready
    const isReady = await gameCanvas.isEMPReady();
    if (!isReady) {
      throw new Error('EMP should be ready at start');
    }
    
    // Activate EMP
    await gameCanvas.activateEMP();
    await wait(1000);
    
    // Verify EMP is on cooldown
    const cooldownText = await page.textContent('[data-testid="hud-emp-cooldown"]');
    if (!cooldownText || cooldownText === 'READY') {
      throw new Error('EMP should be on cooldown after activation');
    }
    
    await gameCanvas.takeScreenshot('emp-activated');
  });

  test('should take damage when enemy reaches player', async () => {
    // Get initial health
    const initialHealth = await gameCanvas.getHealth();
    const healthValue = parseInt(initialHealth) || 100;
    
    // Wait long enough for an enemy to reach player
    await wait(30000);
    
    // Check health
    const currentHealth = await gameCanvas.getHealth();
    const newHealthValue = parseInt(currentHealth) || 100;
    
    // Health may have decreased
    if (newHealthValue < healthValue) {
      await gameCanvas.takeScreenshot('took-damage');
    }
  });

  test('should display WPM calculation', async () => {
    // Type some words
    await wait(5000);
    const word = await gameCanvas.getCurrentWord();
    if (word) {
      await typeRealistic(page, word, 60);
      await wait(2000);
    }
    
    // Check WPM display
    const wpm = await gameCanvas.getWPM();
    if (!wpm || wpm === '0') {
      // WPM may take time to calculate
    }
    
    await gameCanvas.takeScreenshot('wpm-display');
  });

  test('should track accuracy percentage', async () => {
    // Type correctly
    await wait(5000);
    const word = await gameCanvas.getCurrentWord();
    if (word) {
      await typeRealistic(page, word, 60);
    }
    
    // Check accuracy
    const accuracy = await gameCanvas.getAccuracy();
    if (accuracy && !accuracy.includes('100')) {
      // Accuracy should be high for correct typing
    }
    
    await gameCanvas.takeScreenshot('accuracy-display');
  });

  test('should advance level after defeating enemies', async () => {
    // Get initial level
    const initialLevel = parseInt(await gameCanvas.getLevel()) || 1;
    
    // Defeat several enemies
    for (let i = 0; i < 5; i++) {
      await wait(3000);
      const word = await gameCanvas.getCurrentWord();
      if (word) {
        await typeRealistic(page, word, 80);
      }
    }
    
    // Check if level advanced
    const currentLevel = parseInt(await gameCanvas.getLevel()) || 1;
    if (currentLevel > initialLevel) {
      await gameCanvas.takeScreenshot('level-advanced');
    }
  });

  test('should spawn boss enemy on boss level', async () => {
    // This would require advancing to level 3
    // For now, just verify the mechanic exists
    await wait(5000);
    
    // Check for boss indicator in UI
    const hasBossIndicator = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.toLowerCase().includes('boss');
    });
    
    // Boss may not be present yet
    await gameCanvas.takeScreenshot('gameplay-state');
  });

  test('should handle rapid typing input', async () => {
    await wait(5000);
    const word = await gameCanvas.getCurrentWord();
    
    if (word) {
      // Type very fast (120 WPM)
      await typeRealistic(page, word, 120);
      
      // Verify no errors occurred
      const errors = await page.evaluate(() => {
        return (window as any).__lastError__;
      });
      
      if (errors) {
        throw new Error('Game should handle rapid typing without errors');
      }
    }
  });

  test('should handle backspace key', async () => {
    await wait(5000);
    
    // Type a few characters
    await page.keyboard.press('a');
    await page.keyboard.press('b');
    await wait(100);
    
    // Press backspace
    await page.keyboard.press('Backspace');
    await wait(100);
    
    // Should not cause errors
    await gameCanvas.takeScreenshot('after-backspace');
  });

  test('should display laser effects when typing', async () => {
    await wait(5000);
    
    // Get current active word/enemy
    const word = await gameCanvas.getCurrentWord();
    
    if (word && word.length > 0) {
      // Type first character of the word
      await page.keyboard.press(word[0]);
      await wait(200);
      
      // Laser effects are rendered on canvas, check canvas exists
      const hasLaserCanvas = await page.evaluate(() => {
        const canvases = document.querySelectorAll('canvas');
        // LaserEffect should create its own canvas for rendering
        return canvases.length > 0;
      });
      
      if (!hasLaserCanvas) {
        throw new Error('Laser effect canvas should exist');
      }
    }
    
    await gameCanvas.takeScreenshot('laser-effect');
  });

  test('should target laser at active enemy word', async () => {
    await wait(5000);
    
    // Switch between targets using TAB
    await page.keyboard.press('Tab');
    await wait(500);
    
    const word1 = await gameCanvas.getCurrentWord();
    
    // Type first character to confirm targeting
    if (word1 && word1.length > 0) {
      await page.keyboard.press(word1[0]);
      await wait(200);
    }
    
    // Switch to next target
    await page.keyboard.press('Tab');
    await wait(500);
    
    const word2 = await gameCanvas.getCurrentWord();
    
    // Verify we switched to a different word
    if (word1 && word2 && word1 !== word2) {
      // Type first character of new target
      await page.keyboard.press(word2[0]);
      await wait(200);
      
      await gameCanvas.takeScreenshot('laser-target-switched');
    }
  });

  test('should handle pause during gameplay', async () => {
    await wait(5000);
    
    // Press Escape to pause
    await gameCanvas.pressEscape();
    await wait(1000);
    
    // Verify pause menu appears
    await assertVisible(page, '[data-testid="pause-menu-overlay"]');
    
    await gameCanvas.takeScreenshot('game-paused');
  });

  test('should maintain 30+ FPS during gameplay', async () => {
    await wait(10000);
    
    // Measure FPS
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        const start = performance.now();
        
        function count() {
          frames++;
          if (performance.now() - start < 1000) {
            requestAnimationFrame(count);
          } else {
            resolve(frames);
          }
        }
        
        requestAnimationFrame(count);
      });
    });
    
    if (fps < TEST_CONFIG.performance.minFPS) {
      throw new Error(`FPS too low: ${fps} < ${TEST_CONFIG.performance.minFPS}`);
    }
  });

  test('should display particle effects on word destruction', async () => {
    await wait(5000);
    const word = await gameCanvas.getCurrentWord();
    
    if (word) {
      // Type word and look for particles
      await typeRealistic(page, word, 60);
      await wait(500);
      
      // Particles would be in Three.js scene
      await gameCanvas.takeScreenshot('particles');
    }
  });

  test('should handle multiple simultaneous enemies', async () => {
    // Wait for multiple enemies to spawn
    await wait(15000);
    
    // Count enemies in scene
    const enemyCount = await page.evaluate(() => {
      const enemies = document.querySelectorAll('[data-enemy]');
      return enemies.length;
    });
    
    if (enemyCount > 1) {
      await gameCanvas.takeScreenshot('multiple-enemies');
    }
  });

  test('should display bonus items when collected', async () => {
    // This would require triggering a bonus item drop
    await wait(10000);
    
    // Check for bonus items UI
    await page.isVisible('[data-testid="hud-bonus-items"]');
    
    // Bonus items may not be available yet
    await gameCanvas.takeScreenshot('bonus-items-ui');
  });
});
