/**
 * Centralized Test ID Constants
 * Define all test IDs in one place for consistency
 */

export const TEST_IDS = {
  // Main Menu
  MAIN_MENU_LOGO: 'main-menu-logo',
  CONTINUE_GAME_BUTTON: 'continue-game-button',
  NEW_GAME_BUTTON: 'new-game-button',
  MODE_SELECTOR_BUTTON: 'mode-selector-button',
  MODE_SELECTOR_DROPDOWN: 'mode-selector-dropdown',
  PLAYER_STATS_BUTTON: 'player-stats-button',
  SETTINGS_BUTTON: 'settings-button',
  ABOUT_BUTTON: 'about-button',
  
  // Settings Menu
  SETTINGS_MENU_OVERLAY: 'settings-menu-overlay',
  SETTINGS_MENU_DIALOG: 'settings-menu-dialog',
  MUSIC_VOLUME_SLIDER: 'music-volume-slider',
  SFX_VOLUME_SLIDER: 'sfx-volume-slider',
  DIFFICULTY_SELECTOR: 'difficulty-selector',
  SETTINGS_SAVE_BUTTON: 'settings-save-button',
  SETTINGS_CANCEL_BUTTON: 'settings-cancel-button',
  
  // Pause Menu
  PAUSE_MENU_OVERLAY: 'pause-menu-overlay',
  PAUSE_MENU_DIALOG: 'pause-menu-dialog',
  PAUSE_RESUME_BUTTON: 'pause-resume-button',
  PAUSE_SETTINGS_BUTTON: 'pause-settings-button',
  PAUSE_MAIN_MENU_BUTTON: 'pause-main-menu-button',
  
  // Game Over Screen
  GAME_OVER_SCREEN: 'game-over-screen',
  PLAY_AGAIN_BUTTON: 'play-again-button',
  GAME_OVER_MAIN_MENU_BUTTON: 'game-over-main-menu-button',
  
  // Trivia Overlay
  TRIVIA_OVERLAY: 'trivia-overlay',
  TRIVIA_QUESTION: 'trivia-question',
  TRIVIA_ANSWER_PREFIX: 'trivia-answer-', // Append index
  TRIVIA_TIMER: 'trivia-timer',
  TRIVIA_RESULT: 'trivia-result',
  
  // Game Canvas/HUD
  GAME_CANVAS: 'game-canvas',
  HUD_CONTAINER: 'hud-container',
  HUD_HEALTH_BAR: 'hud-health-bar',
  HUD_SHIELD_BAR: 'hud-shield-bar',
  HUD_SCORE: 'hud-score',
  HUD_LEVEL: 'hud-level',
  HUD_WPM: 'hud-wpm',
  HUD_ACCURACY: 'hud-accuracy',
  HUD_EMP_COOLDOWN: 'hud-emp-cooldown',
  HUD_BONUS_ITEMS: 'hud-bonus-items',
  
  // Enemy Ships
  ENEMY_SHIP_PREFIX: 'enemy-ship-', // Append enemy ID
  ENEMY_WORD_PREFIX: 'enemy-word-', // Append enemy ID
  BOSS_SHIP_PREFIX: 'boss-ship-', // Append enemy ID
  
  // Achievements
  ACHIEVEMENT_TOAST: 'achievement-toast',
  ACHIEVEMENT_ICON: 'achievement-icon',
  ACHIEVEMENTS_SCREEN: 'achievements-screen',
  ACHIEVEMENT_ITEM_PREFIX: 'achievement-', // Append achievement ID
  
  // Player Stats Modal
  PLAYER_STATS_MODAL: 'player-stats-modal',
  HIGH_SCORES_TAB: 'high-scores-tab',
  ACHIEVEMENTS_TAB: 'achievements-tab',
  HIGH_SCORES_SCREEN: 'high-scores-screen',
  
  // 3D Entities
  PLAYER_SHIP: 'player-ship',
  ENEMY_SHIP: 'enemy-ship', // Use with userData.testId
  BOSS_SHIP: 'boss-ship', // Use with userData.testId
} as const;

export type TestId = typeof TEST_IDS[keyof typeof TEST_IDS];
