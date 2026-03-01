/**
 * Word Dictionary Loader for Web Version
 * Loads YAML dictionaries and provides word selection for enemies
 */

import type { ProgrammingLanguage, GameMode } from '../types';
import { LANGUAGE_FILE_MAP } from '../types';
import { warn, error as logError } from './logger';

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

export interface DictionaryCache {
  [key: string]: WordData;
}

class WordDictionary {
  private cache: DictionaryCache = {};
  private loadingPromises: Map<string, Promise<WordData>> = new Map();
  private availableWords: Map<string, string[]> = new Map(); // Remaining words to use

  /**
   * Load a word dictionary from the data folder
   */
  async loadDictionary(language: string): Promise<WordData> {
    // Check cache first
    if (this.cache[language]) {
      return this.cache[language];
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(language);
    if (existingPromise) {
      return existingPromise;
    }

    // Start loading
    const loadPromise = this.fetchDictionary(language);
    this.loadingPromises.set(language, loadPromise);

    try {
      const data = await loadPromise;
      this.cache[language] = data;
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
        throw new Error(`Failed to load ${language} dictionary: ${response.statusText}`);
      }

      const yamlText = await response.text();
      const data = this.parseYAML(yamlText);
      
      return data;
    } catch (err) {
      logError(`Error loading ${language} dictionary`, err, 'wordDictionary');
      throw err;
    }
  }

  /**
   * Simple YAML parser for our dictionary format
   * Handles flat structure: beginner/intermediate/advanced/boss_phrases at root level
   */
  private parseYAML(yamlText: string): WordData {
    const data: WordData = {
      keywords: {
        beginner: [],
        intermediate: [],
        advanced: [],
      },
      boss_words: {
        beginner: [],
        intermediate: [],
        advanced: [],
      },
    };

    let currentSection: 'keywords' | 'boss_words' | null = null;
    let currentDifficulty: 'beginner' | 'intermediate' | 'advanced' | null = null;

    const lines = yamlText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Check for main sections
      if (trimmed === 'boss_words:') {
        currentSection = 'boss_words';
        currentDifficulty = null;
        continue;
      }

      // Check for difficulty levels (can be under keywords or boss_words)
      if (trimmed === 'beginner:') {
        currentDifficulty = 'beginner';
        if (currentSection === null) currentSection = 'keywords';
        continue;
      }
      if (trimmed === 'intermediate:') {
        currentDifficulty = 'intermediate';
        if (currentSection === null) currentSection = 'keywords';
        continue;
      }
      if (trimmed === 'advanced:') {
        currentDifficulty = 'advanced';
        if (currentSection === null) currentSection = 'keywords';
        continue;
      }

      // Parse list items
      if (trimmed.startsWith('- ') && currentSection && currentDifficulty) {
        const value = trimmed.substring(2).trim();
        
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');

        data[currentSection][currentDifficulty].push(cleanValue);
      }
    }

    return data;
  }

  /**
   * Get a random word based on difficulty level with tracking to avoid reuse
   */
  getWord(language: string, level: number, isBoss: boolean = false): string {
    const data = this.cache[language];
    if (!data) {
      // Auto-reload dictionary if cache was cleared (e.g., by hot-reload)
      warn(`Dictionary for ${language} not in cache, will reload on next request`, undefined, 'wordDictionary');
      // Trigger async load (fire and forget)
      this.loadDictionary(language);
      throw new Error(`Dictionary for ${language} not loaded`);
    }

    const difficulty = this.getDifficultyFromLevel(level);
    const poolKey = `${language}-${isBoss ? 'boss' : 'regular'}-${difficulty}`;

    // Get the word pool
    let wordPool: string[];
    if (isBoss) {
      wordPool = data.boss_words[difficulty];
    } else {
      wordPool = data.keywords[difficulty];
    }

    // Initialize available words if not exists or empty
    if (!this.availableWords.has(poolKey) || this.availableWords.get(poolKey)!.length === 0) {
      // Shuffle the entire word pool using Fisher-Yates
      const shuffled = [...wordPool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      this.availableWords.set(poolKey, shuffled);
    }

    // Get next word from available pool
    const available = this.availableWords.get(poolKey)!;
    const word = available.pop()!;

    // If pool is now empty, it will be refilled on next call
    return word;
  }

  /**
   * Determine difficulty tier based on level
   */
  private getDifficultyFromLevel(level: number): 'beginner' | 'intermediate' | 'advanced' {
    if (level <= 30) return 'beginner';
    if (level <= 70) return 'intermediate';
    return 'advanced';
  }

  /**
   * Get the appropriate language key for the game mode
   */
  getLanguageKey(mode: GameMode, language?: ProgrammingLanguage): string {
    if (mode === 'normal') {
      return 'normal';
    }
    
    if (mode === 'programming' && language) {
      return LANGUAGE_FILE_MAP[language] || 'python';
    }
    
    return 'normal';
  }
}

// Singleton instance
export const wordDictionary = new WordDictionary();
