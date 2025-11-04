/**
 * Test Configuration
 * Central configuration for all E2E tests
 */

export const TEST_CONFIG = {
  // Base URL for the application
  baseUrl: (typeof process !== 'undefined' ? process.env.TEST_BASE_URL : undefined) || 'http://localhost:5173',
  
  // Timeouts
  timeouts: {
    default: 30000, // 30 seconds
    long: 60000, // 60 seconds for heavy operations
    short: 5000, // 5 seconds for quick operations
    animation: 1000, // 1 second for animations
  },
  
  // Test data
  testData: {
    // Sample words for different modes
    normalWords: ['hello', 'world', 'typing', 'game', 'test'],
    pythonWords: ['def', 'class', 'import', 'return', 'self'],
    javascriptWords: ['function', 'const', 'let', 'async', 'await'],
    
    // Test user profiles
    testProfile: {
      name: 'TestPlayer',
    },
  },
  
  // Viewport sizes for responsive testing
  viewports: {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1366, height: 768 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },
  
  // Screenshot configuration
  screenshots: {
    enabled: (typeof process !== 'undefined' ? process.env.SCREENSHOTS : undefined) === 'true',
    path: './tests/screenshots',
    fullPage: true,
  },
  
  // Performance thresholds
  performance: {
    maxLoadTime: 5000, // 5 seconds
    maxFirstContentfulPaint: 2000, // 2 seconds
    minFPS: 30, // Minimum acceptable FPS
    maxMemoryUsage: 200 * 1024 * 1024, // 200MB
  },
  
  // Accessibility configuration
  accessibility: {
    standards: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    excludeRules: [], // Rules to exclude from testing
  },
  
  // Game-specific settings
  game: {
    initialLives: 3,
    initialLevel: 1,
    empCooldown: 10000, // 10 seconds
    bossLevelInterval: 3, // Boss every 3 levels
  },
  
  // Browser configuration
  browser: {
    headless: (typeof process !== 'undefined' ? process.env.HEADED : undefined) !== 'true',
    slowMo: (typeof process !== 'undefined' && process.env.SLOW_MO) ? parseInt(process.env.SLOW_MO) : 0,
    video: (typeof process !== 'undefined' ? process.env.VIDEO : undefined) === 'true',
  },
};

export type TestConfig = typeof TEST_CONFIG;
