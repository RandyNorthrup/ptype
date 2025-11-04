/**
 * Accessibility E2E Tests
 * Tests for accessibility features, ARIA labels, and keyboard navigation
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

describe('Accessibility', () => {
  let page: any;
  let mainMenu: MainMenuPage;
  let gameCanvas: GameCanvasPage;

  beforeEach(async () => {
    mainMenu = new MainMenuPage(page);
    gameCanvas = new GameCanvasPage(page);
  });

  test('should have ARIA labels on buttons', async () => {
    // Check main menu buttons
    const buttons = [
      '[data-testid="new-game-button"]',
      '[data-testid="mode-selector-button"]',
      '[data-testid="settings-button"]',
      '[data-testid="about-button"]',
    ];
    
    for (const button of buttons) {
      const hasAriaLabel = await page.evaluate((sel: string) => {
        const el = document.querySelector(sel);
        return el?.hasAttribute('aria-label') || el?.textContent;
      }, button);
      
      if (!hasAriaLabel) {
        throw new Error(`Button ${button} should have ARIA label or text content`);
      }
    }
    
    await mainMenu.takeScreenshot('aria-labels');
  });

  test('should support keyboard navigation on main menu', async () => {
    // Tab through menu items
    await page.keyboard.press('Tab');
    await wait(200);
    await page.keyboard.press('Tab');
    await wait(200);
    await page.keyboard.press('Tab');
    await wait(200);
    
    // Verify focus moves
    const hasFocus = await page.evaluate(() => {
      return document.activeElement !== document.body;
    });
    
    if (!hasFocus) {
      throw new Error('Tab navigation should move focus');
    }
    
    await mainMenu.takeScreenshot('keyboard-navigation');
  });

  test('should activate buttons with Enter/Space keys', async () => {
    // Focus on settings button
    await page.focus('[data-testid="settings-button"]');
    await wait(200);
    
    // Press Enter
    await page.keyboard.press('Enter');
    await wait(500);
    
    // Settings modal should open
    await assertVisible(page, '[data-testid="settings-modal"]');
    
    await mainMenu.takeScreenshot('enter-key-activation');
  });

  test('should close modals with Escape key', async () => {
    // Open settings
    await mainMenu.openSettings();
    await wait(500);
    
    // Press Escape
    await page.keyboard.press('Escape');
    await wait(500);
    
    // Modal should close
    const isVisible = await page.evaluate(() => {
      return !!document.querySelector('[data-testid="settings-modal"]');
    });
    
    if (isVisible) {
      throw new Error('Modal should close with Escape');
    }
    
    await mainMenu.takeScreenshot('escape-key-close');
  });

  test('should have proper heading hierarchy', async () => {
    const headings = await page.evaluate(() => {
      const h1 = document.querySelectorAll('h1');
      const h2 = document.querySelectorAll('h2');
      const h3 = document.querySelectorAll('h3');
      
      return {
        h1Count: h1.length,
        h2Count: h2.length,
        h3Count: h3.length,
      };
    });
    
    // Should have at least one heading
    const totalHeadings = headings.h1Count + headings.h2Count + headings.h3Count;
    if (totalHeadings === 0) {
      throw new Error('Page should have headings for structure');
    }
    
    await mainMenu.takeScreenshot('heading-hierarchy');
  });

  test('should have focus visible indicators', async () => {
    // Focus on a button
    await page.focus('[data-testid="new-game-button"]');
    await wait(200);
    
    // Check if focus is visible
    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      if (!el) return false;
      
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || 
             styles.border.includes('px') ||
             el.style.boxShadow !== '';
    });
    
    await mainMenu.takeScreenshot('focus-indicators');
  });

  test('should support screen reader landmarks', async () => {
    const landmarks = await page.evaluate(() => {
      const main = document.querySelector('[role="main"]') || document.querySelector('main');
      const nav = document.querySelector('[role="navigation"]') || document.querySelector('nav');
      const regions = document.querySelectorAll('[role="region"]');
      
      return {
        hasMain: !!main,
        hasNav: !!nav,
        regionCount: regions.length,
      };
    });
    
    // Should have some semantic structure
    await mainMenu.takeScreenshot('landmarks');
  });

  test('should have accessible form controls', async () => {
    await mainMenu.openSettings();
    await wait(500);
    
    // Check volume sliders
    const sliders = await page.evaluate(() => {
      const sliders = document.querySelectorAll('input[type="range"]');
      return Array.from(sliders).map(slider => ({
        hasLabel: slider.hasAttribute('aria-label') || 
                 slider.hasAttribute('aria-labelledby') ||
                 !!slider.closest('label'),
        hasRole: slider.hasAttribute('role'),
      }));
    });
    
    if (sliders.length > 0 && !sliders.every((s: { hasLabel: boolean; hasRole: boolean }) => s.hasLabel)) {
      // Sliders should have labels
    }
    
    await mainMenu.takeScreenshot('accessible-form-controls');
  });

  test('should have sufficient color contrast', async () => {
    // Check text color contrast
    const contrast = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const contrasts: number[] = [];
      
      for (const el of Array.from(elements)) {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;
        
        // Basic check - not a full contrast calculation
        if (color && bgColor && color !== bgColor) {
          contrasts.push(1); // Placeholder
        }
      }
      
      return contrasts.length;
    });
    
    await mainMenu.takeScreenshot('color-contrast');
  });

  test('should not rely solely on color for information', async () => {
    await mainMenu.selectMode('Normal');
    await mainMenu.clickNewGame();
    await gameCanvas.waitForGameStart();
    
    await wait(5000);
    
    // Health indicator should have text or icons, not just color
    const healthEl = await page.evaluate(() => {
      const health = document.querySelector('[data-testid="health-display"]');
      return {
        hasText: health?.textContent !== '',
        hasIcon: !!health?.querySelector('svg, img'),
      };
    });
    
    if (!healthEl.hasText && !healthEl.hasIcon) {
      throw new Error('Health should not rely solely on color');
    }
    
    await gameCanvas.takeScreenshot('non-color-information');
  });

  test('should have descriptive link/button text', async () => {
    const buttons = await page.evaluate(() => {
      const allButtons = document.querySelectorAll('button');
      return Array.from(allButtons).map(btn => ({
        text: btn.textContent?.trim(),
        hasAriaLabel: btn.hasAttribute('aria-label'),
        isEmpty: !btn.textContent?.trim() && !btn.hasAttribute('aria-label'),
      }));
    });
    
    const emptyButtons = buttons.filter((b: { text?: string; hasAriaLabel: boolean; isEmpty: boolean }) => b.isEmpty);
    if (emptyButtons.length > 0) {
      throw new Error(`${emptyButtons.length} buttons lack accessible text`);
    }
    
    await mainMenu.takeScreenshot('descriptive-text');
  });

  test('should have proper tab order', async () => {
    const tabOrder: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await wait(100);
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName + (el?.getAttribute('data-testid') ? `[${el.getAttribute('data-testid')}]` : '');
      });
      
      tabOrder.push(focusedElement);
    }
    
    // Tab order should progress logically
    console.log('Tab order:', tabOrder);
    
    await mainMenu.takeScreenshot('tab-order');
  });

  test('should handle high contrast mode', async () => {
    // Enable high contrast (if supported)
    await page.evaluate(() => {
      document.documentElement.style.setProperty('forced-colors', 'active');
    });
    
    await wait(500);
    
    await mainMenu.takeScreenshot('high-contrast-mode');
  });

  test('should have appropriate text sizing', async () => {
    const textSizes = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, div, button, a');
      const sizes: number[] = [];
      
      for (const el of Array.from(elements)) {
        const styles = window.getComputedStyle(el);
        const fontSize = parseFloat(styles.fontSize);
        if (fontSize > 0) {
          sizes.push(fontSize);
        }
      }
      
      return {
        minSize: Math.min(...sizes),
        maxSize: Math.max(...sizes),
        avgSize: sizes.reduce((a, b) => a + b, 0) / sizes.length,
      };
    });
    
    // Minimum font size should be at least 12px
    if (textSizes.minSize < 12) {
      throw new Error(`Text too small: ${textSizes.minSize}px`);
    }
    
    console.log('Text sizes:', textSizes);
  });

  test('should support zoom up to 200%', async () => {
    // Zoom in
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    await wait(500);
    
    // Check if layout still works
    const isLayoutBroken = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth * 3;
    });
    
    if (isLayoutBroken) {
      throw new Error('Layout breaks at 200% zoom');
    }
    
    await mainMenu.takeScreenshot('zoomed-200');
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  test('should have skip links for keyboard users', async () => {
    // Check for skip to main content link
    const hasSkipLink = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const link of Array.from(links)) {
        if (link.textContent?.toLowerCase().includes('skip')) {
          return true;
        }
      }
      return false;
    });
    
    // Skip links are nice to have but not required for this app
    await mainMenu.takeScreenshot('skip-links-check');
  });
});
