/**
 * Achievements Manager
 * Tracks and manages all 19 achievements from the Python version
 * Ported from core/achievements.py
 */
import { Achievement } from '../types';
import { info } from './logger';

// All 19 achievements from Python version
export const ACHIEVEMENTS_DEFINITIONS: Achievement[] = [
  {
    id: 'first_word',
    name: 'First Steps',
    description: 'Type your first word',
    iconName: '/assets/icons/baby-bottle.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Reach 100 WPM',
    iconName: '/assets/icons/lightning-bolt.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'accuracy_master',
    name: 'Accuracy Master',
    description: 'Complete a game with 95% accuracy',
    iconName: '/assets/icons/accuracy.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 95,
  },
  {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    description: 'Defeat your first boss',
    iconName: '/assets/icons/sword.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'level_10',
    name: 'Halfway There',
    description: 'Reach level 10',
    iconName: '/assets/icons/bronze-medal.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'level_20',
    name: 'Master Typist',
    description: 'Reach level 20',
    iconName: '/assets/icons/star.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 20,
  },
  {
    id: 'perfect_game',
    name: 'Perfection',
    description: 'Complete 10 words in a row without mistakes',
    iconName: '/assets/icons/checkmark.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'marathon',
    name: 'Marathon Runner',
    description: 'Play for 30 minutes straight',
    iconName: '/assets/icons/stopwatch.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 1800, // 30 minutes in seconds
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    description: 'Play in all programming languages',
    iconName: '/assets/icons/code.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 7, // 7 programming languages
  },
  {
    id: 'high_scorer',
    name: 'High Scorer',
    description: 'Score over 10,000 points',
    iconName: '/assets/icons/dollar-coin.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 10000,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play 50 games',
    iconName: '/assets/icons/army-star.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'word_master',
    name: 'Word Master',
    description: 'Type 1000 words total',
    iconName: '/assets/icons/dictionary.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 1000,
  },
  {
    id: 'trivia_novice',
    name: 'Trivia Novice',
    description: 'Answer your first trivia question correctly',
    iconName: '/assets/icons/question-mark.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'trivia_expert',
    name: 'Trivia Expert',
    description: 'Answer 10 trivia questions correctly',
    iconName: '/assets/icons/brain.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'trivia_master',
    name: 'Trivia Master',
    description: 'Answer 25 trivia questions correctly',
    iconName: '/assets/icons/graduation-cap.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 25,
  },
  {
    id: 'trivia_genius',
    name: 'Trivia Genius',
    description: 'Answer 50 trivia questions correctly',
    iconName: '/assets/icons/wizard.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'perfect_trivia',
    name: 'Perfect Mind',
    description: 'Answer 5 trivia questions in a row correctly',
    iconName: '/assets/icons/checkmark.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'bonus_collector',
    name: 'Bonus Collector',
    description: 'Collect 10 bonus items from trivia',
    iconName: '/assets/icons/gift.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'bonus_master',
    name: 'Bonus Master',
    description: 'Use 25 bonus items in combat',
    iconName: '/assets/icons/crown.svg',
    unlocked: false,
    progress: 0,
    maxProgress: 25,
  },
];

export interface AchievementStats {
  wordsTyped: number;
  gamesPlayed: number;
  bossesDefeated: number;
  perfectWordStreak: number;
  triviaCorrect: number;
  triviaStreak: number;
  bonusItemsCollected: number;
  bonusItemsUsed: number;
  languagesPlayed: Set<string>;
  playTimeSeconds: number;
  highestWPM: number;
  highestAccuracy: number;
  highestScore: number;
  highestLevel: number;
}

class AchievementsManager {
  private achievements: Achievement[];
  private stats: AchievementStats;
  private listeners: Array<(achievement: Achievement) => void> = [];

  constructor() {
    this.achievements = JSON.parse(JSON.stringify(ACHIEVEMENTS_DEFINITIONS)); // Deep copy
    this.stats = {
      wordsTyped: 0,
      gamesPlayed: 0,
      bossesDefeated: 0,
      perfectWordStreak: 0,
      triviaCorrect: 0,
      triviaStreak: 0,
      bonusItemsCollected: 0,
      bonusItemsUsed: 0,
      languagesPlayed: new Set(),
      playTimeSeconds: 0,
      highestWPM: 0,
      highestAccuracy: 0,
      highestScore: 0,
      highestLevel: 0,
    };
  }

  /**
   * Load achievements and stats from storage
   */
  load(savedAchievements?: Achievement[], savedStats?: Partial<AchievementStats>) {
    if (savedAchievements) {
      // Merge saved achievements with definitions
      this.achievements = ACHIEVEMENTS_DEFINITIONS.map(def => {
        const saved = savedAchievements.find(a => a.id === def.id);
        return saved ? { ...def, ...saved } : def;
      });
    }

    if (savedStats) {
      this.stats = {
        ...this.stats,
        ...savedStats,
        languagesPlayed: new Set(savedStats.languagesPlayed || []),
      };
    }
  }

  /**
   * Get all achievements
   */
  getAchievements(): Achievement[] {
    return this.achievements;
  }

  /**
   * Get current stats
   */
  getStats(): AchievementStats {
    return this.stats;
  }

  /**
   * Subscribe to achievement unlocks
   */
  onUnlock(callback: (achievement: Achievement) => void) {
    this.listeners.push(callback);
  }

  /**
   * Check and unlock an achievement
   */
  private checkAndUnlock(id: string, progress: number): boolean {
    const achievement = this.achievements.find(a => a.id === id);
    if (!achievement || achievement.unlocked) return false;

    achievement.progress = Math.min(progress, achievement.maxProgress);

    if (achievement.progress >= achievement.maxProgress) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date().toISOString();
      
      // Notify listeners
      this.listeners.forEach(listener => listener(achievement));
      
      info(`Achievement unlocked: ${achievement.name}`, undefined, 'achievementsManager');
      return true;
    }

    return false;
  }

  /**
   * Update stats and check all achievements
   */
  updateStats(updates: Partial<AchievementStats>) {
    // Update stats
    Object.assign(this.stats, updates);

    // Check achievements
    this.checkAndUnlock('first_word', this.stats.wordsTyped);
    this.checkAndUnlock('speed_demon', this.stats.highestWPM);
    this.checkAndUnlock('accuracy_master', this.stats.highestAccuracy);
    this.checkAndUnlock('boss_slayer', this.stats.bossesDefeated);
    this.checkAndUnlock('level_10', this.stats.highestLevel);
    this.checkAndUnlock('level_20', this.stats.highestLevel);
    this.checkAndUnlock('perfect_game', this.stats.perfectWordStreak);
    this.checkAndUnlock('marathon', this.stats.playTimeSeconds);
    this.checkAndUnlock('polyglot', this.stats.languagesPlayed.size);
    this.checkAndUnlock('high_scorer', this.stats.highestScore);
    this.checkAndUnlock('veteran', this.stats.gamesPlayed);
    this.checkAndUnlock('word_master', this.stats.wordsTyped);
    this.checkAndUnlock('trivia_novice', this.stats.triviaCorrect);
    this.checkAndUnlock('trivia_expert', this.stats.triviaCorrect);
    this.checkAndUnlock('trivia_master', this.stats.triviaCorrect);
    this.checkAndUnlock('trivia_genius', this.stats.triviaCorrect);
    this.checkAndUnlock('perfect_trivia', this.stats.triviaStreak);
    this.checkAndUnlock('bonus_collector', this.stats.bonusItemsCollected);
    this.checkAndUnlock('bonus_master', this.stats.bonusItemsUsed);
  }

  /**
   * Record a word typed
   */
  onWordTyped(correct: boolean) {
    if (correct) {
      this.stats.wordsTyped++;
      this.stats.perfectWordStreak++;
    } else {
      this.stats.perfectWordStreak = 0;
    }
    
    this.updateStats({});
  }

  /**
   * Record a boss defeated
   */
  onBossDefeated() {
    this.stats.bossesDefeated++;
    this.updateStats({});
  }

  /**
   * Record trivia answer
   */
  onTriviaAnswered(correct: boolean) {
    if (correct) {
      this.stats.triviaCorrect++;
      this.stats.triviaStreak++;
    } else {
      this.stats.triviaStreak = 0;
    }
    
    this.updateStats({});
  }

  /**
   * Record bonus item collected
   */
  onBonusItemCollected() {
    this.stats.bonusItemsCollected++;
    this.updateStats({});
  }

  /**
   * Record bonus item used
   */
  onBonusItemUsed() {
    this.stats.bonusItemsUsed++;
    this.updateStats({});
  }

  /**
   * Record language played
   */
  onLanguagePlayed(language: string) {
    this.stats.languagesPlayed.add(language);
    this.updateStats({});
  }

  /**
   * Update game stats
   */
  onGameEnd(stats: {
    score: number;
    level: number;
    wpm: number;
    accuracy: number;
    playTimeSeconds: number;
  }) {
    this.stats.gamesPlayed++;
    this.stats.playTimeSeconds += stats.playTimeSeconds;
    this.stats.highestScore = Math.max(this.stats.highestScore, stats.score);
    this.stats.highestLevel = Math.max(this.stats.highestLevel, stats.level);
    this.stats.highestWPM = Math.max(this.stats.highestWPM, stats.wpm);
    this.stats.highestAccuracy = Math.max(this.stats.highestAccuracy, stats.accuracy);
    
    this.updateStats({});
  }

  /**
   * Get unlocked count
   */
  getUnlockedCount(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }

  /**
   * Get total count
   */
  getTotalCount(): number {
    return this.achievements.length;
  }
}

// Export singleton instance
export const achievementsManager = new AchievementsManager();
