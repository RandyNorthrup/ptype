"""Word dictionaries for P-Type."""
from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Dict, List, Optional

from core.types import GameMode, ProgrammingLanguage


try:
    import yaml
except ImportError:
    yaml = None
    print("Warning: PyYAML not found. Install with: pip install PyYAML")


class WordDictionary:
    """Progressive word lists for normal and programming modes."""

    DIFFICULTY_BUCKETS = {'beginner': 1, 'intermediate': 2, 'advanced': 3}

    # Progressive difficulty scaling - makes difficulty increase more gradually
    LEVEL_DIFFICULTY_MAPPING = {
        # Levels 1-3: Very easy beginner
        range(1, 4): {'bucket': 'beginner', 'max_length': 5, 'min_length': 2},
        # Levels 4-6: Easy beginner
        range(4, 7): {'bucket': 'beginner', 'max_length': 8, 'min_length': 3},
        # Levels 7-9: Standard beginner
        range(7, 10): {'bucket': 'beginner', 'max_length': 10, 'min_length': 4},

        # Levels 10-12: Easy intermediate
        range(10, 13): {'bucket': 'intermediate', 'max_length': 12, 'min_length': 5},
        # Levels 13-15: Standard intermediate
        range(13, 16): {'bucket': 'intermediate', 'max_length': 15, 'min_length': 6},
        # Levels 16-18: Advanced intermediate
        range(16, 19): {'bucket': 'intermediate', 'max_length': 18, 'min_length': 7},

        # Levels 19-21: Easy advanced
        range(19, 22): {'bucket': 'advanced', 'max_length': 22, 'min_length': 8},
        # Levels 22-25: Standard advanced
        range(22, 26): {'bucket': 'advanced', 'max_length': 26, 'min_length': 9},
        # Levels 26+: Hard advanced (unlimited)
        range(26, 101): {'bucket': 'advanced', 'max_length': 999, 'min_length': 10},
    }

    # Boss spawn triggers - bosses appear at specific level endings
    BOSS_LEVELS = {5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100}

    @classmethod
    def is_boss_level(cls, level: int) -> bool:
        """Check if a level should spawn a boss."""
        return level in cls.BOSS_LEVELS

    _cache: Dict[str, Dict] = {}

    @classmethod
    def _load_language_data(cls, language) -> Optional[Dict[str, List[str]]]:
        """Load language data from external YAML/JSON file if available."""
        if not yaml:
            return None

        # Handle both enum and string inputs
        if hasattr(language, 'value'):
            lang_name = language.value.lower()
        else:
            lang_name = str(language).lower()

        # Special case for normal mode
        if lang_name == 'normal':
            lang_name = 'normal'

        # Try YAML first, then JSON
        data_dir = Path(__file__).parent
        for ext in ['yaml', 'yml', 'json']:
            file_path = data_dir / f"{lang_name}_words.{ext}"
            if file_path.exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        if ext == 'json':
                            data = json.load(f)
                        else:
                            data = yaml.safe_load(f)
                        cls._cache[lang_name] = data
                        return data
                except Exception as e:
                    print(f"Warning: Could not load {file_path}: {e}")
        return None

    @classmethod
    def _get_programming_words(cls, language: ProgrammingLanguage, difficulty: str) -> List[str]:
        """Get words for a specific language and difficulty from external files only."""
        lang_name = language.value.lower()
        if lang_name not in cls._cache:
            cls._load_language_data(language)

        if lang_name in cls._cache and difficulty in cls._cache[lang_name]:
            return cls._cache[lang_name][difficulty]

        # No fallbacks - if external file missing, return empty list
        return []

    # No embedded fallback data - all word data contained in external YAML files only
    # If YAML files are missing, the game will have no words available


    @classmethod
    def _get_level_config(cls, level: int) -> Dict[str, any]:
        """Get difficulty bucket and word length constraints for a given level."""
        for level_range, config in cls.LEVEL_DIFFICULTY_MAPPING.items():
            if level in level_range:
                return config

        # Default for very high levels
        return {'bucket': 'advanced', 'max_length': 999, 'min_length': 10}

    @classmethod
    def _filter_words_by_length(cls, words: List[str], min_length: int, max_length: int) -> List[str]:
        """Filter words to only include those within length constraints."""
        return [word for word in words if min_length <= len(word) <= max_length]

    @classmethod
    def get_word_entry(cls, mode: GameMode, language: Optional[ProgrammingLanguage] = None, level: int = 1):
        """Return a random word and its difficulty bucket (1-3) with progressive difficulty.

        Only uses external YAML files - no embedded fallbacks remain.
        Returns ('', 1) if no words are available.
        """
        level_config = cls._get_level_config(level)
        bucket = level_config['bucket']
        max_length = level_config['max_length']
        min_length = level_config['min_length']

        if mode == GameMode.NORMAL:
            # Load normal words from normal_words.yaml
            normal_data = cls._load_language_data('normal')  # Direct string approach
            if normal_data and bucket in normal_data:
                base_words = normal_data[bucket]
                filtered_words = cls._filter_words_by_length(base_words, min_length, max_length)
                words = filtered_words if filtered_words else base_words
            else:
                words = []
        elif mode == GameMode.PROGRAMMING and language:
            # Load programming words from language-specific YAML
            external_words = cls._get_programming_words(language, bucket)
            if external_words:
                base_words = external_words
                filtered_words = cls._filter_words_by_length(base_words, min_length, max_length)
                words = filtered_words if filtered_words else base_words
            else:
                words = []
        else:
            words = []

        if not words:
            return '', 1  # Return empty string if no words available

        word = random.choice(words)
        difficulty = cls.DIFFICULTY_BUCKETS.get(bucket, 1)
        return word, difficulty

    @classmethod
    def get_boss_entry(cls, mode: GameMode, language: Optional[ProgrammingLanguage] = None, level: int = 1):
        """Return a boss word and associated difficulty bucket from external YAML files only."""
        level_config = cls._get_level_config(level)
        bucket = level_config['bucket']

        if mode == GameMode.NORMAL:
            # Load boss words from normal_words.yaml
            normal_data = cls._load_language_data('normal')  # Direct string approach
            if normal_data and 'boss_words' in normal_data and bucket in normal_data['boss_words']:
                words = normal_data['boss_words'][bucket]
            else:
                words = []
        elif mode == GameMode.PROGRAMMING and language:
            # Load boss words from programming language YAML
            lang_data = cls._load_language_data(language)
            if lang_data and 'boss_words' in lang_data and bucket in lang_data['boss_words']:
                words = lang_data['boss_words'][bucket]
            else:
                words = []
        else:
            words = []

        if not words:
            return '', 2  # Return empty string if no boss words available

        return random.choice(words), cls.DIFFICULTY_BUCKETS.get(bucket, 2)

    @classmethod
    def get_words(cls, mode: GameMode, language: Optional[ProgrammingLanguage] = None, level: int = 1) -> List[str]:
        """Return word list with progressive difficulty scaling from external YAML files only."""
        level_config = cls._get_level_config(level)
        bucket = level_config['bucket']
        max_length = level_config['max_length']
        min_length = level_config['min_length']

        if mode == GameMode.NORMAL:
            # Load normal words from normal_words.yaml
            normal_data = cls._load_language_data('normal')  # Direct string approach
            if normal_data and bucket in normal_data:
                base_words = normal_data[bucket]
                filtered_words = cls._filter_words_by_length(base_words, min_length, max_length)
                return filtered_words if filtered_words else base_words
            return []

        if mode == GameMode.PROGRAMMING and language:
            # Load programming words from language-specific YAML
            external_words = cls._get_programming_words(language, bucket)
            if external_words:
                base_words = external_words
                filtered_words = cls._filter_words_by_length(base_words, min_length, max_length)
                return filtered_words if filtered_words else base_words
            return []

        return []

    @classmethod
    def get_boss_word(
        cls,
        mode: GameMode,
        language: Optional[ProgrammingLanguage] = None,
        level: int = 1,
    ) -> str:
        """Get a boss word, prioritizing external YAML files."""
        boss_word, _ = cls.get_boss_entry(mode, language, level)
        return boss_word


__all__ = ["WordDictionary"]
