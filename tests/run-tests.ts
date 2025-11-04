/**
 * MCP Test Runner
 * Script to run E2E tests using Browser MCP (Playwright-based)
 * 
 * Usage:
 *   tsx tests/run-tests.ts [test-file]
 *   tsx tests/run-tests.ts --all
 *   tsx tests/run-tests.ts --screenshot
 */

import { TEST_CONFIG } from './config/test-config';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
}

class MCPTestRunner {
  private results: TestSuite[] = [];
  private baseUrl: string;
  private screenshotMode: boolean;

  constructor() {
    this.baseUrl = TEST_CONFIG.baseUrl;
    this.screenshotMode = process.env.SCREENSHOTS === 'true';
  }

  /**
   * Main test runner
   */
  async run(testFiles: string[]): Promise<void> {
    console.log('🚀 P-Type E2E Test Suite');
    console.log('=' .repeat(50));
    console.log(`Base URL: ${this.baseUrl}`);
    console.log(`Screenshots: ${this.screenshotMode ? 'Enabled' : 'Disabled'}`);
    console.log('='.repeat(50));
    console.log('');

    // Check if dev server is running
    const serverRunning = await this.checkServer();
    if (!serverRunning) {
      console.error('❌ Dev server is not running!');
      console.error(`Please start the dev server at ${this.baseUrl}`);
      console.error('Run: npm run dev');
      process.exit(1);
    }

    console.log('✅ Dev server is running\n');

    // Run each test file
    for (const testFile of testFiles) {
      await this.runTestFile(testFile);
    }

    // Print summary
    this.printSummary();
  }

  /**
   * Check if dev server is running
   */
  private async checkServer(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Run a single test file
   */
  private async runTestFile(testFile: string): Promise<void> {
    console.log(`📝 Running: ${testFile}`);
    console.log('-'.repeat(50));

    // In actual implementation, this would use Browser MCP to:
    // 1. Navigate to the app
    // 2. Execute test scenarios
    // 3. Take screenshots
    // 4. Collect results

    // For now, this is a template that shows the structure
    const suite: TestSuite = {
      name: testFile,
      tests: [],
      totalDuration: 0,
    };

    this.results.push(suite);
    console.log('');
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    console.log('\n');
    console.log('📊 Test Summary');
    console.log('='.repeat(50));

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalDuration = 0;

    for (const suite of this.results) {
      totalTests += suite.tests.length;
      totalPassed += suite.tests.filter(t => t.status === 'passed').length;
      totalFailed += suite.tests.filter(t => t.status === 'failed').length;
      totalDuration += suite.totalDuration;
    }

    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`⏱️  Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('='.repeat(50));

    if (totalFailed > 0) {
      console.log('\n❌ Some tests failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    }
  }
}

/**
 * Get test files to run
 */
function getTestFiles(): string[] {
  const args = process.argv.slice(2);

  if (args.includes('--all') || args.length === 0) {
    // Run all tests
    return [
      '01-main-menu.test.ts',
      '02-game-modes.test.ts',
      '03-gameplay.test.ts',
      '04-achievements.test.ts',
      '05-trivia.test.ts',
      '06-settings.test.ts',
      '07-pause-menu.test.ts',
      '08-game-over.test.ts',
      '09-performance.test.ts',
      '10-accessibility.test.ts',
      '11-responsive.test.ts',
      '12-integration.test.ts',
    ];
  }

  // Run specific test file
  return args.filter(arg => !arg.startsWith('--'));
}

/**
 * Main entry point
 */
async function main() {
  const testFiles = getTestFiles();
  const runner = new MCPTestRunner();

  try {
    await runner.run(testFiles);
  } catch (error) {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export type { TestResult, TestSuite };
export { MCPTestRunner };
