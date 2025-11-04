# E2E Testing Suite for P-Type

This folder contains comprehensive end-to-end tests for the P-Type typing game using Browser MCP (Playwright-based).

## Test Structure

### Test Files
- `01-main-menu.test.ts` - Main menu navigation and UI tests
- `02-game-modes.test.ts` - Game mode selection and initialization
- `03-gameplay.test.ts` - Core gameplay mechanics and interactions
- `04-achievements.test.ts` - Achievement system and unlocks
- `05-trivia.test.ts` - Trivia overlay and question answering
- `06-settings.test.ts` - Settings and preferences
- `07-pause-menu.test.ts` - Pause functionality and menu
- `08-game-over.test.ts` - Game over screen and restart
- `09-performance.test.ts` - Performance and resource loading
- `10-accessibility.test.ts` - Accessibility features and ARIA
- `11-responsive.test.ts` - Responsive design and layouts
- `12-integration.test.ts` - Full user journey integration tests

### Utilities
- `helpers/test-helpers.ts` - Shared test utilities and helpers
- `helpers/page-objects.ts` - Page object models for common UI elements
- `helpers/assertions.ts` - Custom assertion helpers
- `config/test-config.ts` - Test configuration and constants

## Running Tests

### Prerequisites
1. Start the development server:
   ```bash
   npm run dev
   ```

2. The dev server should be running at `http://localhost:5173` (or your configured port)

### Execute Tests
```bash
# Run all tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- tests/01-main-menu.test.ts

# Run with screenshots
npm run test:e2e -- --screenshot

# Run in headed mode (visible browser)
npm run test:e2e -- --headed
```

## Test Coverage

### Main Menu
- ✓ Logo and title display
- ✓ Button states and interactions
- ✓ Mode selection dropdown
- ✓ Navigation to different screens

### Gameplay
- ✓ Word spawning and destruction
- ✓ Typing mechanics
- ✓ Target switching (Tab key)
- ✓ EMP weapon activation
- ✓ Health and shield system
- ✓ Level progression

### UI Components
- ✓ HUD elements (health, score, level)
- ✓ Achievement toasts
- ✓ Trivia overlays
- ✓ Pause menu
- ✓ Game over screen
- ✓ Settings modal

### Performance
- ✓ Initial load time
- ✓ 3D asset loading
- ✓ Frame rate during gameplay
- ✓ Memory usage
- ✓ Network requests

### Accessibility
- ✓ Keyboard navigation
- ✓ ARIA labels and roles
- ✓ Focus management
- ✓ Screen reader compatibility

## Writing New Tests

### Test Template
```typescript
import { test, expect } from './helpers/test-helpers';
import { MainMenuPage } from './helpers/page-objects';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const mainMenu = new MainMenuPage(page);
    
    // Act
    await mainMenu.clickNewGame();
    
    // Assert
    await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
  });
});
```

### Best Practices
1. Use data-testid attributes for reliable selectors
2. Wait for network idle before interactions
3. Take screenshots on failures for debugging
4. Keep tests independent and isolated
5. Use page objects for reusable UI interactions
6. Test both happy paths and error cases

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run preview &
      - run: npm run test:e2e
```

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase timeout in test config
- Check if dev server is running
- Verify network connectivity

**Flaky tests**
- Add explicit waits for animations
- Use waitForLoadState appropriately
- Check for race conditions

**Screenshot mismatches**
- Update baseline screenshots
- Check for environment differences
- Verify browser version consistency

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Browser MCP Guide](https://github.com/microsoft/playwright-mcp)
