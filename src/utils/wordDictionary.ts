/**
 * Word Dictionary Loader for Web Version
 * Loads YAML dictionaries and provides word selection for enemies
 */

import type { ProgrammingLanguage } from "../types";
import { GameMode, LANGUAGE_FILE_MAP } from "../types";
import { load as loadYAML } from "js-yaml";
import { warn, error as logError } from "./logger";
import { publicAssetUrl } from "./publicAssetUrl";
import {
  getWordTier,
  prepareWordPools,
  type WordData,
  type PreparedWordData,
  type WordSource,
} from "./wordPools";
import { WiktionarySource, type WiktionaryLanguage } from "./wiktionary";

const WIKTIONARY_KEY_PREFIX = "wiktionary:";
const DICTIONARY_CACHE_LIMITS = { wiktionaryLanguages: 8 } as const;

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
  private wiktionary = new WiktionarySource();
  private preparedWiktionary = new Map<string, PreparedWordData>();

  async getWiktionaryLanguages(
    signal?: AbortSignal,
  ): Promise<WiktionaryLanguage[]> {
    return await this.wiktionary.getLanguages(signal);
  }

  /**
  Font eligibility is required; unsupported titles cannot silently start a game.
  */
  async loadWiktionary(
    code: string,
    canRenderText: (text: string) => boolean,
    signal?: AbortSignal,
  ): Promise<WordData> {
    const entries = await this.wiktionary.getEntries(code, signal);
    if (signal?.aborted)
      throw new DOMException("Wiktionary preparation aborted", "AbortError");
    const prepared = prepareWordPools(entries, code, canRenderText);
    const key = `${WIKTIONARY_KEY_PREFIX}${code}`;
    if (
      !this.preparedWiktionary.has(key) &&
      this.preparedWiktionary.size >=
        DICTIONARY_CACHE_LIMITS.wiktionaryLanguages
    ) {
      const oldest = this.preparedWiktionary.keys().next().value;
      if (oldest !== undefined) {
        this.preparedWiktionary.delete(oldest);
        this.cache.delete(oldest);
        for (const pool of this.availableWords.keys()) {
          if (pool.startsWith(`${oldest}-`)) this.availableWords.delete(pool);
        }
      }
    }
    for (const pool of this.availableWords.keys()) {
      if (pool.startsWith(`${key}-`)) this.availableWords.delete(pool);
    }
    this.preparedWiktionary.set(key, prepared);
    this.cache.set(key, prepared.data);
    return prepared.data;
  }

  getWordSources(language: string, word: string): WordSource[] {
    return this.preparedWiktionary.get(language)?.sources.get(word) ?? [];
  }

  isGeneratedPractice(language: string, word: string): boolean {
    return this.preparedWiktionary.get(language)?.generated.has(word) ?? false;
  }

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
      const response = await fetch(
        publicAssetUrl(`data/${language}_words.yaml`),
      );

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

    const difficulty = getWordTier(level);
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
   * Get the appropriate language key for the game mode
   */
  getLanguageKey(
    mode: GameMode,
    language?: ProgrammingLanguage,
    wordLanguage?: string,
  ): string {
    if (mode === GameMode.WIKTIONARY) {
      if (!wordLanguage)
        throw new Error("Wiktionary requires a selected word language");
      return `${WIKTIONARY_KEY_PREFIX}${wordLanguage}`;
    }
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
