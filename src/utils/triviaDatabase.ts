/**
 * Trivia Database - manages loading and retrieving trivia questions
 * Ported from Python data/trivia_db.py
 */
import { TriviaQuestion, GameMode, ProgrammingLanguage, TriviaCategory, BonusItem, BonusItemType } from '../types';
import { info, warn, error as logError } from './logger';

interface TriviaData {
  [category: string]: {
    beginner?: TriviaQuestion[];
    intermediate?: TriviaQuestion[];
    advanced?: TriviaQuestion[];
  };
}

// Bonus items that can be earned from trivia
const BONUS_ITEMS: BonusItem[] = [
  {
    itemId: 0,
    name: 'Seeking Missiles',
    description: 'Launch homing missiles to destroy 5 nearest enemies',
    iconName: '🚀',
    duration: 1,
    uses: 1,
    effectValue: 0,
    type: BonusItemType.OFFENSIVE,
  },
  {
    itemId: 1,
    name: 'Shield Boost',
    description: 'Instant 50 shield points',
    iconName: '🛡️',
    duration: 1,
    uses: 1,
    effectValue: 50,
    type: BonusItemType.DEFENSIVE,
  },
  {
    itemId: 2,
    name: 'Health Pack',
    description: 'Restore 30 HP instantly',
    iconName: '💚',
    duration: 1,
    uses: 1,
    effectValue: 30,
    type: BonusItemType.DEFENSIVE,
  },
  {
    itemId: 3,
    name: 'Time Freeze',
    description: 'Freeze all enemies for 5 seconds',
    iconName: '⏱️',
    duration: 300, // 5 seconds * 60 FPS
    uses: 1,
    effectValue: 0,
    type: BonusItemType.OFFENSIVE,
  },
];

class TriviaDatabase {
  private triviaData: TriviaData | null = null;
  private loadPromise: Promise<void> | null = null;

  /**
   * Load trivia questions from YAML file
   */
  async load(): Promise<void> {
    if (this.triviaData) {
      return; // Already loaded
    }

    if (this.loadPromise) {
      return this.loadPromise; // Loading in progress
    }

    this.loadPromise = (async () => {
      try {
        const response = await fetch('/data/trivia.yaml');
        if (!response.ok) {
          throw new Error(`Failed to load trivia: ${response.status}`);
        }

        const yamlText = await response.text();
        const rawData = this.parseYAML(yamlText);

        // Convert YAML structure to TriviaData format
        this.triviaData = {};

        for (const [category, difficulties] of Object.entries(rawData)) {
          this.triviaData[category] = {};

          for (const [difficulty, questions] of Object.entries(difficulties as any)) {
            this.triviaData[category][difficulty as keyof typeof this.triviaData[string]] = (
              questions as any[]
            ).map((q) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correct,
              difficulty,
              category,
            }));
          }
        }

        info(`Trivia database loaded: ${Object.keys(this.triviaData).length} categories`, undefined, 'triviaDatabase');
      } catch (err) {
        logError('Failed to load trivia database', err, 'triviaDatabase');
        this.triviaData = {}; // Empty data on error
      }
    })();

    return this.loadPromise;
  }

  /**
   * Get a random trivia question based on game mode and difficulty
   */
  getQuestion(
    mode: GameMode,
    language: ProgrammingLanguage | null = null,
    difficultyLevel: number = 1
  ): TriviaQuestion {
    if (!this.triviaData) {
      warn('Trivia data not loaded', undefined, 'triviaDatabase');
      return this.getFallbackQuestion();
    }

    // Determine category
    let category: string;
    if (mode === GameMode.PROGRAMMING && language) {
      category = language.toLowerCase();
    } else {
      // Random general knowledge category
      const categories = [
        TriviaCategory.POP_CULTURE,
        TriviaCategory.SPORTS,
        TriviaCategory.HISTORY,
      ];
      category = categories[Math.floor(Math.random() * categories.length)];
    }

    // Determine difficulty based on level and game difficulty setting
    let difficulty: 'beginner' | 'intermediate' | 'advanced';
    
    // Get difficulty multiplier from settings
    let settings: any = { difficulty: 'Normal' };
    try {
      const settingsJson = localStorage.getItem('game-settings');
      if (settingsJson) {
        settings = JSON.parse(settingsJson);
      }
    } catch (err) {
      warn('Failed to load settings for trivia difficulty', err, 'triviaDatabase');
    }
    
    // Adjust level thresholds based on difficulty setting
    let beginnerThreshold = 30;
    let intermediateThreshold = 70;
    
    if (settings.difficulty === 'Easy') {
      // Easier trivia questions - stay in beginner/intermediate longer
      beginnerThreshold = 40;
      intermediateThreshold = 85;
    } else if (settings.difficulty === 'Hard') {
      // Harder trivia questions - progress faster to advanced
      beginnerThreshold = 20;
      intermediateThreshold = 55;
    }
    
    if (difficultyLevel <= beginnerThreshold) {
      difficulty = 'beginner';
    } else if (difficultyLevel <= intermediateThreshold) {
      difficulty = 'intermediate';
    } else {
      difficulty = 'advanced';
    }

    // Get questions for category and difficulty
    const categoryData = this.triviaData[category];
    if (!categoryData) {
      warn(`No trivia data for category: ${category}`, undefined, 'triviaDatabase');
      return this.getFallbackQuestion();
    }

    let questions = categoryData[difficulty] || [];
    
    // Fallback to beginner if no questions at current difficulty
    if (questions.length === 0) {
      questions = categoryData.beginner || [];
    }

    if (questions.length === 0) {
      warn(`No questions found for ${category}/${difficulty}`, undefined, 'triviaDatabase');
      return this.getFallbackQuestion();
    }

    // Return random question
    return questions[Math.floor(Math.random() * questions.length)];
  }

  /**
   * Get a random bonus item
   */
  getBonusItem(): BonusItem {
    return BONUS_ITEMS[Math.floor(Math.random() * BONUS_ITEMS.length)];
  }

  /**
   * Fallback question if data loading fails
   */
  private getFallbackQuestion(): TriviaQuestion {
    return {
      question: 'What is 2 + 2?',
      options: ['3', '4', '5'],
      correctAnswer: 1,
      difficulty: 'beginner',
      category: 'mathematics',
    };
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return this.triviaData ? Object.keys(this.triviaData) : [];
  }

  /**
   * Check if trivia database is loaded
   */
  isLoaded(): boolean {
    return this.triviaData !== null;
  }

  /**
   * Simple YAML parser for trivia questions
   * Handles basic YAML structure with indentation
   */
  private parseYAML(yamlText: string): any {
    const result: any = {};
    const lines = yamlText.split('\n');
    let currentCategory: string | null = null;
    let currentDifficulty: string | null = null;
    let currentQuestion: any = null;
    let currentKey: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue; // Skip empty lines and comments
      }

      const indent = line.length - line.trimLeft().length;

      // Top-level category (no indent)
      if (indent === 0 && line.endsWith(':')) {
        currentCategory = trimmed.slice(0, -1);
        result[currentCategory] = {};
        currentDifficulty = null;
        currentQuestion = null;
        continue;
      }

      // Difficulty level (2 spaces)
      if (indent === 2 && line.trim().endsWith(':') && currentCategory) {
        currentDifficulty = trimmed.slice(0, -1);
        result[currentCategory][currentDifficulty] = [];
        currentQuestion = null;
        continue;
      }

      // New question (starts with dash at 2 spaces)
      if (indent === 2 && line.trim().startsWith('- question:')) {
        if (currentCategory && currentDifficulty) {
          currentQuestion = {
            question: line.split('question:')[1].trim(),
            options: [],
            correct: 0,
          };
          result[currentCategory][currentDifficulty].push(currentQuestion);
          currentKey = null;
        }
        continue;
      }

      // Question field at 4 spaces
      if (indent === 4 && line.includes(':') && currentQuestion) {
        const [key, ...valueParts] = line.trim().split(':');
        const value = valueParts.join(':').trim();

        if (key === 'question') {
          currentQuestion.question = value;
        } else if (key === 'options') {
          currentKey = 'options';
        } else if (key === 'correct') {
          currentQuestion.correct = parseInt(value, 10);
        }
        continue;
      }

      // Option item (starts with dash at 4 spaces)
      if (indent === 4 && line.trim().startsWith('- ') && currentKey === 'options') {
        const option = line.trim().slice(2);
        currentQuestion.options.push(option);
        continue;
      }
    }

    return result;
  }
}

// Export singleton instance
export const triviaDatabase = new TriviaDatabase();
