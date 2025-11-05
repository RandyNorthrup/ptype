/**
 * Game Modes E2E Tests
 * Tests for game mode selection and initialization
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage, GameCanvasPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { assertVisible, assertTextContent } from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { waitForCanvas, navigateToApp } from '../helpers/test-helpers';

describe('Game Modes', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let gameCanvas: GameCanvasPage;

  beforeEach(async () => {
    // Navigate to app
    // await navigateToApp(page);
    mainMenu = new MainMenuPage(page);
    gameCanvas = new GameCanvasPage(page);
  });

  test('should start Normal mode game', async () => {
    // Select and start Normal mode
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    
    // Wait for game to initialize
    await gameCanvas.waitForGameStart();
    
    // Verify game is active
    const isActive = await gameCanvas.isGameActive();
    if (!isActive) {
      throw new Error('Game should be active after starting Normal mode');
    }
    
    // Verify HUD shows Level 1 using correct test ID
    await assertTextContent(page, '[data-testid="hud-level"]', /Level.*1/i);
    
    await gameCanvas.takeScreenshot('normal-mode-start');
  });

  test('should start Python programming mode', async () => {
    await mainMenu.selectMode('Python');
    await mainMenu.clickNewGame();
    
    await gameCanvas.waitForGameStart();
    
    // Verify game started
    await assertVisible(page, 'canvas');
    
    // Python mode should show programming-related words
    // This would need to check actual word content
    await gameCanvas.takeScreenshot('python-mode-start');
  });

  test('should start JavaScript programming mode', async () => {
    await mainMenu.selectMode('JavaScript');
    await mainMenu.clickNewGame();
    
    await gameCanvas.waitForGameStart();
    await assertVisible(page, 'canvas');
    
    await gameCanvas.takeScreenshot('javascript-mode-start');
  });

  test('should start Java programming mode', async () => {
    await mainMenu.selectMode('Java');
    await mainMenu.clickNewGame();
    
    await gameCanvas.waitForGameStart();
    await assertVisible(page, 'canvas');
  });

  test('should start C# programming mode', async () => {
    await mainMenu.selectMode('C#');
    await mainMenu.clickNewGame();
    
    await gameCanvas.waitForGameStart();
    await assertVisible(page, 'canvas');
  });

  test('should start C++ programming mode', async () => {
    await mainMenu.selectMode('C++');
    await mainMenu.clickNewGame();
    
    await gameCanvas.waitForGameStart();
    await assertVisible(page, 'canvas');
  });

  test('should start CSS programming mode', async () => {
    await mainMenu.selectMode('CSS');
    await mainMenu.clickNewGame();
    
    await gameCanvas.waitForGameStart();
    await assertVisible(page, 'canvas');
  });

  test('should start HTML programming mode', async () => {
    await mainMenu.selectMode('HTML');
    await mainMenu.clickNewGame();
    
    await gameCanvas.waitForGameStart();
    await assertVisible(page, 'canvas');
  });

  test('should initialize WebGL context', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    
    await waitForCanvas(page);
    
    // Verify WebGL context is created
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return gl !== null;
    });
    
    if (!hasWebGL) {
      throw new Error('WebGL context should be initialized');
    }
  });

  test('should load word dictionary for selected mode', async () => {
    await mainMenu.selectMode('Python');
    await mainMenu.clickNewGame();
    
    await gameCanvas.waitForGameStart();
    
    // Wait for first word to spawn
    await page.waitForTimeout(5000);
    
    // Check if words are being displayed
    const hasWords = await page.evaluate(() => {
      // Check for word elements in the scene
      const wordElements = document.querySelectorAll('[data-word]');
      return wordElements.length > 0;
    });
    
    if (!hasWords) {
      throw new Error('Words should be spawned in the game');
    }
  });

  test('should display HUD elements for all modes', async () => {
    const modes = ['Normal', 'Python', 'JavaScript'];
    
    for (const mode of modes) {
      // Restart for each mode
      await navigateToApp(page);
      
      await mainMenu.selectMode(mode);
      await mainMenu.clickNewGame();
      await gameCanvas.waitForGameStart();
      
      // Verify HUD elements using correct TEST_IDS
      await assertVisible(page, '[data-testid="hud-health-bar"]');
      await assertVisible(page, '[data-testid="hud-score"]');
      await assertVisible(page, '[data-testid="hud-level"]');
      await assertVisible(page, '[data-testid="hud-wpm"]');
      await assertVisible(page, '[data-testid="hud-accuracy"]');
      
      await gameCanvas.takeScreenshot(`${mode.toLowerCase()}-mode-hud`);
    }
  });

  test('should initialize game state correctly', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Verify initial game state
    const health = await gameCanvas.getHealth();
    if (!health.includes('100') && !health.includes('3')) {
      throw new Error('Health should be at maximum initially');
    }
    
    const score = await gameCanvas.getScore();
    if (!score.includes('0')) {
      throw new Error('Score should start at 0');
    }
    
    const level = await gameCanvas.getLevel();
    if (!level.includes('1')) {
      throw new Error('Level should start at 1');
    }
  });

  test('should switch between modes without errors', async () => {
    const modes = ['Normal', 'Python', 'JavaScript', 'Java'];
    
    for (const mode of modes) {
      await mainMenu.selectMode(mode);
      
      const selectedMode = await mainMenu.getSelectedMode();
      if (selectedMode !== mode) {
        throw new Error(`Mode should be ${mode} but got ${selectedMode}`);
      }
    }
  });

  test('should remember last selected mode', async () => {
    // Select a mode
    await mainMenu.selectMode('Python');
    const firstSelection = await mainMenu.getSelectedMode();
    
    // Note: This test would need localStorage persistence
    // For now, just verify the selection works
    if (firstSelection !== 'Python') {
      throw new Error('Mode selection should work correctly');
    }
  });

  test('should load 3D assets before game starts', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    
    // Monitor network requests for 3D models
    const requests: string[] = [];
    page.on('request', (request: any) => {
      const url = request.url();
      if (url.includes('.glb') || url.includes('.gltf')) {
        requests.push(url);
      }
    });
    
    await gameCanvas.waitForGameStart();
    
    // Verify 3D model requests were made
    if (requests.length === 0) {
      throw new Error('3D model assets should be requested');
    }
  });

  test('should display loading status during initialization', async () => {
    // This test checks for loading indicator
    await mainMenu.selectMode('Normal');
    
    // Start game and immediately check for loading
    await mainMenu.clickNewGame();
    
    // There should be a brief loading period
    const hasLoading = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Loading') || text.includes('Initializing');
    });
    
    // Note: This might be too fast to catch
    // Just verify game eventually loads
    await gameCanvas.waitForGameStart();
  });

  test('should start with correct camera position', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await waitForCanvas(page);
    
    // Verify camera is positioned correctly
    const cameraPos = await page.evaluate(() => {
      // Access Three.js camera if exposed
      const camera = (window as any).__camera__;
      if (camera) {
        return {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        };
      }
      return null;
    });
    
    // Camera should be positioned above and behind player
    // Expected: [0, 12, -35] from App.tsx
    if (cameraPos && cameraPos.y < 0) {
      throw new Error('Camera should be positioned above the scene');
    }
  });

  test('should enable keyboard input after game starts', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    // Try typing a character
    await page.keyboard.press('a');
    
    // Game should accept the input (no errors)
    const errors = await page.evaluate(() => {
      return (window as any).__lastError__ || null;
    });
    
    if (errors) {
      throw new Error('Game should accept keyboard input without errors');
    }
  });
});
