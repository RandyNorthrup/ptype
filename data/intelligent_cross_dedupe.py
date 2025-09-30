#!/usr/bin/env python3
"""
Intelligent cross-language deduplication for P-Type.

Removes inappropriate duplicates between languages while preserving
valid shared keywords and syntax that belong in multiple languages.
"""

import os
from pathlib import Path
import yaml
from typing import Dict, List, Set, Tuple

# Define which words are legitimately shared across languages
COMMON_PROGRAMMING_KEYWORDS = {
    # Basic keywords that exist in multiple languages
    'function', 'class', 'if', 'else', 'for', 'while', 'return', 'true', 'false',
    'null', 'undefined', 'int', 'string', 'boolean', 'void', 'public', 'private',
    'static', 'final', 'const', 'let', 'var', 'new', 'this', 'super', 'extends',
    'implements', 'interface', 'enum', 'try', 'catch', 'finally', 'throw',
    # Basic types
    'number', 'boolean', 'object', 'array', 'list', 'dictionary',
    # Cleaned syntax patterns that are valid in multiple contexts
    'basic data type', 'control structure', 'method definition', 'variable assignment'
}

def load_language_file(file_path: Path) -> Dict[str, List[str]]:
    """Load a language file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return {}

def save_language_file(file_path: Path, data: Dict[str, List[str]]) -> None:
    """Save to YAML file."""
    with open(file_path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True)

def get_language_family(language: str) -> str:
    """Get the language family for context-aware deduplication."""
    lang = language.lower()
    if lang in ['javascript', 'java', 'csharp', 'cplusplus']:
        return 'c_family'
    elif lang in ['python']:
        return 'python'
    elif lang in ['css']:
        return 'css'
    elif lang in ['html']:
        return 'html'
    else:
        return 'other'

def is_valid_shared_word(word: str, language1: str, language2: str) -> bool:
    """Check if a word can legitimately be shared between two languages."""
    # Always allow sharing if it's in the common keywords list
    if word.lower() in COMMON_PROGRAMMING_KEYWORDS:
        return True

    # Check language families - C-family languages share more syntax
    family1 = get_language_family(language1)
    family2 = get_language_family(language2)

    # C-family languages can share basic syntax patterns
    if family1 == 'c_family' and family2 == 'c_family':
        # Allow basic C-style syntax to be shared
        c_syntax_patterns = [
            'for loop', 'while loop', 'if statement', 'variable declaration',
            'function call', 'method signature', 'class definition'
        ]
        return any(pattern in word.lower() for pattern in c_syntax_patterns)

    # Very basic patterns can be shared across all programming languages
    universal_patterns = [
        'basic syntax', 'data type', 'control flow', 'variable scope',
        'function parameter', 'return statement', 'error handling'
    ]
    return any(pattern in word.lower() for pattern in universal_patterns)

def intelligent_cross_deduplication():
    """Perform intelligent cross-language deduplication."""
    data_dir = Path(__file__).parent

    languages = {
        'python': 'Python-like',
        'javascript': 'C-family',
        'java': 'C-family',
        'csharp': 'C-family',
        'cplusplus': 'C-family',
        'css': 'Style',
        'html': 'Markup'
    }

    print("=== INTELLIGENT CROSS-LANGUAGE DEDUPLICATION ===\n")

    # Load all language data
    language_data = {}
    word_to_languages = {}  # Track which languages use each word

    for lang, family in languages.items():
        file_path = data_dir / f"{lang}_words.yaml"
        data = load_language_file(file_path)
        language_data[lang] = data

        # Build word-to-languages mapping
        for difficulty, words in data.items():
            if isinstance(words, list):
                for word in words:
                    if isinstance(word, str):
                        word = word.strip().lower()
                        if word not in word_to_languages:
                            word_to_languages[word] = []
                        word_to_languages[word].append(lang)

    print(f"Loaded {len(language_data)} languages and {len(word_to_languages)} unique words.\n")

    # Process each language to remove inappropriate duplicates
    cleaned_data = {}

    for lang in languages:
        print(f"🧹 Processing {lang}...")

        cleaned_language = {}
        words_removed = 0
        original_count = 0

        for difficulty, words in language_data[lang].items():
            if isinstance(words, list):
                cleaned_words = []
                original_count += len(words)

                for word in words:
                    if isinstance(word, str):
                        word_clean = word.strip()
                        word_lower = word_clean.lower()

                        # Allow valid shared words
                        users = word_to_languages.get(word_lower, [])
                        if len(users) == 1:  # Word only in this language
                            cleaned_words.append(word_clean)
                        elif len(users) <= 3:  # Word in 2-3 languages, check if valid
                            valid_shared = all(
                                is_valid_shared_word(word_lower, lang, other)
                                for other in users if other != lang
                            )
                            if valid_shared:
                                cleaned_words.append(word_clean)
                            else:
                                words_removed += 1
                        else:  # Word in 4+ languages - too generic
                            if word_lower in COMMON_PROGRAMMING_KEYWORDS:
                                cleaned_words.append(word_clean)
                            else:
                                words_removed += 1

                cleaned_language[difficulty] = cleaned_words

        cleaned_count = sum(len(words) for words in cleaned_language.values() if isinstance(words, list))
        print(f"   {original_count} → {cleaned_count} words ({words_removed} removed)")
        cleaned_data[lang] = cleaned_language

    # Save cleaned data
    print("\n💾 Saving cleaned language files...")
    for lang, data in cleaned_data.items():
        file_path = data_dir / f"{lang}_words.yaml"
        save_language_file(file_path, data)
        word_count = sum(len(words) for words in data.values() if isinstance(words, list))
        print("12".format(lang, word_count))

    # Final verification
    print("\n=== FINAL VERIFICATION ===")

    total_words = 0
    for lang, data in cleaned_data.items():
        lang_words = set()
        for words in data.values():
            if isinstance(words, list):
                lang_words.update(word.strip().lower() for word in words if isinstance(word, str))

        total_words += len(lang_words)

        # Check for words unique to this language vs shared
        unique_count = 0
        shared_count = 0
        for word in lang_words:
            users = word_to_languages.get(word, [])
            if len(users) == 1 and users[0] == lang:
                unique_count += 1
            else:
                shared_count += 1

        print("12".format(lang, len(lang_words), unique_count, shared_count))

    unique_words = len(set().union(*[
        set(word.strip().lower() for words in data.values()
            if isinstance(words, list) for word in words if isinstance(word, str))
        for data in cleaned_data.values()
    ]))

    print("35".format(total_words, unique_words))
    print("\n✅ Intelligent cross-language deduplication complete!")
if __name__ == '__main__':
    intelligent_cross_deduplication()
