// @ts-nocheck
/**
 * Main Menu E2E Tests
 * Tests for the main menu navigation and UI interactions
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { TEST_CONFIG } from '../config/test-config';
// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { 
  assertVisible, 
  assertDisabled,
  assertText,
  assertContainsText,
  assertTextContent,
  assertNoConsoleErrors
} from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { getConsoleErrors, waitForAnimations } from '../helpers/test-helpers';

describe('Main Menu', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  const consoleErrors: string[] = [];

  beforeAll(async () => {
    // Setup will be handled by test runner
    // This is a template for MCP Browser usage
  });

  beforeEach(async () => {
    consoleErrors.length = 0;
    // Navigate to app and wait for load
    // In actual MCP usage: await navigateToApp(page);
  });

  test('should display logo and title', async () => {
    // Verify main menu logo is visible
    await assertVisible(page, '[data-testid="main-menu-logo"]', 'Logo should be visible');
    
    // Verify title text is present
    await assertTextContent(
      page, 
      'p', 
      /THE TYPING GAME/i,
      'Title should display "THE TYPING GAME"'
    );
  });

  test('should have Continue button disabled by default', async () => {
    await assertDisabled(
      page, 
      '[data-testid="continue-game-button"]',
      'Continue button should be disabled by default'
    );
  });

  test('should have New Game button disabled when no mode selected', async () => {
    const isDisabled = await page.evaluate(() => {
      const button = document.querySelector('[data-testid="new-game-button"]');
      return button?.getAttribute('disabled') !== null;
    });
    
    if (!isDisabled) {
      throw new Error('New Game button should be disabled when no mode is selected');
    }
  });

  test('should open mode selector dropdown', async () => {
    mainMenu = new MainMenuPage(page);
    
    // Click mode selector button
    await mainMenu.openModeSelector();
    
    // Verify dropdown is visible
    await assertVisible(
      page,
      '[data-testid="mode-selector-dropdown"]',
      'Mode selector dropdown should be visible'
    );
    
    // Take screenshot
    await mainMenu.takeScreenshot('mode-selector-open');
  });

  test('should display all game modes in dropdown', async () => {
    mainMenu = new MainMenuPage(page);
    await mainMenu.openModeSelector();
    
    const modes = [
      'choose-a-mode',
      'normal',
      'python',
      'javascript',
      'java',
      'csharp',
      'cplusplus',
      'css',
      'html'
    ];
    
    for (const mode of modes) {
      const selector = `[data-testid="mode-option-${mode}"]`;
      await assertVisible(page, selector, `Mode option ${mode} should be visible`);
    }
  });

  test('should select Normal mode', async () => {
    mainMenu = new MainMenuPage(page);
    
    // Select Normal mode
    await mainMenu.selectMode('Normal');
    
    // Wait for dropdown to close
    await waitForAnimations();
    
    // Verify mode is selected
    const selectedMode = await mainMenu.getSelectedMode();
    if (selectedMode !== 'Normal') {
      throw new Error(`Expected mode to be "Normal" but got "${selectedMode}"`);
    }
    
    // Verify New Game button is now enabled
    const isEnabled = await mainMenu.isNewGameEnabled();
    if (!isEnabled) {
      throw new Error('New Game button should be enabled after selecting a mode');
    }
  });

  test('should select Python programming mode', async () => {
    mainMenu = new MainMenuPage(page);
    
    await mainMenu.selectMode('Python');
    await waitForAnimations();
    
    const selectedMode = await mainMenu.getSelectedMode();
    if (selectedMode !== 'Python') {
      throw new Error(`Expected mode to be "Python" but got "${selectedMode}"`);
    }
  });

  test('should start new game with Normal mode', async () => {
    mainMenu = new MainMenuPage(page);
    
    // Select mode and start game
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    
    // Wait for game to load
    await page.waitForTimeout(TEST_CONFIG.timeouts.long);
    
    // Verify game canvas is visible
    await assertVisible(page, 'canvas', 'Game canvas should be visible');
    
    // Verify HUD elements are present
    await assertVisible(page, '[data-testid="canvas-hud"]', 'HUD should be visible');
  });

  test('should open Player Stats modal', async () => {
    mainMenu = new MainMenuPage(page);
    
    await mainMenu.openPlayerStats();
    await waitForAnimations();
    
    // Verify stats modal is visible
    await assertVisible(
      page,
      '[data-testid="player-stats-modal"]',
      'Player Stats modal should be visible'
    );
    
    await mainMenu.takeScreenshot('player-stats-modal');
  });

  test('should open Settings modal', async () => {
    mainMenu = new MainMenuPage(page);
    
    await mainMenu.openSettings();
    await waitForAnimations();
    
    // Verify settings modal is visible
    await assertVisible(
      page,
      '[data-testid="settings-modal"]',
      'Settings modal should be visible'
    );
    
    await mainMenu.takeScreenshot('settings-modal');
  });

  test('should open About modal', async () => {
    mainMenu = new MainMenuPage(page);
    
    await mainMenu.openAbout();
    await waitForAnimations();
    
    // Verify about modal content
    await assertTextContent(page, 'h1', /P-Type/i, 'About modal should show P-Type title');
    await assertTextContent(page, 'p', /Version 2\.0\.0/i, 'About modal should show version');
    await assertTextContent(page, 'p', /Randy Northrup/i, 'About modal should show creator');
    
    await mainMenu.takeScreenshot('about-modal');
  });

  test('should close dropdown when clicking outside', async () => {
    mainMenu = new MainMenuPage(page);
    
    // Open dropdown
    await mainMenu.openModeSelector();
    await assertVisible(page, '[data-testid="mode-selector-dropdown"]');
    
    // Click outside dropdown
    await page.click('body', { position: { x: 10, y: 10 } });
    await waitForAnimations();
    
    // Verify dropdown is closed
    const isVisible = await page.isVisible('[data-testid="mode-selector-dropdown"]');
    if (isVisible) {
      throw new Error('Dropdown should close when clicking outside');
    }
  });

  test('should display help panel with instructions', async () => {
    // Verify help panel is visible
    await assertTextContent(page, 'h3', /HOW TO PLAY/i, 'Help panel should have title');
    
    // Verify instructions contain key information
    const helpText = await page.textContent('div');
    if (!helpText?.includes('Type falling words')) {
      throw new Error('Help panel should contain typing instructions');
    }
    if (!helpText?.includes('TAB to switch targets')) {
      throw new Error('Help panel should contain target switching info');
    }
    if (!helpText?.includes('EMP')) {
      throw new Error('Help panel should mention EMP weapon');
    }
  });

  test('should have no console errors on load', async () => {
    const errors = await getConsoleErrors(page);
    await assertNoConsoleErrors(errors, 'Main menu should load without console errors');
  });

  test('should have proper button hover states', async () => {
    const button = '[data-testid="new-game-button"]';
    
    // Get initial state
    const initialStyle = await page.evaluate((sel: string) => {
      const el = document.querySelector(sel) as HTMLElement;
      return {
        transform: el.style.transform,
        boxShadow: el.style.boxShadow,
      };
    }, button);
    
    // Hover over button
    await page.hover(button);
    await waitForAnimations();
    
    // Verify hover state changed
    const hoverStyle = await page.evaluate((sel: string) => {
      const el = document.querySelector(sel) as HTMLElement;
      return {
        transform: el.style.transform,
        boxShadow: el.style.boxShadow,
      };
    }, button);
    
    // Some visual change should occur
    const hasChanged = 
      hoverStyle.transform !== initialStyle.transform ||
      hoverStyle.boxShadow !== initialStyle.boxShadow;
    
    if (!hasChanged) {
      throw new Error('Button should have hover state');
    }
  });

  afterEach(async () => {
    // Check for console errors after each test
    await assertNoConsoleErrors(consoleErrors);
  });
});
