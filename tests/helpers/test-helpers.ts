/**
 * Test Helpers
 * Shared utilities and helper functions for E2E tests
 */

import { TEST_CONFIG } from '../config/test-config';

/**
 * Wait for a specific time
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for animations to complete
 */
export async function waitForAnimations(): Promise<void> {
  await wait(TEST_CONFIG.timeouts.animation);
}

/**
 * Generate a random test ID
 */
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if an element is visible in the viewport
 */
export async function isElementInViewport(element: any): Promise<boolean> {
  const box = await element.boundingBox();
  if (!box) return false;
  
  return box.y >= 0 && box.x >= 0;
}

/**
 * Take a screenshot with timestamp
 */
export async function takeScreenshot(page: any, name: string): Promise<void> {
  if (!TEST_CONFIG.screenshots.enabled) return;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  
  await page.screenshot({
    path: `${TEST_CONFIG.screenshots.path}/${filename}`,
    fullPage: TEST_CONFIG.screenshots.fullPage,
  });
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: any): Promise<void> {
  await page.waitForLoadState('networkidle', {
    timeout: TEST_CONFIG.timeouts.default,
  });
}

/**
 * Get console errors from the page
 */
export async function getConsoleErrors(page: any): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Check if the game is loaded
 */
export async function isGameLoaded(page: any): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="main-menu-logo"]', {
      state: 'visible',
      timeout: TEST_CONFIG.timeouts.default,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Navigate to the application
 */
export async function navigateToApp(page: any): Promise<void> {
  await page.goto(TEST_CONFIG.baseUrl);
  await waitForNetworkIdle(page);
}

/**
 * Press a key sequence
 */
export async function pressKeys(page: any, keys: string[]): Promise<void> {
  for (const key of keys) {
    await page.keyboard.press(key);
    await wait(100); // Small delay between keypresses
  }
}

/**
 * Type text with realistic timing
 */
export async function typeRealistic(page: any, text: string, wpm: number = 60): Promise<void> {
  const delayMs = (60000 / wpm) / 5; // Average word is ~5 characters
  
  for (const char of text) {
    await page.keyboard.type(char);
    await wait(delayMs);
  }
}

/**
 * Wait for element to be stable (not moving)
 */
export async function waitForStable(element: any, timeout: number = 1000): Promise<void> {
  let lastPosition: any = null;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const box = await element.boundingBox();
    
    if (lastPosition && 
        Math.abs(box.x - lastPosition.x) < 1 && 
        Math.abs(box.y - lastPosition.y) < 1) {
      return;
    }
    
    lastPosition = box;
    await wait(100);
  }
}

/**
 * Get current FPS
 */
export async function getFPS(page: any, duration: number = 1000): Promise<number> {
  return await page.evaluate((duration) => {
    return new Promise<number>((resolve) => {
      let frameCount = 0;
      let startTime = performance.now();
      
      function countFrame() {
        frameCount++;
        const elapsed = performance.now() - startTime;
        
        if (elapsed < duration) {
          requestAnimationFrame(countFrame);
        } else {
          const fps = (frameCount / elapsed) * 1000;
          resolve(Math.round(fps));
        }
      }
      
      requestAnimationFrame(countFrame);
    });
  }, duration);
}

/**
 * Check for memory leaks
 */
export async function getMemoryUsage(page: any): Promise<number> {
  const metrics = await page.metrics();
  return metrics.JSHeapUsedSize;
}

/**
 * Wait for canvas to be ready
 */
export async function waitForCanvas(page: any): Promise<void> {
  await page.waitForSelector('canvas', {
    state: 'visible',
    timeout: TEST_CONFIG.timeouts.long,
  });
  
  // Wait for WebGL context to initialize
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return resolve();
      
      const checkGL = () => {
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        if (gl) {
          resolve();
        } else {
          setTimeout(checkGL, 100);
        }
      };
      
      checkGL();
    });
  });
}

/**
 * Get game state from Zustand store
 */
export async function getGameState(page: any): Promise<any> {
  return await page.evaluate(() => {
    // Access Zustand store from window (if exposed)
    const store = (window as any).__gameStore__;
    return store ? store.getState() : null;
  });
}

/**
 * Set game state in Zustand store
 */
export async function setGameState(page: any, state: any): Promise<void> {
  await page.evaluate((state) => {
    const store = (window as any).__gameStore__;
    if (store) {
      store.setState(state);
    }
  }, state);
}

/**
 * Mock API responses
 */
export async function mockAPIResponse(
  page: any, 
  url: string, 
  response: any
): Promise<void> {
  await page.route(url, (route: any) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Assert no console errors
 */
export function assertNoConsoleErrors(errors: string[]): void {
  if (errors.length > 0) {
    throw new Error(`Console errors found: ${errors.join(', ')}`);
  }
}

/**
 * Retry an action with exponential backoff
 */
export async function retry<T>(
  action: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await wait(delay);
      }
    }
  }
  
  throw lastError;
}
