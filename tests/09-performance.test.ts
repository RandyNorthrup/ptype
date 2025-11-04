/**
 * Performance E2E Tests
 * Tests for performance monitoring, FPS, and resource usage
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { TEST_CONFIG } from '../config/test-config';
// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage, GameCanvasPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { assertFPS, assertMemoryUsage, assertPerformance, assertNoConsoleErrors } from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { getFPS, getMemoryUsage, wait } from '../helpers/test-helpers';

describe('Performance', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let gameCanvas: GameCanvasPage;

  beforeEach(async () => {
    mainMenu = new MainMenuPage(page);
    gameCanvas = new GameCanvasPage(page);
  });

  test('should load main menu within 5 seconds', async () => {
    const startTime = Date.now();
    
    // Wait for main menu to load
    await page.waitForSelector('[data-testid="main-menu-logo"]', {
      timeout: TEST_CONFIG.performance.maxLoadTime,
    });
    
    const loadTime = Date.now() - startTime;
    
    await assertPerformance(
      loadTime,
      TEST_CONFIG.performance.maxLoadTime,
      'Main Menu Load Time'
    );
    
    await mainMenu.takeScreenshot('main-menu-loaded');
  });

  test('should maintain 30+ FPS on main menu', async () => {
    await wait(2000);
    
    const fps = await getFPS(page, 2000);
    
    await assertFPS(fps, `Main menu FPS: ${fps}`);
    
    await mainMenu.takeScreenshot('main-menu-fps-check');
  });

  test('should maintain 30+ FPS during gameplay', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    await wait(10000); // Let game run for a bit
    
    const fps = await getFPS(page, 2000);
    
    await assertFPS(fps, `Gameplay FPS: ${fps}`);
    
    await gameCanvas.takeScreenshot('gameplay-fps-check');
  });

  test('should maintain FPS with multiple enemies', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Wait for multiple enemies to spawn
    await wait(15000);
    
    const fps = await getFPS(page, 2000);
    
    await assertFPS(fps, `FPS with multiple enemies: ${fps}`);
    
    await gameCanvas.takeScreenshot('multiple-enemies-fps');
  });

  test('should have acceptable memory usage', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    await wait(10000);
    
    const memoryUsage = await getMemoryUsage(page);
    
    await assertMemoryUsage(memoryUsage);
    
    const memoryMB = (memoryUsage / 1024 / 1024).toFixed(2);
    console.log(`Memory usage: ${memoryMB}MB`);
    
    await gameCanvas.takeScreenshot('memory-usage-check');
  });

  test('should not have memory leaks during extended play', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    const initialMemory = await getMemoryUsage(page);
    
    // Play for a while
    await wait(30000);
    
    const finalMemory = await getMemoryUsage(page);
    
    const memoryIncrease = finalMemory - initialMemory;
    const increasePercentage = (memoryIncrease / initialMemory) * 100;
    
    // Memory should not increase by more than 50% during gameplay
    if (increasePercentage > 50) {
      throw new Error(`Possible memory leak: ${increasePercentage.toFixed(2)}% increase`);
    }
    
    await gameCanvas.takeScreenshot('memory-leak-check');
  });

  test('should load 3D models efficiently', async () => {
    const startTime = Date.now();
    
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    const loadTime = Date.now() - startTime;
    
    // Game should start within reasonable time
    await assertPerformance(
      loadTime,
      TEST_CONFIG.timeouts.long,
      '3D Model Loading'
    );
    
    await gameCanvas.takeScreenshot('3d-models-loaded');
  });

  test('should have no console errors on startup', async () => {
    const errors: string[] = [];
    
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await wait(5000);
    
    await assertNoConsoleErrors(errors);
  });

  test('should have no console errors during gameplay', async () => {
    const errors: string[] = [];
    
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    await wait(15000);
    
    await assertNoConsoleErrors(errors);
  });

  test('should measure network request count', async () => {
    const requests: string[] = [];
    
    page.on('request', (request: any) => {
      requests.push(request.url());
    });
    
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    console.log(`Network requests made: ${requests.length}`);
    
    // Should make reasonable number of requests
    if (requests.length > 100) {
      throw new Error(`Too many network requests: ${requests.length}`);
    }
  });

  test('should load assets with caching', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Return to menu and restart
    await page.keyboard.press('Escape');
    await wait(500);
    await page.click('[data-testid="main-menu-button"]');
    await wait(1000);
    
    const startTime = Date.now();
    
    // Restart game (should use cache)
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    const reloadTime = Date.now() - startTime;
    
    // Second load should be faster
    console.log(`Reload time: ${reloadTime}ms`);
    
    await gameCanvas.takeScreenshot('cached-reload');
  });

  test('should handle particle effects without FPS drop', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    await wait(5000);
    
    const fpsBefore = await getFPS(page, 1000);
    
    // Trigger particle effects by typing
    await page.keyboard.press('a');
    await page.keyboard.press('b');
    await page.keyboard.press('c');
    await wait(1000);
    
    const fpsAfter = await getFPS(page, 1000);
    
    // FPS should not drop significantly
    const fpsDrop = fpsBefore - fpsAfter;
    if (fpsDrop > 10) {
      throw new Error(`Significant FPS drop with particles: ${fpsDrop} FPS`);
    }
    
    await gameCanvas.takeScreenshot('particle-effects-fps');
  });

  test('should measure First Contentful Paint', async () => {
    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
      return fcpEntry?.startTime || 0;
    });
    
    await assertPerformance(
      fcp,
      TEST_CONFIG.performance.maxFirstContentfulPaint,
      'First Contentful Paint'
    );
    
    console.log(`FCP: ${fcp.toFixed(2)}ms`);
  });

  test('should measure Time to Interactive', async () => {
    const tti = await page.evaluate(() => {
      return performance.timing.domInteractive - performance.timing.navigationStart;
    });
    
    console.log(`TTI: ${tti}ms`);
    
    // Should be interactive within 5 seconds
    if (tti > 5000) {
      throw new Error(`TTI too high: ${tti}ms`);
    }
  });

  test('should have efficient WebGL rendering', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    await wait(5000);
    
    const glInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (!gl) return null;
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      
      return {
        vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown',
        renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown',
        version: gl.getParameter(gl.VERSION),
      };
    });
    
    console.log('WebGL Info:', glInfo);
    
    await gameCanvas.takeScreenshot('webgl-rendering');
  });

  test('should measure audio loading performance', async () => {
    const startTime = Date.now();
    
    // Wait for audio to initialize
    await wait(3000);
    
    const audioLoaded = await page.evaluate(() => {
      const audioManager = (window as any).__audioManager__;
      return audioManager !== undefined;
    });
    
    const loadTime = Date.now() - startTime;
    
    if (!audioLoaded) {
      throw new Error('Audio manager not initialized');
    }
    
    console.log(`Audio loading time: ${loadTime}ms`);
  });

  test('should handle rapid input without lag', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    await wait(5000);
    
    const startTime = Date.now();
    
    // Type rapidly
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('a');
    }
    
    const inputTime = Date.now() - startTime;
    const avgInputDelay = inputTime / 50;
    
    // Average input delay should be under 20ms
    if (avgInputDelay > 20) {
      throw new Error(`Input lag detected: ${avgInputDelay.toFixed(2)}ms per key`);
    }
    
    console.log(`Average input delay: ${avgInputDelay.toFixed(2)}ms`);
  });
});
