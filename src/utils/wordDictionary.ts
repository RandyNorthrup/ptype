/**
 * Word Dictionary Loader for Web Version
 * Loads YAML dictionaries and provides word selection for enemies
 */

import type { ProgrammingLanguage } from "../types";
import { GameMode, LANGUAGE_FILE_MAP } from "../types";
import { load as loadYAML } from "js-yaml";
import { warn, error as logError } from "./logger";

export interface WordData {
  keywords: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
  };
  boss_words: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
  };
}

const WORD_DIFFICULTY_THRESHOLDS = {
  beginnerMaximum: 30,
  intermediateMaximum: 70,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseWordList(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`${path} must be a list of strings`);
  }
  return value.map((word) => {
    if (typeof word !== "string") {
      throw new TypeError(`${path} must contain only strings`);
    }
    return word;
  });
}

export class WordDictionary {
  private cache = new Map<string, WordData>();
  private loadingPromises = new Map<string, Promise<WordData>>();
  private availableWords = new Map<string, string[]>(); // Remaining words to use

  /**
   * Load a word dictionary from the data folder
   */
  async loadDictionary(language: string): Promise<WordData> {
    // Check cache first
    const cachedDictionary = this.cache.get(language);
    if (cachedDictionary) return cachedDictionary;

    // Check if already loading
    const existingPromise = this.loadingPromises.get(language);
    if (existingPromise) {
      return await existingPromise;
    }

    // Start loading
    const loadPromise = this.fetchDictionary(language);
    this.loadingPromises.set(language, loadPromise);

    try {
      const data = await loadPromise;
      this.cache.set(language, data);
      this.loadingPromises.delete(language);
      return data;
    } catch (error) {
      this.loadingPromises.delete(language);
      throw error;
    }
  }

  /**
   * Fetch dictionary data from the server
   */
  private async fetchDictionary(language: string): Promise<WordData> {
    try {
      // Try to load from data folder
      const response = await fetch(`/data/${language}_words.yaml`);

      if (!response.ok) {
        throw new Error(
          `Failed to load ${language} dictionary: ${response.statusText}`,
        );
      }

      const yamlText = await response.text();
      const data = this.parseYAML(yamlText);

      return data;
    } catch (error) {
      logError(`Error loading ${language} dictionary`, error, "wordDictionary");
      throw error;
    }
  }

  /**
   * Simple YAML parser for our dictionary format
   * Handles flat structure: beginner/intermediate/advanced/boss_phrases at root level
   */
  private parseYAML(yamlText: string): WordData {
    const parsedData = loadYAML(yamlText);
    if (!isRecord(parsedData) || !isRecord(parsedData["boss_words"])) {
      throw new TypeError("Dictionary must contain a boss_words mapping");
    }

    const bossWords = parsedData["boss_words"];
    return {
      keywords: {
        beginner: parseWordList(parsedData["beginner"], "beginner"),
        intermediate: parseWordList(parsedData["intermediate"], "intermediate"),
        advanced: parseWordList(parsedData["advanced"], "advanced"),
      },
      boss_words: {
        beginner: parseWordList(bossWords["beginner"], "boss_words.beginner"),
        intermediate: parseWordList(
          bossWords["intermediate"],
          "boss_words.intermediate",
        ),
        advanced: parseWordList(bossWords["advanced"], "boss_words.advanced"),
      },
    };
  }

  /**
   * Get a random word based on difficulty level with tracking to avoid reuse
   */
  getWord(language: string, level: number, isBoss = false): string {
    const data = this.cache.get(language);
    if (!data) {
      // Auto-reload dictionary if cache was cleared (e.g., by hot-reload)
      warn(
        `Dictionary for ${language} is not loaded`,
        undefined,
        "wordDictionary",
      );
      throw new Error(`Dictionary for ${language} not loaded`);
    }

    const difficulty = this.getDifficultyFromLevel(level);
    const poolKey = `${language}-${isBoss ? "boss" : "regular"}-${difficulty}`;

    // Get the word pool
    const wordPool = isBoss
      ? data.boss_words[difficulty]
      : data.keywords[difficulty];

    // Initialize available words if not exists or empty
    const remainingWords = this.availableWords.get(poolKey);
    if (!remainingWords || remainingWords.length === 0) {
      // Shuffle the entire word pool using Fisher-Yates
      const shuffled = [...wordPool];
      for (let index = shuffled.length - 1; index > 0; index--) {
        const index_ = Math.floor(Math.random() * (index + 1));
        const currentWord = shuffled[index];
        const replacementWord = shuffled[index_];
        if (currentWord === undefined || replacementWord === undefined) {
          continue;
        }
        shuffled[index] = replacementWord;
        shuffled[index_] = currentWord;
      }
      this.availableWords.set(poolKey, shuffled);
    }

    // Get next word from available pool
    const available = this.availableWords.get(poolKey);
    const word = available?.pop();
    if (word === undefined) {
      throw new Error(`No words available in ${poolKey}`);
    }

    // If pool is now empty, it will be refilled on next call
    return word;
  }

  /**
   * Determine difficulty tier based on level
   */
  private getDifficultyFromLevel(
    level: number,
  ): "beginner" | "intermediate" | "advanced" {
    if (level <= WORD_DIFFICULTY_THRESHOLDS.beginnerMaximum) return "beginner";
    if (level <= WORD_DIFFICULTY_THRESHOLDS.intermediateMaximum)
      return "intermediate";
    return "advanced";
  }

  /**
   * Get the appropriate language key for the game mode
   */
  getLanguageKey(mode: GameMode, language?: ProgrammingLanguage): string {
    if (mode === GameMode.NORMAL) {
      return "normal";
    }

    if (language && mode === GameMode.PROGRAMMING) {
      return LANGUAGE_FILE_MAP[language] ?? "python";
    }

    return "normal";
  }
}

// Singleton instance
export const wordDictionary = new WordDictionary();
