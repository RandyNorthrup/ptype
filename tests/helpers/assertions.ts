/**
 * Custom Assertions
 * Helper functions for common test assertions
 */

import { TEST_CONFIG } from '../config/test-config';

/**
 * Assert element is visible
 */
export async function assertVisible(page: any, selector: string, message?: string): Promise<void> {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(message || `Element ${selector} not found`);
  }
  
  const isVisible = await element.isVisible();
  if (!isVisible) {
    throw new Error(message || `Element ${selector} is not visible`);
  }
}

/**
 * Assert element is not visible
 */
export async function assertNotVisible(page: any, selector: string, message?: string): Promise<void> {
  try {
    const element = await page.$(selector);
    if (element) {
      const isVisible = await element.isVisible();
      if (isVisible) {
        throw new Error(message || `Element ${selector} should not be visible`);
      }
    }
  } catch {
    // Element not found is acceptable
  }
}

/**
 * Assert text content matches
 */
export async function assertTextContent(
  page: any, 
  selector: string, 
  expected: string | RegExp,
  message?: string
): Promise<void> {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(message || `Element ${selector} not found`);
  }
  
  const text = await element.textContent();
  
  if (typeof expected === 'string') {
    if (text !== expected) {
      throw new Error(message || `Expected "${expected}" but got "${text}"`);
    }
  } else {
    if (!expected.test(text || '')) {
      throw new Error(message || `Text "${text}" does not match pattern ${expected}`);
    }
  }
}

/**
 * Assert element has attribute
 */
export async function assertHasAttribute(
  page: any, 
  selector: string, 
  attribute: string,
  value?: string,
  message?: string
): Promise<void> {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(message || `Element ${selector} not found`);
  }
  
  const attrValue = await element.getAttribute(attribute);
  
  if (attrValue === null) {
    throw new Error(message || `Element ${selector} does not have attribute ${attribute}`);
  }
  
  if (value !== undefined && attrValue !== value) {
    throw new Error(message || `Expected attribute ${attribute} to be "${value}" but got "${attrValue}"`);
  }
}

/**
 * Assert element is enabled
 */
export async function assertEnabled(page: any, selector: string, message?: string): Promise<void> {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(message || `Element ${selector} not found`);
  }
  
  const disabled = await element.getAttribute('disabled');
  if (disabled !== null) {
    throw new Error(message || `Element ${selector} is disabled`);
  }
}

/**
 * Assert element is disabled
 */
export async function assertDisabled(page: any, selector: string, message?: string): Promise<void> {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(message || `Element ${selector} not found`);
  }
  
  const disabled = await element.getAttribute('disabled');
  if (disabled === null) {
    throw new Error(message || `Element ${selector} is not disabled`);
  }
}

/**
 * Assert element count
 */
export async function assertElementCount(
  page: any, 
  selector: string, 
  expected: number,
  message?: string
): Promise<void> {
  const elements = await page.$$(selector);
  const count = elements.length;
  
  if (count !== expected) {
    throw new Error(message || `Expected ${expected} elements but found ${count}`);
  }
}

/**
 * Assert URL matches
 */
export async function assertURL(
  page: any, 
  expected: string | RegExp,
  message?: string
): Promise<void> {
  const url = page.url();
  
  if (typeof expected === 'string') {
    if (url !== expected) {
      throw new Error(message || `Expected URL "${expected}" but got "${url}"`);
    }
  } else {
    if (!expected.test(url)) {
      throw new Error(message || `URL "${url}" does not match pattern ${expected}`);
    }
  }
}

/**
 * Assert no console errors
 */
export async function assertNoConsoleErrors(errors: string[], message?: string): Promise<void> {
  if (errors.length > 0) {
    throw new Error(message || `Found ${errors.length} console errors: ${errors.join(', ')}`);
  }
}

/**
 * Assert performance metric
 */
export async function assertPerformance(
  value: number,
  threshold: number,
  metric: string,
  message?: string
): Promise<void> {
  if (value > threshold) {
    throw new Error(
      message || `${metric} exceeded threshold: ${value}ms > ${threshold}ms`
    );
  }
}

/**
 * Assert FPS is acceptable
 */
export async function assertFPS(fps: number, message?: string): Promise<void> {
  if (fps < TEST_CONFIG.performance.minFPS) {
    throw new Error(
      message || `FPS too low: ${fps} < ${TEST_CONFIG.performance.minFPS}`
    );
  }
}

/**
 * Assert memory usage is within limits
 */
export async function assertMemoryUsage(usage: number, message?: string): Promise<void> {
  if (usage > TEST_CONFIG.performance.maxMemoryUsage) {
    const usageMB = (usage / 1024 / 1024).toFixed(2);
    const maxMB = (TEST_CONFIG.performance.maxMemoryUsage / 1024 / 1024).toFixed(2);
    throw new Error(
      message || `Memory usage too high: ${usageMB}MB > ${maxMB}MB`
    );
  }
}

/**
 * Assert canvas is rendering
 */
export async function assertCanvasRendering(page: any, message?: string): Promise<void> {
  const isRendering = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;
    
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    return gl !== null;
  });
  
  if (!isRendering) {
    throw new Error(message || 'Canvas is not rendering');
  }
}

/**
 * Assert game state
 */
export async function assertGameState(
  page: any,
  expectedState: Record<string, any>,
  message?: string
): Promise<void> {
  const state = await page.evaluate(() => {
    const store = (window as any).__gameStore__;
    return store ? store.getState() : null;
  });
  
  if (!state) {
    throw new Error(message || 'Game state not found');
  }
  
  for (const [key, value] of Object.entries(expectedState)) {
    if (state[key] !== value) {
      throw new Error(
        message || `Expected state.${key} to be ${value} but got ${state[key]}`
      );
    }
  }
}

/**
 * Assert element has focus
 */
export async function assertHasFocus(page: any, selector: string, message?: string): Promise<void> {
  const hasFocus = await page.evaluate((sel: string) => {
    const element = document.querySelector(sel);
    return element === document.activeElement;
  }, selector);
  
  if (!hasFocus) {
    throw new Error(message || `Element ${selector} does not have focus`);
  }
}

/**
 * Assert accessibility
 */
export async function assertAccessibility(
  page: any,
  selector?: string,
  message?: string
): Promise<void> {
  // This would integrate with an accessibility testing library
  // For now, just check basic ARIA attributes
  const element = selector ? await page.$(selector) : null;
  const root = element || page;
  
  const hasARIA = await root.evaluate((el: Element | null) => {
    const element = el || document.body;
    const ariaLabels = element.querySelectorAll('[aria-label]');
    const roles = element.querySelectorAll('[role]');
    return ariaLabels.length > 0 || roles.length > 0;
  });
  
  if (!hasARIA) {
    throw new Error(message || 'No ARIA attributes found');
  }
}

/**
 * Assert score increased
 */
export async function assertScoreIncreased(
  previousScore: number,
  currentScore: number,
  message?: string
): Promise<void> {
  if (currentScore <= previousScore) {
    throw new Error(
      message || `Score did not increase: ${previousScore} -> ${currentScore}`
    );
  }
}

/**
 * Assert health decreased
 */
export async function assertHealthDecreased(
  previousHealth: number,
  currentHealth: number,
  message?: string
): Promise<void> {
  if (currentHealth >= previousHealth) {
    throw new Error(
      message || `Health did not decrease: ${previousHealth} -> ${currentHealth}`
    );
  }
}

/**
 * Assert level advanced
 */
export async function assertLevelAdvanced(
  previousLevel: number,
  currentLevel: number,
  message?: string
): Promise<void> {
  if (currentLevel !== previousLevel + 1) {
    throw new Error(
      message || `Level did not advance correctly: ${previousLevel} -> ${currentLevel}`
    );
  }
}
