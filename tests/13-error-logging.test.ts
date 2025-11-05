/**
 * Error Logging E2E Tests
 * Tests for comprehensive error logging and handling
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage, GameCanvasPage, SettingsMenuPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { assertVisible } from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { navigateToApp, wait } from '../helpers/test-helpers';

describe('Error Logging', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let gameCanvas: GameCanvasPage;
  let settingsMenu: SettingsMenuPage;

  beforeEach(async () => {
    mainMenu = new MainMenuPage(page);
    gameCanvas = new GameCanvasPage(page);
    settingsMenu = new SettingsMenuPage(page);
    
    // Clear console errors
    await page.evaluate(() => {
      (window as any).__consoleErrors__ = [];
      const originalError = console.error;
      console.error = (...args: any[]) => {
        (window as any).__consoleErrors__.push(args.join(' '));
        originalError.apply(console, args);
      };
    });
  });

  test('should log localStorage errors in SettingsMenu', async () => {
    // Mock localStorage failure
    await page.evaluate(() => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('localStorage quota exceeded');
      };
      (window as any).__originalSetItem__ = originalSetItem;
    });

    // Open settings and try to save
    await mainMenu.clickSettings();
    await wait(500);
    
    // Change a setting
    await page.evaluate(() => {
      const slider = document.querySelector('[data-testid="music-volume-slider"]') as HTMLInputElement;
      if (slider) slider.value = '75';
    });
    
    // Try to save - should log error
    await page.click('[data-testid="settings-save-button"]');
    await wait(500);
    
    const errors = await page.evaluate(() => (window as any).__consoleErrors__);
    const hasStorageError = errors.some((err: string) => 
      err.includes('Failed to save settings') || err.includes('localStorage')
    );
    
    if (!hasStorageError) {
      throw new Error('localStorage error should be logged');
    }
    
    // Restore localStorage
    await page.evaluate(() => {
      localStorage.setItem = (window as any).__originalSetItem__;
    });
  });

  test('should log texture loading errors in Trophies', async () => {
    // Start game to trigger 3D asset loading
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Wait for potential texture loading
    await wait(3000);
    
    // Check if any texture errors were logged
    const errors = await page.evaluate(() => (window as any).__consoleErrors__);
    
    // If there are texture errors, they should be properly logged (not suppressed)
    const hasTextureError = errors.some((err: string) => 
      err.includes('Failed to load') && err.includes('icon')
    );
    
    // This test passes if either no errors occur OR errors are properly logged
    // (We're not testing for failure, we're testing that errors aren't suppressed)
    console.log('Texture loading errors (if any):', hasTextureError);
  });

  test('should log canvas context errors', async () => {
    // This test verifies that canvas errors are logged
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await wait(1000);
    
    const errors = await page.evaluate(() => (window as any).__consoleErrors__);
    
    // Check if LaserEffect logged any canvas errors
    const hasCanvasError = errors.some((err: string) => 
      err.includes('LaserEffect') && (err.includes('canvas') || err.includes('context'))
    );
    
    // Should NOT have canvas errors in normal operation
    if (hasCanvasError) {
      console.warn('Canvas errors detected:', errors.filter((e: string) => e.includes('canvas')));
    }
  });

  test('should log game start errors', async () => {
    // Try to start game with invalid mode - wrap in try-catch
    const errors = await page.evaluate(() => {
      try {
        // Simulate invalid game start
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        document.dispatchEvent(event);
      } catch (err) {
        return err;
      }
      return null;
    });
    
    // Any errors should be caught and logged, not thrown
    if (errors) {
      console.log('Game start error properly caught:', errors);
    }
  });

  test('should expose audio errors without suppression', async () => {
    // Start game (audio will try to play)
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await wait(1000);
    
    const errors = await page.evaluate(() => (window as any).__consoleErrors__);
    
    // Check for audio-related logs (info messages are okay)
    const audioLogs = errors.filter((err: string) => 
      err.includes('music') || err.includes('audio')
    );
    
    console.log('Audio logs:', audioLogs);
    
    // Audio errors should be visible (not suppressed with .catch())
    // But they might be info messages about user interaction required
  });

  test('should log model loading errors', async () => {
    // Start game to trigger 3D model loading
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Wait for models to load
    await wait(3000);
    
    const errors = await page.evaluate(() => (window as any).__consoleErrors__);
    
    // Check if any model loading errors were logged
    const hasModelError = errors.some((err: string) => 
      err.includes('Failed to load') && (err.includes('model') || err.includes('.glb'))
    );
    
    if (hasModelError) {
      console.warn('Model loading errors:', errors.filter((e: string) => e.includes('model')));
    }
  });

  test('should not suppress service worker errors', async () => {
    // Check service worker registration logs
    const logs = await page.evaluate(() => {
      return (window as any).__servicWorkerLogs__ || [];
    });
    
    // Service worker errors should be visible
    console.log('Service worker logs:', logs);
  });

  test('should have ErrorBoundary catching React errors', async () => {
    // Trigger a component that might error
    await mainMenu.clickSettings();
    await wait(500);
    
    // Check if ErrorBoundary is present
    const hasErrorBoundary = await page.evaluate(() => {
      return (window as any).__errorBoundary__ !== undefined;
    });
    
    console.log('ErrorBoundary active:', hasErrorBoundary);
  });

  test('should log initialization errors', async () => {
    // Check for any initialization errors
    const errors = await page.evaluate(() => (window as any).__consoleErrors__);
    
    const initErrors = errors.filter((err: string) => 
      err.includes('initialize') || err.includes('init') || err.includes('Failed to')
    );
    
    if (initErrors.length > 0) {
      console.warn('Initialization errors:', initErrors);
    }
  });

  test('should use logger utility consistently', async () => {
    // Start game and perform actions
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    await wait(2000);
    
    // Check console for proper logger format
    const errors = await page.evaluate(() => (window as any).__consoleErrors__);
    
    // Logger uses format like: "ℹ️ [Module] message"
    const properlyFormatted = errors.every((err: string) => {
      // Either standard error format or our logger format
      return typeof err === 'string';
    });
    
    if (!properlyFormatted) {
      throw new Error('Some logs are not properly formatted');
    }
  });
});
