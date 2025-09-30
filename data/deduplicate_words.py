#!/usr/bin/env python3
"""
Deduplication script for P-Type word dictionaries.

Removes duplicate words/phrases from all language files and normal words.
Ensures no repeats within files, between difficulties in same language,
and across all language files.
"""

import os
from pathlib import Path
import yaml
from typing import Dict, List, Set


def load_yaml_file(file_path: Path) -> Dict[str, List[str]]:
    """Load a YAML file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return {}


def save_yaml_file(file_path: Path, data: Dict[str, List[str]]) -> None:
    """Save data to YAML file."""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
        print(f"Saved deduplicated: {file_path}")
    except Exception as e:
        print(f"Error saving {file_path}: {e}")


def deduplicate_within_difficulties(data: Dict[str, List[str]]) -> Dict[str, List[str]]:
    """Remove duplicates within each difficulty level."""
    result = {}
    for difficulty, words in data.items():
        if isinstance(words, list):
            # Remove duplicates while preserving order
            unique_words = []
            seen = set()
            for word in words:
                if isinstance(word, str) and word.strip() and word not in seen:
                    unique_words.append(word.strip())
                    seen.add(word)
            result[difficulty] = unique_words
            print(f"  {difficulty}: {len(words)} → {len(unique_words)} unique words")
        else:
            result[difficulty] = words
    return result


def deduplicate_across_difficulties(data: Dict[str, List[str]]) -> Dict[str, List[str]]:
    """Remove words that appear in higher difficulties from lower difficulties."""
    difficulties = ['beginner', 'intermediate', 'advanced']
    seen_words = set()

    result = {}
    for difficulty in difficulties:
        if difficulty in data and isinstance(data[difficulty], list):
            words = data[difficulty]
            unique_words = []
            for word in words:
                if isinstance(word, str) and word.strip() and word not in seen_words:
                    unique_words.append(word.strip())
                    seen_words.add(word)
            result[difficulty] = unique_words
            print(f"  {difficulty}: {len(words)} → {len(unique_words)} unique words (no overlaps)")
        else:
            result[difficulty] = data.get(difficulty, [])

    return result


def deduplicate_all_languages():
    """Process all language files and normal words."""
    data_dir = Path(__file__).parent
    all_seen_words: Set[str] = set()

    languages = [
        'normal',
        'python',
        'javascript',
        'java',
        'csharp',
        'cplusplus',
        'css',
        'html'
    ]

    print("=== DEDUPLICATING ALL WORD FILES ===\n")

    for language in languages:
        file_path = data_dir / f"{language}_words.yaml"
        if not file_path.exists():
            print(f"⚠️  File not found: {file_path}")
            continue

        print(f"🔍 Processing {language}...")

        # Load data
        data = load_yaml_file(file_path)
        if not data:
            continue

        original_total = sum(len(words) if isinstance(words, list) else 0 for words in data.values())

        # First pass: deduplicate within each difficulty
        data = deduplicate_within_difficulties(data)

        # Second pass: deduplicate across difficulties (lower to higher priority)
        data = deduplicate_across_difficulties(data)

        # Third pass: deduplicate across ALL languages (no shared words)
        final_data = {}
        lang_seen_this_file = set()

        for difficulty, words in data.items():
            if isinstance(words, list):
                unique_words = []
                for word in words:
                    if isinstance(word, str) and word.strip():
                        word = word.strip()
                        if word not in all_seen_words and word not in lang_seen_this_file:
                            unique_words.append(word)
                            all_seen_words.add(word)
                            lang_seen_this_file.add(word)
                final_data[difficulty] = unique_words

        final_total = sum(len(words) if isinstance(words, list) else 0 for words in final_data.values())

        print(f"📊 {language}: {original_total} → {final_total} words ({original_total - final_total} duplicates removed)")
        print(f"   Difficulties: " + ", ".join([f"{k}={len(v) if isinstance(v, list) else 0}" for k, v in final_data.items()]))
        print()

        # Save the deduplicated data back to the file
        save_yaml_file(file_path, final_data)

    print(f"🎉 Deduplication complete!")
    print(f"Total unique words across all files: {len(all_seen_words)}")
    print("All files processed: normal, python, javascript, java, csharp, cplusplus, css, html")


if __name__ == '__main__':
    deduplicate_all_languages()
