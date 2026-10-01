/**
 * Trivia Database - manages loading and retrieving trivia questions
 * Ported from Python data/trivia_db.py
 */
import {
  type TriviaQuestion,
  GameMode,
  type ProgrammingLanguage,
  TriviaCategory,
  type BonusItem,
  BonusItemType,
  LANGUAGE_FILE_MAP,
} from "../types";
import { load as loadYAML } from "js-yaml";
import { info, warn, error as logError } from "./logger";

type TriviaDifficulty = "beginner" | "intermediate" | "advanced";
type TriviaCategoryData = Partial<Record<TriviaDifficulty, TriviaQuestion[]>>;
type TriviaData = Record<string, TriviaCategoryData>;

const TRIVIA_DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const GENERAL_CATEGORIES = [
  TriviaCategory.POP_CULTURE,
  TriviaCategory.SPORTS,
  TriviaCategory.HISTORY,
] as const;

const TRIVIA_LEVEL_THRESHOLDS = {
  Easy: { beginner: 40, intermediate: 85 },
  Normal: { beginner: 30, intermediate: 70 },
  Hard: { beginner: 20, intermediate: 55 },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function parseQuestion(
  value: unknown,
  difficulty: TriviaDifficulty,
  category: string,
): TriviaQuestion {
  if (
    !isRecord(value) ||
    typeof value["question"] !== "string" ||
    value["question"].trim().length === 0 ||
    !isStringArray(value["options"]) ||
    typeof value["correct"] !== "number" ||
    !Number.isSafeInteger(value["correct"]) ||
    value["correct"] < 0 ||
    value["correct"] >= value["options"].length
  ) {
    throw new Error(`Invalid trivia question in ${category}/${difficulty}`);
  }

  return {
    question: value["question"],
    options: value["options"],
    correctAnswer: value["correct"],
    difficulty,
    category,
  };
}

function getStoredDifficulty(): string {
  const defaultDifficulty = "Normal";
  const settingsJson = localStorage.getItem("game-settings");
  if (!settingsJson) return defaultDifficulty;

  const settings: unknown = JSON.parse(settingsJson);
  return isRecord(settings) && typeof settings["difficulty"] === "string"
    ? settings["difficulty"]
    : defaultDifficulty;
}

// Bonus items that can be earned from trivia
const BONUS_ITEMS = [
  {
    itemId: 0,
    name: "Seeking Missiles",
    description: "Launch homing missiles to destroy 5 nearest enemies",
    iconName: "🚀",
    duration: 1,
    uses: 1,
    effectValue: 0,
    type: BonusItemType.OFFENSIVE,
  },
  {
    itemId: 1,
    name: "Shield Boost",
    description: "Instant 50 shield points",
    iconName: "🛡️",
    duration: 1,
    uses: 1,
    effectValue: 50,
    type: BonusItemType.DEFENSIVE,
  },
  {
    itemId: 2,
    name: "Health Pack",
    description: "Restore 30 HP instantly",
    iconName: "💚",
    duration: 1,
    uses: 1,
    effectValue: 30,
    type: BonusItemType.DEFENSIVE,
  },
  {
    itemId: 3,
    name: "EMP Blast",
    description: "Destroy all non-boss enemies instantly",
    iconName: "⚡",
    duration: 1,
    uses: 1,
    effectValue: 0,
    type: BonusItemType.OFFENSIVE,
  },
] satisfies [BonusItem, ...BonusItem[]];

export class TriviaDatabase {
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
      await this.loadPromise;
      return; // Loading in progress
    }

    this.loadPromise = (async () => {
      try {
        const response = await fetch("/data/trivia.yaml");
        if (!response.ok) {
          throw new Error(
            `Failed to load trivia: ${response.status.toString()}`,
          );
        }

        const yamlText = await response.text();
        this.triviaData = this.parseYAML(yamlText);

        info(
          `Trivia database loaded: ${Object.keys(this.triviaData).length.toString()} categories`,
          undefined,
          "triviaDatabase",
        );
      } catch (error) {
        logError("Failed to load trivia database", error, "triviaDatabase");
        this.triviaData = null;
        throw error;
      }
    })();

    try {
      await this.loadPromise;
    } finally {
      // Clear failed and successful requests, including synchronous fetch errors.
      this.loadPromise = null;
    }
  }

  /**
   * Get a random trivia question based on game mode and difficulty
   */
  getQuestion(
    mode: GameMode,
    language: ProgrammingLanguage | null = null,
    difficultyLevel = 1,
  ): TriviaQuestion {
    if (!this.triviaData) {
      warn("Trivia data not loaded", undefined, "triviaDatabase");
      return this.getFallbackQuestion();
    }

    // Determine category
    let category: string;
    if (language && mode === GameMode.PROGRAMMING) {
      // Use LANGUAGE_FILE_MAP to convert language names like 'C#' → 'csharp', 'C++' → 'cplusplus'
      category = LANGUAGE_FILE_MAP[language] ?? language.toLowerCase();
    } else {
      // Random general knowledge category
      const categoryIndex = Math.floor(
        Math.random() * GENERAL_CATEGORIES.length,
      );
      category = GENERAL_CATEGORIES[categoryIndex] ?? GENERAL_CATEGORIES[0];
    }

    // Determine difficulty based on level and game difficulty setting
    let difficulty: TriviaDifficulty;

    // Get difficulty multiplier from settings
    let settingsDifficulty = "Normal";
    try {
      settingsDifficulty = getStoredDifficulty();
    } catch (error) {
      warn(
        "Failed to load settings for trivia difficulty",
        error,
        "triviaDatabase",
      );
    }

    let thresholds: {
      readonly beginner: number;
      readonly intermediate: number;
    } = TRIVIA_LEVEL_THRESHOLDS.Normal;
    if (settingsDifficulty === "Easy") {
      thresholds = TRIVIA_LEVEL_THRESHOLDS.Easy;
    } else if (settingsDifficulty === "Hard") {
      thresholds = TRIVIA_LEVEL_THRESHOLDS.Hard;
    }

    if (difficultyLevel <= thresholds.beginner) {
      difficulty = "beginner";
    } else if (difficultyLevel <= thresholds.intermediate) {
      difficulty = "intermediate";
    } else {
      difficulty = "advanced";
    }

    // Get questions for category and difficulty
    const categoryData = this.triviaData[category];
    if (!categoryData) {
      warn(
        `No trivia data for category: ${category}`,
        undefined,
        "triviaDatabase",
      );
      return this.getFallbackQuestion();
    }

    let questions = categoryData[difficulty] ?? [];

    // Fallback to beginner if no questions at current difficulty
    if (questions.length === 0) {
      questions = categoryData.beginner ?? [];
    }

    if (questions.length === 0) {
      warn(
        `No questions found for ${category}/${difficulty}`,
        undefined,
        "triviaDatabase",
      );
      return this.getFallbackQuestion();
    }

    // Return random question
    return (
      questions[Math.floor(Math.random() * questions.length)] ??
      this.getFallbackQuestion()
    );
  }

  /**
   * Get a random bonus item
   */
  getBonusItem(): BonusItem {
    return (
      BONUS_ITEMS[Math.floor(Math.random() * BONUS_ITEMS.length)] ??
      BONUS_ITEMS[0]
    );
  }

  /**
   * Fallback question if data loading fails
   */
  private getFallbackQuestion(): TriviaQuestion {
    return {
      question: "What is 2 + 2?",
      options: ["3", "4", "5"],
      correctAnswer: 1,
      difficulty: "beginner",
      category: TriviaCategory.MATHEMATICS,
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
  private parseYAML(yamlText: string): TriviaData {
    const parsedData = loadYAML(yamlText);
    if (!isRecord(parsedData)) {
      throw new TypeError("Trivia data must be a YAML mapping");
    }

    const result: TriviaData = {};
    let questionCount = 0;
    for (const [category, categoryValue] of Object.entries(parsedData)) {
      if (!isRecord(categoryValue)) {
        throw new TypeError(`Trivia category ${category} must be a mapping`);
      }

      const categoryData: TriviaCategoryData = {};
      for (const difficulty of TRIVIA_DIFFICULTIES) {
        const questions = categoryValue[difficulty];
        if (questions !== undefined) {
          if (!Array.isArray(questions)) {
            throw new TypeError(
              `Trivia ${category}/${difficulty} must be a list`,
            );
          }
          categoryData[difficulty] = questions.map((question) =>
            parseQuestion(question, difficulty, category),
          );
          questionCount += questions.length;
        }
      }
      result[category] = categoryData;
    }

    if (questionCount === 0)
      throw new TypeError("Trivia data must contain at least one question");
    return result;
  }
}

// Export singleton instance
export const triviaDatabase = new TriviaDatabase();
