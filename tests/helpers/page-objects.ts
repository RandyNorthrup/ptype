/**
 * Page Object Models
 * Reusable page objects for common UI elements
 */

import { TEST_CONFIG } from '../config/test-config';
import { wait, waitForAnimations } from './test-helpers';

/**
 * Base Page Object
 */
export class BasePage {
  constructor(protected page: any) {}

  async goto(path: string = ''): Promise<void> {
    await this.page.goto(`${TEST_CONFIG.baseUrl}${path}`);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForSelector(selector: string, options?: any): Promise<any> {
    return await this.page.waitForSelector(selector, {
      timeout: TEST_CONFIG.timeouts.default,
      ...options,
    });
  }

  async click(selector: string): Promise<void> {
    await this.page.click(selector);
    await waitForAnimations();
  }

  async type(selector: string, text: string): Promise<void> {
    await this.page.fill(selector, text);
  }

  async getText(selector: string): Promise<string> {
    const element = await this.page.$(selector);
    return await element?.textContent() || '';
  }

  async isVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: TEST_CONFIG.timeouts.short,
      });
      return true;
    } catch {
      return false;
    }
  }

  async takeScreenshot(name: string): Promise<void> {
    if (TEST_CONFIG.screenshots.enabled) {
      await this.page.screenshot({
        path: `${TEST_CONFIG.screenshots.path}/${name}.png`,
        fullPage: TEST_CONFIG.screenshots.fullPage,
      });
    }
  }
}

/**
 * Main Menu Page Object
 */
export class MainMenuPage extends BasePage {
  // Selectors
  private selectors = {
    logo: '[data-testid="main-menu-logo"]',
    continueButton: '[data-testid="continue-game-button"]',
    newGameButton: '[data-testid="new-game-button"]',
    modeSelectorButton: '[data-testid="mode-selector-button"]',
    modeSelectorDropdown: '[data-testid="mode-selector-dropdown"]',
    playerStatsButton: '[data-testid="player-stats-button"]',
    settingsButton: '[data-testid="settings-button"]',
    aboutButton: '[data-testid="about-button"]',
  };

  async isLoaded(): Promise<boolean> {
    return await this.isVisible(this.selectors.logo);
  }

  async clickNewGame(): Promise<void> {
    await this.click(this.selectors.newGameButton);
  }

  async clickContinue(): Promise<void> {
    await this.click(this.selectors.continueButton);
  }

  async openModeSelector(): Promise<void> {
    await this.click(this.selectors.modeSelectorButton);
    await this.waitForSelector(this.selectors.modeSelectorDropdown);
  }

  async selectMode(mode: string): Promise<void> {
    await this.openModeSelector();
    const modeSelector = `[data-testid="mode-option-${mode.toLowerCase().replace(/\s+/g, '-')}"]`;
    await this.click(modeSelector);
  }

  async isNewGameEnabled(): Promise<boolean> {
    const button = await this.page.$(this.selectors.newGameButton);
    const disabled = await button?.getAttribute('disabled');
    return disabled === null;
  }

  async isContinueEnabled(): Promise<boolean> {
    const button = await this.page.$(this.selectors.continueButton);
    const disabled = await button?.getAttribute('disabled');
    return disabled === null;
  }

  async openPlayerStats(): Promise<void> {
    await this.click(this.selectors.playerStatsButton);
  }

  async openSettings(): Promise<void> {
    await this.click(this.selectors.settingsButton);
  }

  async openAbout(): Promise<void> {
    await this.click(this.selectors.aboutButton);
  }

  async getSelectedMode(): Promise<string> {
    return await this.getText(this.selectors.modeSelectorButton);
  }
}

/**
 * Game Canvas Page Object
 */
export class GameCanvasPage extends BasePage {
  // Selectors - Updated to match actual TEST_IDS from testIds.ts
  private selectors = {
    canvas: 'canvas',
    hud: '[data-testid="hud-container"]',
    health: '[data-testid="hud-health-bar"]',
    shield: '[data-testid="hud-shield-bar"]',
    score: '[data-testid="hud-score"]',
    level: '[data-testid="hud-level"]',
    wpm: '[data-testid="hud-wpm"]',
    accuracy: '[data-testid="hud-accuracy"]',
    empCooldown: '[data-testid="hud-emp-cooldown"]',
    bonusItems: '[data-testid="hud-bonus-items"]',
  };

  async isGameActive(): Promise<boolean> {
    return await this.isVisible(this.selectors.canvas);
  }

  async waitForGameStart(): Promise<void> {
    await this.waitForSelector(this.selectors.canvas);
    await wait(2000); // Wait for game initialization
  }

  async typeWord(word: string): Promise<void> {
    for (const char of word) {
      await this.page.keyboard.press(char);
      await wait(100);
    }
  }

  async pressTab(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }

  async pressEnter(): Promise<void> {
    await this.page.keyboard.press('Enter');
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async getHealth(): Promise<string> {
    return await this.getText(this.selectors.health);
  }

  async getScore(): Promise<string> {
    return await this.getText(this.selectors.score);
  }

  async getLevel(): Promise<string> {
    return await this.getText(this.selectors.level);
  }

  async getWPM(): Promise<string> {
    return await this.getText(this.selectors.wpm);
  }

  async getAccuracy(): Promise<string> {
    return await this.getText(this.selectors.accuracy);
  }

  async getShield(): Promise<string> {
    return await this.getText(this.selectors.shield);
  }

  async isEMPReady(): Promise<boolean> {
    const cooldown = await this.getText(this.selectors.empCooldown);
    return cooldown === '' || cooldown === 'READY';
  }

  async activateEMP(): Promise<void> {
    if (await this.isEMPReady()) {
      await this.pressEnter();
    }
  }
}

/**
 * Pause Menu Page Object
 */
export class PauseMenuPage extends BasePage {
  private selectors = {
    pauseMenu: '[data-testid="pause-menu"]',
    resumeButton: '[data-testid="resume-button"]',
    settingsButton: '[data-testid="pause-settings-button"]',
    mainMenuButton: '[data-testid="main-menu-button"]',
  };

  async isVisible(): Promise<boolean> {
    return await super.isVisible(this.selectors.pauseMenu);
  }

  async resume(): Promise<void> {
    await this.click(this.selectors.resumeButton);
  }

  async openSettings(): Promise<void> {
    await this.click(this.selectors.settingsButton);
  }

  async returnToMainMenu(): Promise<void> {
    await this.click(this.selectors.mainMenuButton);
    // Handle confirmation dialog
    await this.page.on('dialog', (dialog: any) => dialog.accept());
  }
}

/**
 * Game Over Screen Page Object
 */
export class GameOverPage extends BasePage {
  private selectors = {
    gameOverScreen: '[data-testid="game-over-screen"]',
    finalScore: '[data-testid="final-score"]',
    finalLevel: '[data-testid="final-level"]',
    finalWPM: '[data-testid="final-wpm"]',
    finalAccuracy: '[data-testid="final-accuracy"]',
    playAgainButton: '[data-testid="play-again-button"]',
    mainMenuButton: '[data-testid="game-over-main-menu-button"]',
  };

  async isVisible(): Promise<boolean> {
    return await super.isVisible(this.selectors.gameOverScreen);
  }

  async getFinalScore(): Promise<string> {
    return await this.getText(this.selectors.finalScore);
  }

  async getFinalLevel(): Promise<string> {
    return await this.getText(this.selectors.finalLevel);
  }

  async getFinalWPM(): Promise<string> {
    return await this.getText(this.selectors.finalWPM);
  }

  async getFinalAccuracy(): Promise<string> {
    return await this.getText(this.selectors.finalAccuracy);
  }

  async playAgain(): Promise<void> {
    await this.click(this.selectors.playAgainButton);
  }

  async returnToMainMenu(): Promise<void> {
    await this.click(this.selectors.mainMenuButton);
  }
}

/**
 * Trivia Overlay Page Object
 */
export class TriviaOverlayPage extends BasePage {
  private selectors = {
    triviaOverlay: '[data-testid="trivia-overlay"]',
    question: '[data-testid="trivia-question"]',
    option1: '[data-testid="trivia-option-0"]',
    option2: '[data-testid="trivia-option-1"]',
    option3: '[data-testid="trivia-option-2"]',
    option4: '[data-testid="trivia-option-3"]',
    timer: '[data-testid="trivia-timer"]',
  };

  async isVisible(): Promise<boolean> {
    return await super.isVisible(this.selectors.triviaOverlay);
  }

  async getQuestion(): Promise<string> {
    return await this.getText(this.selectors.question);
  }

  async selectAnswer(index: number): Promise<void> {
    const selector = `[data-testid="trivia-option-${index}"]`;
    await this.click(selector);
  }

  async getTimer(): Promise<string> {
    return await this.getText(this.selectors.timer);
  }

  async waitForTimeout(): Promise<void> {
    await wait(31000); // Trivia timeout is 30 seconds
  }
}

/**
 * Settings Menu Page Object
 */
export class SettingsMenuPage extends BasePage {
  private selectors = {
    settingsModal: '[data-testid="settings-modal"]',
    musicVolumeSlider: '[data-testid="music-volume-slider"]',
    soundVolumeSlider: '[data-testid="sound-volume-slider"]',
    closeButton: '[data-testid="settings-close-button"]',
  };

  async isVisible(): Promise<boolean> {
    return await super.isVisible(this.selectors.settingsModal);
  }

  async setMusicVolume(value: number): Promise<void> {
    await this.page.fill(this.selectors.musicVolumeSlider, value.toString());
  }

  async setSoundVolume(value: number): Promise<void> {
    await this.page.fill(this.selectors.soundVolumeSlider, value.toString());
  }

  async close(): Promise<void> {
    await this.click(this.selectors.closeButton);
  }
}

/**
 * Achievement Toast Page Object
 */
export class AchievementToastPage extends BasePage {
  private selectors = {
    toast: '[data-testid="achievement-toast"]',
    title: '[data-testid="achievement-title"]',
    description: '[data-testid="achievement-description"]',
  };

  async isVisible(): Promise<boolean> {
    return await super.isVisible(this.selectors.toast);
  }

  async getTitle(): Promise<string> {
    return await this.getText(this.selectors.title);
  }

  async getDescription(): Promise<string> {
    return await this.getText(this.selectors.description);
  }

  async waitForDismiss(): Promise<void> {
    await wait(3500); // Toasts dismiss after 3 seconds
  }
}
