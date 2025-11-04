/**
 * Practical E2E Test Example using Browser MCP
 * 
 * This file demonstrates actual usage of Browser MCP tools
 * for testing the P-Type typing game.
 * 
 * These tests can be executed by an AI assistant with Browser MCP access.
 */

export const TEST_SCENARIOS = {
  /**
   * Test 1: Main Menu Navigation
   */
  mainMenuNavigation: {
    name: 'Main Menu Navigation',
    description: 'Test main menu UI and navigation',
    steps: [
      {
        action: 'navigate',
        url: 'http://localhost:5173',
        description: 'Navigate to P-Type application'
      },
      {
        action: 'snapshot',
        description: 'Take snapshot of main menu'
      },
      {
        action: 'screenshot',
        filename: 'tests/screenshots/main-menu.png',
        description: 'Capture main menu screenshot'
      },
      {
        action: 'click',
        element: 'mode selector button',
        ref: '[data-testid="mode-selector-button"]',
        description: 'Open mode selector dropdown'
      },
      {
        action: 'wait',
        time: 1,
        description: 'Wait for dropdown animation'
      },
      {
        action: 'screenshot',
        filename: 'tests/screenshots/mode-dropdown-open.png',
        description: 'Capture dropdown state'
      },
      {
        action: 'click',
        element: 'Normal mode option',
        ref: '[data-testid="mode-option-normal"]',
        description: 'Select Normal mode'
      },
      {
        action: 'evaluate',
        function: '() => { const btn = document.querySelector("[data-testid=\'mode-selector-button\']"); return btn?.textContent; }',
        expected: 'Normal',
        description: 'Verify Normal mode is selected'
      }
    ]
  },

  /**
   * Test 2: Start Game
   */
  startGame: {
    name: 'Start New Game',
    description: 'Test starting a new game in Normal mode',
    steps: [
      {
        action: 'navigate',
        url: 'http://localhost:5173',
        description: 'Navigate to application'
      },
      {
        action: 'click',
        element: 'mode selector button',
        ref: '[data-testid="mode-selector-button"]',
        description: 'Open mode selector'
      },
      {
        action: 'click',
        element: 'Normal mode',
        ref: '[data-testid="mode-option-normal"]',
        description: 'Select Normal mode'
      },
      {
        action: 'click',
        element: 'new game button',
        ref: '[data-testid="new-game-button"]',
        description: 'Click NEW GAME button'
      },
      {
        action: 'wait',
        time: 3,
        description: 'Wait for game to load'
      },
      {
        action: 'snapshot',
        description: 'Take snapshot of game canvas'
      },
      {
        action: 'screenshot',
        filename: 'tests/screenshots/game-started.png',
        description: 'Capture game start state'
      },
      {
        action: 'evaluate',
        function: '() => { return !!document.querySelector("canvas"); }',
        expected: true,
        description: 'Verify canvas is present'
      }
    ]
  },

  /**
   * Test 3: Gameplay Typing
   */
  gameplayTyping: {
    name: 'Gameplay - Type and Destroy Words',
    description: 'Test typing mechanics and word destruction',
    steps: [
      {
        action: 'navigate',
        url: 'http://localhost:5173',
        description: 'Navigate to app'
      },
      // Start game (reuse previous steps)
      {
        action: 'click',
        element: 'mode selector',
        ref: '[data-testid="mode-selector-button"]',
        description: 'Open mode selector'
      },
      {
        action: 'click',
        element: 'Normal mode',
        ref: '[data-testid="mode-option-normal"]',
        description: 'Select mode'
      },
      {
        action: 'click',
        element: 'new game',
        ref: '[data-testid="new-game-button"]',
        description: 'Start game'
      },
      {
        action: 'wait',
        time: 5,
        description: 'Wait for enemies to spawn'
      },
      {
        action: 'screenshot',
        filename: 'tests/screenshots/enemies-spawned.png',
        description: 'Capture enemy spawn'
      },
      {
        action: 'type',
        element: 'game input',
        ref: 'body',
        text: 'hello',
        slowly: true,
        description: 'Type word slowly'
      },
      {
        action: 'wait',
        time: 1,
        description: 'Wait for word destruction'
      },
      {
        action: 'screenshot',
        filename: 'tests/screenshots/word-destroyed.png',
        description: 'Capture after typing'
      }
    ]
  },

  /**
   * Test 4: EMP Weapon
   */
  empWeapon: {
    name: 'EMP Weapon Activation',
    description: 'Test EMP weapon functionality',
    steps: [
      // ... (start game steps)
      {
        action: 'wait',
        time: 5,
        description: 'Wait for game state'
      },
      {
        action: 'press_key',
        key: 'Enter',
        description: 'Activate EMP weapon'
      },
      {
        action: 'wait',
        time: 1,
        description: 'Wait for EMP effect'
      },
      {
        action: 'screenshot',
        filename: 'tests/screenshots/emp-activated.png',
        description: 'Capture EMP activation'
      },
      {
        action: 'evaluate',
        function: '() => { const cooldown = document.querySelector("[data-testid=\'emp-cooldown\']"); return cooldown?.textContent; }',
        expected: /\d+/,  // Should show countdown
        description: 'Verify EMP cooldown'
      }
    ]
  },

  /**
   * Test 5: Pause Menu
   */
  pauseMenu: {
    name: 'Pause Menu Functionality',
    description: 'Test pausing and resuming game',
    steps: [
      // ... (start game steps)
      {
        action: 'wait',
        time: 3,
        description: 'Wait for game to start'
      },
      {
        action: 'press_key',
        key: 'Escape',
        description: 'Pause game'
      },
      {
        action: 'wait',
        time: 0.5,
        description: 'Wait for pause menu'
      },
      {
        action: 'snapshot',
        description: 'Take snapshot of pause menu'
      },
      {
        action: 'screenshot',
        filename: 'tests/screenshots/game-paused.png',
        description: 'Capture pause menu'
      },
      {
        action: 'evaluate',
        function: '() => { return !!document.querySelector("[data-testid=\'pause-menu\']"); }',
        expected: true,
        description: 'Verify pause menu visible'
      },
      {
        action: 'click',
        element: 'resume button',
        ref: '[data-testid="resume-button"]',
        description: 'Click Resume'
      },
      {
        action: 'wait',
        time: 0.5,
        description: 'Wait for resume'
      },
      {
        action: 'screenshot',
        filename: 'tests/screenshots/game-resumed.png',
        description: 'Capture resumed game'
      }
    ]
  },

  /**
   * Test 6: Performance Check
   */
  performance: {
    name: 'Performance Monitoring',
    description: 'Check FPS and console errors',
    steps: [
      {
        action: 'navigate',
        url: 'http://localhost:5173',
        description: 'Navigate to app'
      },
      {
        action: 'console_messages',
        onlyErrors: true,
        description: 'Check for console errors'
      },
      {
        action: 'evaluate',
        function: `() => {
          return new Promise((resolve) => {
            let frames = 0;
            const start = performance.now();
            function count() {
              frames++;
              if (performance.now() - start < 1000) {
                requestAnimationFrame(count);
              } else {
                resolve(frames);
              }
            }
            requestAnimationFrame(count);
          });
        }`,
        expected: (fps: number) => fps >= 30,
        description: 'Measure FPS (should be 30+)'
      },
      {
        action: 'evaluate',
        function: '() => { return performance.memory ? performance.memory.usedJSHeapSize : 0; }',
        description: 'Check memory usage'
      }
    ]
  },

  /**
   * Test 7: Settings Modal
   */
  settings: {
    name: 'Settings Modal',
    description: 'Test settings menu',
    steps: [
      {
        action: 'navigate',
        url: 'http://localhost:5173',
        description: 'Navigate to app'
      },
      {
        action: 'click',
        element: 'settings button',
        ref: '[data-testid="settings-button"]',
        description: 'Open settings'
      },
      {
        action: 'wait',
        time: 0.5,
        description: 'Wait for modal animation'
      },
      {
        action: 'screenshot',
        filename: 'tests/screenshots/settings-modal.png',
        description: 'Capture settings modal'
      },
      {
        action: 'evaluate',
        function: '() => { return !!document.querySelector("[data-testid=\'settings-modal\']"); }',
        expected: true,
        description: 'Verify settings modal visible'
      }
    ]
  },

  /**
   * Test 8: About Modal
   */
  about: {
    name: 'About Modal',
    description: 'Test about information display',
    steps: [
      {
        action: 'navigate',
        url: 'http://localhost:5173',
        description: 'Navigate to app'
      },
      {
        action: 'click',
        element: 'about button',
        ref: '[data-testid="about-button"]',
        description: 'Open about modal'
      },
      {
        action: 'wait',
        time: 0.5,
        description: 'Wait for modal'
      },
      {
        action: 'screenshot',
        filename: 'tests/screenshots/about-modal.png',
        description: 'Capture about modal'
      },
      {
        action: 'evaluate',
        function: '() => { const text = document.body.textContent; return text.includes("P-Type") && text.includes("2.0.0"); }',
        expected: true,
        description: 'Verify version info present'
      }
    ]
  }
};

/**
 * Export test scenarios in a format ready for execution
 */
export function getTestScenario(name: keyof typeof TEST_SCENARIOS) {
  return TEST_SCENARIOS[name];
}

/**
 * Get all test scenarios
 */
export function getAllTestScenarios() {
  return Object.values(TEST_SCENARIOS);
}
