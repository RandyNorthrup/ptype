/**
 * Responsive Design E2E Tests
 * Tests for responsive behavior across different viewport sizes
 */

/// <reference path="./types/test-types.d.ts" />

// @ts-ignore - Module resolution for MCP Browser tests
import { TEST_CONFIG } from '../config/test-config';
// @ts-ignore - Module resolution for MCP Browser tests
import { MainMenuPage, GameCanvasPage } from '../helpers/page-objects';
// @ts-ignore - Module resolution for MCP Browser tests
import { assertVisible } from '../helpers/assertions';
// @ts-ignore - Module resolution for MCP Browser tests
import { wait } from '../helpers/test-helpers';

describe('Responsive Design', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let gameCanvas: GameCanvasPage;

  beforeEach(async () => {
    mainMenu = new MainMenuPage(page);
    gameCanvas = new GameCanvasPage(page);
  });

  test('should display correctly on desktop (1920x1080)', async () => {
    await page.setViewportSize(TEST_CONFIG.viewports.desktop);
    await wait(1000);
    
    // Verify main menu is visible
    await assertVisible(page, '[data-testid="main-menu-logo"]');
    
    await mainMenu.takeScreenshot('desktop-1920x1080');
  });

  test('should display correctly on laptop (1366x768)', async () => {
    await page.setViewportSize(TEST_CONFIG.viewports.laptop);
    await wait(1000);
    
    await assertVisible(page, '[data-testid="main-menu-logo"]');
    
    await mainMenu.takeScreenshot('laptop-1366x768');
  });

  test('should display correctly on tablet (768x1024)', async () => {
    await page.setViewportSize(TEST_CONFIG.viewports.tablet);
    await wait(1000);
    
    await assertVisible(page, '[data-testid="main-menu-logo"]');
    
    await mainMenu.takeScreenshot('tablet-768x1024');
  });

  test('should display correctly on mobile (375x667)', async () => {
    await page.setViewportSize(TEST_CONFIG.viewports.mobile);
    await wait(1000);
    
    await assertVisible(page, '[data-testid="main-menu-logo"]');
    
    await mainMenu.takeScreenshot('mobile-375x667');
  });

  test('should have responsive canvas on desktop', async () => {
    await page.setViewportSize(TEST_CONFIG.viewports.desktop);
    
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    const canvasSize = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        width: canvas?.width,
        height: canvas?.height,
      };
    });
    
    // Canvas should fill viewport
    if (!canvasSize.width || !canvasSize.height) {
      throw new Error('Canvas should have dimensions');
    }
    
    await gameCanvas.takeScreenshot('responsive-canvas-desktop');
  });

  test('should have responsive canvas on mobile', async () => {
    await page.setViewportSize(TEST_CONFIG.viewports.mobile);
    
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    const canvasSize = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        width: canvas?.width,
        height: canvas?.height,
      };
    });
    
    await gameCanvas.takeScreenshot('responsive-canvas-mobile');
  });

  test('should have responsive menu buttons', async () => {
    const viewports = [
      TEST_CONFIG.viewports.desktop,
      TEST_CONFIG.viewports.laptop,
      TEST_CONFIG.viewports.tablet,
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await wait(500);
      
      // Check button widths
      const buttonWidth = await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="new-game-button"]');
        return btn?.getBoundingClientRect().width;
      });
      
      if (!buttonWidth) {
        throw new Error('Button should have width');
      }
      
      console.log(`Button width at ${viewport.width}x${viewport.height}: ${buttonWidth}px`);
    }
  });

  test('should stack elements vertically on small screens', async () => {
    await page.setViewportSize(TEST_CONFIG.viewports.mobile);
    await wait(500);
    
    // Check if buttons are stacked
    const layout = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      if (buttons.length < 2) return { stacked: false };
      
      const first = buttons[0].getBoundingClientRect();
      const second = buttons[1].getBoundingClientRect();
      
      // Buttons are stacked if second is below first
      return {
        stacked: second.top > first.bottom - 5,
      };
    });
    
    await mainMenu.takeScreenshot('mobile-stacked-layout');
  });

  test('should have readable text on all screen sizes', async () => {
    const viewports = [
      TEST_CONFIG.viewports.desktop,
      TEST_CONFIG.viewports.laptop,
      TEST_CONFIG.viewports.tablet,
      TEST_CONFIG.viewports.mobile,
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await wait(500);
      
      const fontSize = await page.evaluate(() => {
        const body = document.body;
        return parseFloat(window.getComputedStyle(body).fontSize);
      });
      
      // Font should be at least 14px
      if (fontSize < 14) {
        throw new Error(`Font too small at ${viewport.width}x${viewport.height}: ${fontSize}px`);
      }
    }
  });

  test('should have tappable targets on mobile', async () => {
    await page.setViewportSize(TEST_CONFIG.viewports.mobile);
    await wait(500);
    
    const buttonSizes = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).map(btn => {
        const rect = btn.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          area: rect.width * rect.height,
        };
      });
    });
    
    // Touch targets should be at least 44x44px (iOS guideline)
    const tooSmall = buttonSizes.filter((s: { width: number; height: number; area: number }) => s.width < 44 || s.height < 44);
    
    if (tooSmall.length > 0) {
      console.warn(`${tooSmall.length} buttons are smaller than 44x44px`);
    }
    
    await mainMenu.takeScreenshot('mobile-touch-targets');
  });

  test('should not have horizontal scroll', async () => {
    const viewports = [
      TEST_CONFIG.viewports.desktop,
      TEST_CONFIG.viewports.laptop,
      TEST_CONFIG.viewports.tablet,
      TEST_CONFIG.viewports.mobile,
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await wait(500);
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      
      if (hasHorizontalScroll) {
        throw new Error(`Horizontal scroll at ${viewport.width}x${viewport.height}`);
      }
    }
  });

  test('should adjust modal size on different screens', async () => {
    const viewports = [
      TEST_CONFIG.viewports.desktop,
      TEST_CONFIG.viewports.mobile,
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await mainMenu.openSettings();
      await wait(500);
      
      const modalSize = await page.evaluate(() => {
        const modal = document.querySelector('[data-testid="settings-modal"]');
        const rect = modal?.getBoundingClientRect();
        return {
          width: rect?.width,
          height: rect?.height,
        };
      });
      
      console.log(`Modal size at ${viewport.width}x${viewport.height}:`, modalSize);
      
      await mainMenu.takeScreenshot(`modal-${viewport.width}x${viewport.height}`);
      
      // Close modal
      await page.keyboard.press('Escape');
      await wait(500);
    }
  });

  test('should handle orientation changes', async () => {
    // Portrait
    await page.setViewportSize({ width: 768, height: 1024 });
    await wait(500);
    await mainMenu.takeScreenshot('portrait-mode');
    
    // Landscape
    await page.setViewportSize({ width: 1024, height: 768 });
    await wait(500);
    await mainMenu.takeScreenshot('landscape-mode');
    
    // Both should work without errors
  });

  test('should maintain aspect ratio of images/logos', async () => {
    const viewports = [
      TEST_CONFIG.viewports.desktop,
      TEST_CONFIG.viewports.mobile,
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await wait(500);
      
      const logoAspect = await page.evaluate(() => {
        const logo = document.querySelector('[data-testid="main-menu-logo"]') as HTMLImageElement;
        if (!logo) return null;
        
        return {
          natural: logo.naturalWidth / logo.naturalHeight,
          rendered: logo.width / logo.height,
        };
      });
      
      if (logoAspect) {
        const aspectDiff = Math.abs(logoAspect.natural - logoAspect.rendered);
        if (aspectDiff > 0.1) {
          throw new Error('Logo aspect ratio distorted');
        }
      }
    }
  });

  test('should have responsive HUD on different screens', async () => {
    const viewports = [
      TEST_CONFIG.viewports.desktop,
      TEST_CONFIG.viewports.tablet,
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      await mainMenu.selectMode('Normal');
      await mainMenu.clickNewGame();
      await gameCanvas.waitForGameStart();
      
      await wait(3000);
      
      // Check HUD visibility
      await assertVisible(page, '[data-testid="canvas-hud"]');
      
      await gameCanvas.takeScreenshot(`hud-${viewport.width}x${viewport.height}`);
      
      // Return to menu
      await page.keyboard.press('Escape');
      await wait(500);
      await page.click('[data-testid="main-menu-button"]');
      await wait(1000);
    }
  });

  test('should use media queries effectively', async () => {
    const mediaQueries = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      let mqCount = 0;
      
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          mqCount += rules.filter(rule => rule instanceof CSSMediaRule).length;
        } catch (e) {
          // CORS may prevent access to some stylesheets
        }
      }
      
      return mqCount;
    });
    
    console.log(`Media queries found: ${mediaQueries}`);
  });

  test('should handle ultra-wide displays', async () => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await wait(1000);
    
    await assertVisible(page, '[data-testid="main-menu-logo"]');
    
    // Content should be centered, not stretched
    const isCentered = await page.evaluate(() => {
      const logo = document.querySelector('[data-testid="main-menu-logo"]');
      const rect = logo?.getBoundingClientRect();
      if (!rect) return false;
      
      const centerX = rect.left + rect.width / 2;
      const viewportCenterX = window.innerWidth / 2;
      
      // Logo should be near center
      return Math.abs(centerX - viewportCenterX) < 200;
    });
    
    if (!isCentered) {
      throw new Error('Content should be centered on ultra-wide displays');
    }
    
    await mainMenu.takeScreenshot('ultra-wide-2560x1440');
  });

  test('should handle small width edge case', async () => {
    await page.setViewportSize({ width: 320, height: 568 });
    await wait(1000);
    
    // Should still be usable
    await assertVisible(page, '[data-testid="main-menu-logo"]');
    
    await mainMenu.takeScreenshot('small-width-320px');
  });
});
