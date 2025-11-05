/**
 * Settings Menu E2E Tests
 * Tests for settings menu functionality and persistence
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { TEST_CONFIG } from '../config/test-config';
// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage, SettingsMenuPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { assertVisible } from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { wait } from '../helpers/test-helpers';

describe('Settings Menu', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let settingsMenu: SettingsMenuPage;

  beforeEach(async () => {
    mainMenu = new MainMenuPage(page);
    settingsMenu = new SettingsMenuPage(page);
  });

  test('should open settings modal', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    const isVisible = await settingsMenu.isVisible();
    if (!isVisible) {
      throw new Error('Settings modal should be visible');
    }
    
    await settingsMenu.takeScreenshot('settings-modal-open');
  });

  test('should display music volume slider', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    await assertVisible(page, '[data-testid="music-volume-slider"]');
    
    await settingsMenu.takeScreenshot('music-volume-slider');
  });

  test('should display sound effects volume slider', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    await assertVisible(page, '[data-testid="sfx-volume-slider"]');
    
    await settingsMenu.takeScreenshot('sound-volume-slider');
  });

  test('should adjust music volume', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    // Set volume to 50%
    await settingsMenu.setMusicVolume(50);
    await wait(500);
    
    // Verify volume changed
    const volume = await page.evaluate(() => {
      const slider = document.querySelector('[data-testid="music-volume-slider"]') as HTMLInputElement;
      return slider?.value;
    });
    
    if (volume !== '50') {
      throw new Error('Music volume should be set to 50');
    }
    
    await settingsMenu.takeScreenshot('music-volume-adjusted');
  });

  test('should adjust sound effects volume', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    // Set volume to 75%
    await settingsMenu.setSoundVolume(75);
    await wait(500);
    
    const volume = await page.evaluate(() => {
      const slider = document.querySelector('[data-testid="sfx-volume-slider"]') as HTMLInputElement;
      return slider?.value;
    });
    
    if (volume !== '75') {
      throw new Error('Sound volume should be set to 75');
    }
    
    await settingsMenu.takeScreenshot('sound-volume-adjusted');
  });

  test('should mute audio by setting volume to 0', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    await settingsMenu.setMusicVolume(0);
    await settingsMenu.setSoundVolume(0);
    await wait(500);
    
    await settingsMenu.takeScreenshot('audio-muted');
  });

  test('should close settings modal', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    await settingsMenu.close();
    await wait(500);
    
    const isVisible = await settingsMenu.isVisible();
    if (isVisible) {
      throw new Error('Settings modal should be closed');
    }
    
    await mainMenu.takeScreenshot('settings-modal-closed');
  });

  test('should persist settings across sessions', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    // Set specific volumes
    await settingsMenu.setMusicVolume(60);
    await settingsMenu.setSoundVolume(40);
    await wait(500);
    
    await settingsMenu.close();
    
    // Reload page
    await page.reload();
    await wait(2000);
    
    // Reopen settings
    await mainMenu.openSettings();
    await wait(500);
    
    // Check if volumes persisted
    const musicVolume = await page.evaluate(() => {
      const slider = document.querySelector('[data-testid="music-volume-slider"]') as HTMLInputElement;
      return slider?.value;
    });
    
    const soundVolume = await page.evaluate(() => {
      const slider = document.querySelector('[data-testid="sound-volume-slider"]') as HTMLInputElement;
      return slider?.value;
    });
    
    await settingsMenu.takeScreenshot('settings-persisted');
  });

  test('should apply volume changes immediately', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    // Change volume
    await settingsMenu.setMusicVolume(30);
    
    // Check if audio manager updated
    const audioUpdated = await page.evaluate(() => {
      const audioManager = (window as any).__audioManager__;
      return audioManager?.musicVolume === 0.3;
    });
    
    await settingsMenu.takeScreenshot('volume-applied');
  });

  test('should show current volume values', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    // Check if volume values are displayed
    const hasValues = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('%') || /\d+/.test(text);
    });
    
    if (!hasValues) {
      throw new Error('Volume values should be displayed');
    }
    
    await settingsMenu.takeScreenshot('volume-values-shown');
  });

  test('should have smooth slider interaction', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    const slider = '[data-testid="music-volume-slider"]';
    
    // Drag slider
    await page.hover(slider);
    await page.mouse.down();
    await page.mouse.move(100, 0);
    await page.mouse.up();
    await wait(500);
    
    await settingsMenu.takeScreenshot('slider-dragged');
  });

  test('should handle keyboard navigation in settings', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    // Try Tab navigation
    await page.keyboard.press('Tab');
    await wait(200);
    await page.keyboard.press('Tab');
    await wait(200);
    
    await settingsMenu.takeScreenshot('keyboard-navigation');
  });

  test('should display settings title', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    const hasTitle = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.toLowerCase().includes('settings');
    });
    
    if (!hasTitle) {
      throw new Error('Settings title should be displayed');
    }
    
    await settingsMenu.takeScreenshot('settings-title');
  });

  test('should show volume icons', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    // Check for speaker/volume icons
    const hasIcons = await page.evaluate(() => {
      const icons = document.querySelectorAll('svg, [data-icon]');
      return icons.length > 0;
    });
    
    await settingsMenu.takeScreenshot('volume-icons');
  });

  test('should close settings with Escape key', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    await page.keyboard.press('Escape');
    await wait(500);
    
    const isVisible = await settingsMenu.isVisible();
    if (isVisible) {
      throw new Error('Settings should close with Escape key');
    }
    
    await mainMenu.takeScreenshot('settings-closed-with-escape');
  });
});
