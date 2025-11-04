/**
 * Integration E2E Tests
 * Full user journey integration tests covering complete workflows
 * 
 * Note: Game state persistence behavior:
 * - Game ALWAYS starts at menu after page reload (no auto-resume)
 * - Only high scores, achievements, and profile persist
 * - Active game state (mode, level, score, enemies) is NEVER persisted
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { TEST_CONFIG } from '../config/test-config';
// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage, GameCanvasPage, PauseMenuPage, GameOverPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { assertVisible, assertNoConsoleErrors } from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { wait, getFPS, getMemoryUsage } from '../helpers/test-helpers';

describe('Integration Tests - Full User Journeys', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let gameCanvas: GameCanvasPage;
  let pauseMenu: PauseMenuPage;
  let gameOverScreen: GameOverPage;

  beforeEach(async () => {
    mainMenu = new MainMenuPage(page);
    gameCanvas = new GameCanvasPage(page);
    pauseMenu = new PauseMenuPage(page);
    gameOverScreen = new GameOverPage(page);
  });

  test('Complete gameplay journey: Menu → Game → Pause → Resume → Continue', async () => {
    // 1. Start at main menu
    await assertVisible(page, '[data-testid="main-menu-logo"]');
    await mainMenu.takeScreenshot('journey-01-menu');
    
    // 2. Select mode
    await mainMenu.selectMode('Normal');
    await wait(500);
    
    // 3. Start game
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    await mainMenu.takeScreenshot('journey-02-game-start');
    
    // 4. Play for a bit
    await wait(10000);
    for (let i = 0; i < 3; i++) {
      await wait(2000);
      const word = await gameCanvas.getCurrentWord();
      if (word) {
        for (const char of word) {
          await page.keyboard.press(char);
          await wait(100);
        }
      }
    }
    await mainMenu.takeScreenshot('journey-03-gameplay');
    
    // 5. Pause game
    await gameCanvas.pressEscape();
    await wait(500);
    await assertVisible(page, '[data-testid="pause-menu"]');
    await mainMenu.takeScreenshot('journey-04-paused');
    
    // 6. Resume game
    await pauseMenu.resume();
    await wait(500);
    await mainMenu.takeScreenshot('journey-05-resumed');
    
    // 7. Continue playing
    await wait(5000);
    await mainMenu.takeScreenshot('journey-06-continued');
    
    console.log('✅ Complete gameplay journey successful');
  });

  test('Settings workflow: Open → Adjust → Save → Verify', async () => {
    // 1. Open settings
    await mainMenu.openSettings();
    await wait(500);
    await mainMenu.takeScreenshot('settings-01-opened');
    
    // 2. Adjust music volume
    const musicSlider = '[data-testid="music-volume-slider"]';
    await page.fill(musicSlider, '70');
    await wait(500);
    await mainMenu.takeScreenshot('settings-02-music-adjusted');
    
    // 3. Adjust sound volume
    const soundSlider = '[data-testid="sound-volume-slider"]';
    await page.fill(soundSlider, '60');
    await wait(500);
    await mainMenu.takeScreenshot('settings-03-sound-adjusted');
    
    // 4. Close settings
    await page.keyboard.press('Escape');
    await wait(500);
    
    // 5. Reopen to verify
    await mainMenu.openSettings();
    await wait(500);
    
    const musicVolume = await page.evaluate(() => {
      const slider = document.querySelector('[data-testid="music-volume-slider"]') as HTMLInputElement;
      return slider?.value;
    });
    
    if (musicVolume !== '70') {
      throw new Error('Settings should persist');
    }
    
    await mainMenu.takeScreenshot('settings-04-verified');
    
    console.log('✅ Settings workflow successful');
  });

  test('Achievement unlock flow: Play → Achieve → Toast → Stats', async () => {
    // 1. Start game
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // 2. Play to unlock achievement
    for (let i = 0; i < 5; i++) {
      await wait(3000);
      const word = await gameCanvas.getCurrentWord();
      if (word) {
        for (const char of word) {
          await page.keyboard.press(char);
          await wait(80);
        }
      }
    }
    
    await wait(2000);
    await mainMenu.takeScreenshot('achievement-01-gameplay');
    
    // 3. Check for achievement toast
    const toastVisible = await page.evaluate(() => {
      return !!document.querySelector('[data-testid="achievement-toast"]');
    });
    
    if (toastVisible) {
      await mainMenu.takeScreenshot('achievement-02-toast');
    }
    
    // 4. Return to menu
    await page.keyboard.press('Escape');
    await wait(500);
    await page.click('[data-testid="main-menu-button"]');
    await wait(1000);
    
    // 5. Check stats
    await mainMenu.openPlayerStats();
    await wait(1000);
    await mainMenu.takeScreenshot('achievement-03-stats');
    
    console.log('✅ Achievement flow successful');
  });

  test('Mode switching workflow: Normal → Python → JavaScript', async () => {
    const modes = ['Normal', 'Python', 'JavaScript'];
    
    for (const mode of modes) {
      // 1. Select mode
      await mainMenu.selectMode(mode);
      await wait(500);
      
      // 2. Start game
      await mainMenu.clickNewGame();
      await gameCanvas.waitForGameStart();
      await wait(3000);
      
      await mainMenu.takeScreenshot(`mode-switch-${mode.toLowerCase()}`);
      
      // 3. Play a bit
      await wait(5000);
      
      // 4. Return to menu
      await page.keyboard.press('Escape');
      await wait(500);
      await page.click('[data-testid="main-menu-button"]');
      await wait(1000);
    }
    
    console.log('✅ Mode switching workflow successful');
  });

  test('Performance during extended session', async () => {
    const metrics: any[] = [];
    
    // Start game
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Measure over time
    for (let i = 0; i < 5; i++) {
      await wait(10000);
      
      const fps = await getFPS(page, 1000);
      const memory = await getMemoryUsage(page);
      
      metrics.push({
        time: i * 10,
        fps,
        memory: (memory / 1024 / 1024).toFixed(2),
      });
      
      // Play a bit
      const word = await gameCanvas.getCurrentWord();
      if (word) {
        for (const char of word) {
          await page.keyboard.press(char);
          await wait(100);
        }
      }
    }
    
    console.log('Performance metrics:', metrics);
    
    // Check for degradation
    const firstFPS = metrics[0].fps;
    const lastFPS = metrics[metrics.length - 1].fps;
    const fpsDrop = firstFPS - lastFPS;
    
    if (fpsDrop > 10) {
      throw new Error(`FPS degraded during session: ${fpsDrop} FPS drop`);
    }
    
    console.log('✅ Performance stable during extended session');
  });

  test('Error recovery: Lose game → Restart → Play again', async () => {
    // 1. Start game
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    await mainMenu.takeScreenshot('error-recovery-01-start');
    
    // 2. Wait for game over (or simulate)
    // In real scenario, player would lose all health
    await wait(60000); // Wait up to 1 minute
    
    // 3. Check for game over
    const gameOver = await gameOverScreen.isVisible();
    
    if (gameOver) {
      await mainMenu.takeScreenshot('error-recovery-02-game-over');
      
      // 4. Play again
      await gameOverScreen.playAgain();
      await wait(2000);
      
      // 5. Verify game restarted
      const gameActive = await gameCanvas.isGameActive();
      if (!gameActive) {
        throw new Error('Game should restart');
      }
      
      await mainMenu.takeScreenshot('error-recovery-03-restarted');
      
      console.log('✅ Error recovery successful');
    }
  });

  test('Multi-modal interaction: Game + Settings + Pause', async () => {
    // 1. Start game
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    await wait(5000);
    
    // 2. Pause
    await gameCanvas.pressEscape();
    await wait(500);
    await assertVisible(page, '[data-testid="pause-menu"]');
    
    // 3. Open settings from pause
    await pauseMenu.openSettings();
    await wait(500);
    await assertVisible(page, '[data-testid="settings-modal"]');
    await mainMenu.takeScreenshot('multi-modal-01-settings-from-pause');
    
    // 4. Close settings
    await page.keyboard.press('Escape');
    await wait(500);
    
    // 5. Still paused
    await assertVisible(page, '[data-testid="pause-menu"]');
    
    // 6. Resume
    await pauseMenu.resume();
    await wait(500);
    await mainMenu.takeScreenshot('multi-modal-02-resumed');
    
    console.log('✅ Multi-modal interaction successful');
  });

  test('Data persistence across reload', async () => {
    // 1. Play game to get a high score
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    await wait(10000);
    const score = await gameCanvas.getScore();
    
    // 2. Return to menu (game state should NOT persist)
    await page.keyboard.press('Escape');
    await wait(500);
    await page.click('[data-testid="main-menu-button"]');
    await wait(1000);
    
    // 3. Reload page - should ALWAYS return to menu, never in-game
    await page.reload();
    await wait(3000);
    
    // 4. Verify we're at the menu (not in game/trivia)
    const isAtMenu = await page.evaluate(() => {
      const mainMenu = document.querySelector('[data-testid="main-menu"]');
      const continueButton = document.querySelector('[data-testid="continue-game-button"]');
      return !!mainMenu && !!continueButton;
    });
    
    if (!isAtMenu) {
      throw new Error('Should always return to menu after reload, not resume game');
    }
    
    // 5. Check player stats (high scores, achievements should persist)
    await mainMenu.openPlayerStats();
    await wait(1000);
    
    // High scores and achievements should have persisted
    const hasPersistentData = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('HIGH SCORES') || text.includes('ACHIEVEMENTS');
    });
    
    if (!hasPersistentData) {
      throw new Error('High scores and achievements should persist after reload');
    }
    
    await mainMenu.takeScreenshot('persistence-after-reload');
    
    console.log('✅ Data persistence successful - game state cleared, stats preserved');
  });

  test('Full accessibility workflow with keyboard only', async () => {
    // Navigate entire app using only keyboard
    
    // 1. Tab to settings
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await wait(200);
    }
    
    // 2. Open with Enter
    await page.keyboard.press('Enter');
    await wait(500);
    
    // 3. Close with Escape
    await page.keyboard.press('Escape');
    await wait(500);
    
    // 4. Tab to mode selector
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      await wait(200);
    }
    
    // 5. Open with Enter
    await page.keyboard.press('Enter');
    await wait(500);
    
    // 6. Arrow down to select mode
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await wait(200);
    await page.keyboard.press('Enter');
    await wait(500);
    
    await mainMenu.takeScreenshot('keyboard-only-navigation');
    
    console.log('✅ Keyboard-only workflow successful');
  });

  test('Stress test: Rapid interactions', async () => {
    // Rapid clicks and interactions
    for (let i = 0; i < 10; i++) {
      await mainMenu.openSettings();
      await wait(100);
      await page.keyboard.press('Escape');
      await wait(100);
    }
    
    // Should not crash or error
    const errors = await page.evaluate(() => {
      return (window as any).__errors__ || [];
    });
    
    await assertNoConsoleErrors(errors);
    
    await mainMenu.takeScreenshot('stress-test-complete');
    
    console.log('✅ Stress test passed');
  });

  test('Complete user flow with screenshots at every step', async () => {
    const steps = [];
    
    // Step 1: View main menu
    await assertVisible(page, '[data-testid="main-menu-logo"]');
    await mainMenu.takeScreenshot('flow-step-01-menu');
    steps.push('Main menu loaded');
    
    // Step 2: Open about
    await mainMenu.openAbout();
    await wait(500);
    await mainMenu.takeScreenshot('flow-step-02-about');
    steps.push('About modal opened');
    
    // Step 3: Close about
    await page.keyboard.press('Escape');
    await wait(500);
    steps.push('About modal closed');
    
    // Step 4: Select mode
    await mainMenu.selectMode('Normal');
    await wait(500);
    await mainMenu.takeScreenshot('flow-step-04-mode-selected');
    steps.push('Mode selected');
    
    // Step 5: Start game
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    await mainMenu.takeScreenshot('flow-step-05-game-started');
    steps.push('Game started');
    
    // Step 6: Play
    await wait(10000);
    await mainMenu.takeScreenshot('flow-step-06-playing');
    steps.push('Gameplay active');
    
    // Step 7: Use EMP
    await page.keyboard.press('Enter');
    await wait(1000);
    await mainMenu.takeScreenshot('flow-step-07-emp-used');
    steps.push('EMP activated');
    
    // Step 8: Pause
    await page.keyboard.press('Escape');
    await wait(500);
    await mainMenu.takeScreenshot('flow-step-08-paused');
    steps.push('Game paused');
    
    // Step 9: Resume
    await page.keyboard.press('Escape');
    await wait(500);
    await mainMenu.takeScreenshot('flow-step-09-resumed');
    steps.push('Game resumed');
    
    // Step 10: Return to menu
    await page.keyboard.press('Escape');
    await wait(500);
    await page.click('[data-testid="main-menu-button"]');
    await wait(1000);
    await mainMenu.takeScreenshot('flow-step-10-back-to-menu');
    steps.push('Returned to menu');
    
    console.log('Complete flow steps:', steps);
    console.log('✅ Complete user flow successful');
  });
});
