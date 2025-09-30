#!/usr/bin/env python3
"""
Fix YAML parsing errors and deduplicate all language files.
"""

import os
from pathlib import Path
import yaml
import re

def clean_yaml_content(content):
    """Clean problematic YAML content."""
    # Remove or fix problematic characters
    cleaned = re.sub(r"[{}<>&\[\]]", "", content)  # Remove symbols that break YAML
    cleaned = re.sub(r"['\"]+", "", cleaned)  # Remove quotes
    cleaned = re.sub(r"[;:]", " ", cleaned)  # Replace colons/semicolons with spaces
    return cleaned.strip()

def fix_yaml_file(file_path):
    """Fix a YAML file to be parseable."""
    try:
        # Read raw content
        with open(file_path, 'r', encoding='utf-8') as f:
            raw_content = f.read()

        # Split into sections
        sections = {}
        current_section = None
        current_lines = []

        for line in raw_content.split('\n'):
            line = line.strip()
            if line.endswith(':'):
                if current_section:
                    sections[current_section] = current_lines
                current_section = line[:-1]
                current_lines = []
            elif line.startswith('- ') and current_section:
                # Clean the line content
                clean_content = clean_yaml_content(line[2:])  # Remove '- '
                if clean_content:
                    current_lines.append(clean_content)

        if current_section:
            sections[current_section] = current_lines

        # Create clean YAML structure
        clean_data = {}
        for section, lines in sections.items():
            if section in ['beginner', 'intermediate', 'advanced']:
                clean_data[section] = lines

        # Write back as clean YAML
        with open(file_path, 'w', encoding='utf-8') as f:
            yaml.dump(clean_data, f, default_flow_style=False, allow_unicode=True)

        print(f"✅ Fixed: {file_path.name}")
        return clean_data

    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return None

def deduplicate_within_file(data):
    """Remove duplicates within a single file."""
    result = {}
    for difficulty, words in data.items():
        if isinstance(words, list):
            unique_words = []
            seen = set()
            for word in words:
                if isinstance(word, str) and word.strip() and word not in seen:
                    unique_words.append(word.strip())
                    seen.add(word)
            result[difficulty] = unique_words
        else:
            result[difficulty] = words
    return result

def main():
    """Fix and deduplicate all language files."""
    data_dir = Path(__file__).parent
    language_files = [
        'python_words.yaml',
        'javascript_words.yaml',
        'java_words.yaml',
        'csharp_words.yaml',
        'cplusplus_words.yaml',
        'html_words.yaml',
        # Keep normal and css as they're already good
    ]

    print("🔧 Fixing and deduplicating language files...\n")

    for lang_file in language_files:
        file_path = data_dir / lang_file

        # Fix the YAML structure first
        data = fix_yaml_file(file_path)

        # Then deduplicate within the file
        if data:
            data = deduplicate_within_file(data)

            # Save the deduplicated version
            with open(file_path, 'w', encoding='utf-8') as f:
                yaml.dump(data, f, default_flow_style=False, allow_unicode=True)

            # Count results
            total_words = sum(len(words) for words in data.values() if isinstance(words, list))
            print(f"   → {total_words} unique words")

    print("\n✅ All language files fixed and deduplicated!")

if __name__ == '__main__':
    main()
