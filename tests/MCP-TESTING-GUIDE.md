# E2E Testing with Browser MCP - Quick Start Guide

This guide shows you how to run E2E tests for P-Type using Browser MCP tools.

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app should be running at `http://localhost:5173`

2. **Ensure Browser MCP tools are available** in your AI assistant

## Running Tests Manually

### Test 1: Main Menu Navigation

```typescript
// 1. Navigate to the app
await mcp_microsoft_pla_browser_navigate({
  url: "http://localhost:5173"
})

// 2. Take a snapshot to see the page structure
await mcp_microsoft_pla_browser_snapshot()

// 3. Take a screenshot
await mcp_microsoft_pla_browser_take_screenshot({
  filename: "tests/screenshots/main-menu.png"
})

// 4. Click the mode selector button
await mcp_microsoft_pla_browser_click({
  element: "mode selector button",
  ref: "[data-testid='mode-selector-button']"
})

// 5. Wait for dropdown to appear
await mcp_microsoft_pla_browser_wait_for({ time: 1 })

// 6. Select Normal mode
await mcp_microsoft_pla_browser_click({
  element: "Normal mode option",
  ref: "[data-testid='mode-option-normal']"
})

// 7. Verify mode is selected
await mcp_microsoft_pla_browser_evaluate({
  function: `() => {
    const button = document.querySelector("[data-testid='mode-selector-button']");
    return button?.textContent?.trim();
  }`
})
// Expected result: "Normal"
```

### Test 2: Start Game

```typescript
// 1. Navigate (if not already there)
await mcp_microsoft_pla_browser_navigate({
  url: "http://localhost:5173"
})

// 2. Select mode and start game
await mcp_microsoft_pla_browser_click({
  element: "mode selector",
  ref: "[data-testid='mode-selector-button']"
})

await mcp_microsoft_pla_browser_click({
  element: "Normal mode",
  ref: "[data-testid='mode-option-normal']"
})

await mcp_microsoft_pla_browser_click({
  element: "new game button",
  ref: "[data-testid='new-game-button']"
})

// 3. Wait for game to load
await mcp_microsoft_pla_browser_wait_for({ time: 3 })

// 4. Take screenshot of game
await mcp_microsoft_pla_browser_take_screenshot({
  filename: "tests/screenshots/game-started.png"
})

// 5. Verify canvas is present
await mcp_microsoft_pla_browser_evaluate({
  function: `() => {
    return !!document.querySelector("canvas");
  }`
})
// Expected: true
```

### Test 3: Gameplay - Typing

```typescript
// (After starting game as above)

// 1. Wait for enemies to spawn
await mcp_microsoft_pla_browser_wait_for({ time: 5 })

// 2. Take snapshot to see game state
await mcp_microsoft_pla_browser_snapshot()

// 3. Type some characters
await mcp_microsoft_pla_browser_type({
  element: "game input area",
  ref: "body",
  text: "hello",
  slowly: true
})

// 4. Wait and take screenshot
await mcp_microsoft_pla_browser_wait_for({ time: 1 })
await mcp_microsoft_pla_browser_take_screenshot({
  filename: "tests/screenshots/after-typing.png"
})

// 5. Check score increased
await mcp_microsoft_pla_browser_evaluate({
  function: `() => {
    const scoreEl = document.querySelector("[data-testid='score-display']");
    return scoreEl?.textContent;
  }`
})
```

### Test 4: EMP Weapon

```typescript
// (After starting game)

// 1. Wait for EMP to be ready
await mcp_microsoft_pla_browser_wait_for({ time: 3 })

// 2. Check EMP status
await mcp_microsoft_pla_browser_evaluate({
  function: `() => {
    const emp = document.querySelector("[data-testid='emp-cooldown']");
    return emp?.textContent;
  }`
})

// 3. Activate EMP with Enter key
await mcp_microsoft_pla_browser_press_key({ key: "Enter" })

// 4. Wait for effect
await mcp_microsoft_pla_browser_wait_for({ time: 1 })

// 5. Take screenshot
await mcp_microsoft_pla_browser_take_screenshot({
  filename: "tests/screenshots/emp-activated.png"
})

// 6. Verify cooldown started
await mcp_microsoft_pla_browser_evaluate({
  function: `() => {
    const emp = document.querySelector("[data-testid='emp-cooldown']");
    return emp?.textContent;
  }`
})
// Should show a number (cooldown time)
```

### Test 5: Pause Menu

```typescript
// (After starting game)

// 1. Press Escape to pause
await mcp_microsoft_pla_browser_press_key({ key: "Escape" })

// 2. Wait for menu
await mcp_microsoft_pla_browser_wait_for({ time: 0.5 })

// 3. Take snapshot
await mcp_microsoft_pla_browser_snapshot()

// 4. Take screenshot
await mcp_microsoft_pla_browser_take_screenshot({
  filename: "tests/screenshots/pause-menu.png"
})

// 5. Verify pause menu is visible
await mcp_microsoft_pla_browser_evaluate({
  function: `() => {
    return !!document.querySelector("[data-testid='pause-menu']");
  }`
})
// Expected: true

// 6. Resume game
await mcp_microsoft_pla_browser_click({
  element: "resume button",
  ref: "[data-testid='resume-button']"
})

// 7. Verify game resumed
await mcp_microsoft_pla_browser_wait_for({ time: 0.5 })
await mcp_microsoft_pla_browser_take_screenshot({
  filename: "tests/screenshots/game-resumed.png"
})
```

### Test 6: Performance Check

```typescript
// 1. Navigate to app
await mcp_microsoft_pla_browser_navigate({
  url: "http://localhost:5173"
})

// 2. Check for console errors
await mcp_microsoft_pla_browser_console_messages({
  onlyErrors: true
})
// Should return empty array or minimal errors

// 3. Measure FPS
await mcp_microsoft_pla_browser_evaluate({
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
  }`
})
// Expected: 60 (or 30+ minimum)

// 4. Check memory usage
await mcp_microsoft_pla_browser_evaluate({
  function: `() => {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
      };
    }
    return null;
  }`
})
```

### Test 7: Tab Key Target Switching

```typescript
// (After starting game with enemies spawned)

// 1. Get current target
const word1 = await mcp_microsoft_pla_browser_evaluate({
  function: `() => {
    return document.querySelector("[data-testid='current-word']")?.textContent;
  }`
})

// 2. Press Tab to switch
await mcp_microsoft_pla_browser_press_key({ key: "Tab" })

// 3. Wait a moment
await mcp_microsoft_pla_browser_wait_for({ time: 0.5 })

// 4. Get new target
const word2 = await mcp_microsoft_pla_browser_evaluate({
  function: `() => {
    return document.querySelector("[data-testid='current-word']")?.textContent;
  }`
})

// 5. Compare (should be different if multiple enemies)
// Take screenshot
await mcp_microsoft_pla_browser_take_screenshot({
  filename: "tests/screenshots/target-switched.png"
})
```

### Test 8: Settings Modal

```typescript
// 1. Navigate to app
await mcp_microsoft_pla_browser_navigate({
  url: "http://localhost:5173"
})

// 2. Click settings button
await mcp_microsoft_pla_browser_click({
  element: "settings button",
  ref: "[data-testid='settings-button']"
})

// 3. Wait for modal
await mcp_microsoft_pla_browser_wait_for({ time: 0.5 })

// 4. Take screenshot
await mcp_microsoft_pla_browser_take_screenshot({
  filename: "tests/screenshots/settings-modal.png"
})

// 5. Verify modal is visible
await mcp_microsoft_pla_browser_evaluate({
  function: `() => {
    return !!document.querySelector("[data-testid='settings-modal']");
  }`
})
```

## Test Coverage Checklist

- [ ] Main menu displays correctly
- [ ] Mode selector dropdown works
- [ ] Can select different game modes
- [ ] Can start new game
- [ ] Game canvas loads
- [ ] Enemies spawn with words
- [ ] Typing destroys words
- [ ] Score increases on correct typing
- [ ] Tab switches targets
- [ ] Enter activates EMP
- [ ] EMP goes on cooldown
- [ ] Escape pauses game
- [ ] Pause menu appears
- [ ] Resume works
- [ ] Settings modal opens
- [ ] About modal shows version info
- [ ] No console errors on load
- [ ] FPS is 30+ during gameplay
- [ ] Memory usage is reasonable

## Tips

1. **Always wait after navigation** for the page to fully load
2. **Use snapshots** to understand page structure before clicking
3. **Take screenshots** at key points for visual verification
4. **Check console errors** regularly
5. **Measure performance** during gameplay, not just at start

## Next Steps

- Review `tests/mcp-test-scenarios.ts` for structured test scenarios
- Check individual test files (01-12) for detailed test cases
- Run `tsx tests/manual-runner.ts` to see all available tests
