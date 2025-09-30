#!/usr/bin/env python3
"""
Expansion script for P-Type language dictionaries.

Expands each language to 250+ unique words/phrases per difficulty level
by generating intelligent variations of existing code snippets.
"""

import random
import yaml
from pathlib import Path
from typing import List, Dict, Set
import re

# Variation patterns for different types of code snippets
VARIATIONS = {
    'function_calls': {
        'templates': ['{func}({args})', '{var}.{func}({args})', 'await {func}({args})'],
        'functions': ['call', 'process', 'handle', 'generate', 'load', 'save', 'update', 'delete', 'fetch', 'send'],
        'args': ['', '"text"', '123', 'true', 'false', 'null', '[1,2,3]', '{key:"value"}', 'callback'],
    },
    'variable_declarations': {
        'templates': ['{type} {var} = {value}', 'const {var} = {value}', 'let {var} = {value}', 'var {var} = {value}'],
        'types': ['int', 'string', 'bool', 'float', 'double'],
        'variables': ['value', 'result', 'data', 'item', 'temp', 'count', 'index', 'size', 'length', 'total'],
        'values': ['0', '"hello"', 'true', 'null', '[]', '{}', '42', '3.14'],
    },
    'class_definitions': {
        'templates': ['class {class_name} {', 'public class {class_name} {', 'export class {class_name} {'],
        'class_names': ['Controller', 'Service', 'Manager', 'Handler', 'Processor', 'Factory', 'Builder'],
    },
    'loops': {
        'templates': ['for (let {var} = 0; {var} < {num}; {var}++) {', 'while ({condition}) {', 'for ({var} of {array}) {'],
        'variables': ['i', 'j', 'k', 'index', 'count', 'item'],
        'numbers': ['10', '100', 'array.length', 'items.size()', 'list.len()'],
        'conditions': ['true', 'condition', 'running', 'active', 'i < 100'],
        'arrays': ['items', 'data', 'array', 'list', 'collection'],
    },
    'conditionals': {
        'templates': ['if ({condition}) {', 'else if ({condition}) {', '{condition} ? {then} : {else}'],
        'conditions': ['x > 5', 'value == null', 'arr.length > 0', 'user.active', 'count >= 10'],
        'then_values': ['true', '"success"', '1', 'result'],
        'else_values': ['false', '"error"', '0', 'null'],
    },
    'method_definitions': {
        'templates': ['function {name}({params}) {', '{visibility} {return_type} {name}({params}) {', 'def {name}({params}):'],
        'names': ['calculate', 'process', 'validate', 'save', 'load', 'update', 'delete', 'get', 'set', 'find'],
        'params': ['', 'param', 'a, b', 'data', 'id, value', 'callback'],
        'visibilities': ['public', 'private', 'protected', ''],
        'return_types': ['void', 'int', 'string', 'boolean', 'Object', ''],
    },
}

def generate_variation(template: str, category: Dict[str, List[str]]) -> str:
    """Generate a variation of a code template."""
    result = template

    # Replace all placeholders in the template
    for key, values in category.items():
        if '{' + key + '}' in result:
            result = result.replace('{' + key + '}', random.choice(values))

    return result

def generate_similar_patterns(original: str, count: int = 10) -> List[str]:
    """Generate similar patterns based on an original snippet."""
    variations = []
    snippet_lower = original.lower()

    # Categorize the snippet
    if any(keyword in snippet_lower for keyword in ['class', 'public class', 'export class']):
        category = VARIATIONS['class_definitions']
    elif any(keyword in snippet_lower for keyword in ['function', 'def ', 'public ', 'private ', 'protected ']):
        category = VARIATIONS['method_definitions']
    elif any(keyword in snippet_lower for keyword in ['for ', 'while ', 'for(']):
        category = VARIATIONS['loops']
    elif any(keyword in snippet_lower for keyword in ['if ', 'else if', '? ']):
        category = VARIATIONS['conditionals']
    elif any(keyword in snippet_lower for keyword in ['const ', 'let ', 'var ', '= ']):
        category = VARIATIONS['variable_declarations']
    else:
        category = VARIATIONS['function_calls']

    # Generate variations
    for _ in range(count):
        for template in category['templates']:
            variation = generate_variation(template, category)
            if variation not in variations and len(variation) > 5:
                variations.append(variation)
                break

    # If we couldn't generate enough variations, add modified versions of original
    while len(variations) < count:
        # Modify numbers, variable names, etc. in original
        modified = original
        modified = re.sub(r'\b\d+\b', lambda m: str(random.randint(1, 100)), modified)
        modified = re.sub(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', lambda m: random.choice([
            'temp', 'value', 'data', 'result', 'item', 'count', 'index', 'key']), modified)
        if modified not in variations and modified != original:
            variations.append(modified)

    return variations

def expand_language_file(file_path: Path) -> None:
    """Expand a single language file to 250+ entries per difficulty level."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f) or {}

        expanded_data = {}

        for difficulty, words in data.items():
            if isinstance(words, list):
                print(f"  {difficulty}: Expanding from {len(words)} to 250+ entries...")

                expanded_words = list(words)  # Start with original words
                target_per_difficulty = 250

                # Generate variations for each existing word to reach target
                while len(expanded_words) < target_per_difficulty:
                    for original_word in words:
                        if len(expanded_words) >= target_per_difficulty:
                            break

                        # Generate 3-5 variations of this word
                        variations = generate_similar_patterns(original_word, random.randint(3, 5))

                        for variation in variations:
                            if len(expanded_words) >= target_per_difficulty:
                                break
                            if variation not in expanded_words:
                                expanded_words.append(variation)

                # Remove duplicates one final time
                expanded_words = list(set(expanded_words))

                expanded_data[difficulty] = expanded_words
                print(f"    → {len(expanded_words)} unique entries generated")

        # Save expanded data
        with open(file_path, 'w', encoding='utf-8') as f:
            yaml.dump(expanded_data, f, default_flow_style=False, allow_unicode=True)

        print(f"✅ Expanded: {file_path.name}")

    except Exception as e:
        print(f"❌ Error expanding {file_path}: {e}")

def expand_all_languages() -> None:
    """Expand all language files to 250+ entries per difficulty level."""
    print("🚀 EXPANDING ALL LANGUAGES TO 250+ WORDS PER DIFFICULTY LEVEL\n")

    data_dir = Path(__file__).parent
    language_files = [
        'python_words.yaml',
        'javascript_words.yaml',
        'java_words.yaml',
        'csharp_words.yaml',
        'cplusplus_words.yaml',
        'css_words.yaml',
        'html_words.yaml'
    ]

    for lang_file in language_files:
        file_path = data_dir / lang_file
        if file_path.exists():
            print(f"🔧 Processing {lang_file}...")
            expand_language_file(file_path)
        else:
            print(f"⚠️  File not found: {lang_file}")

    print(f"\n🎉 Expansion complete! All languages now have 250+ words per difficulty level.")
    print("Each language can generate hundreds of gameplay sessions with unique challenges.")

if __name__ == '__main__':
    expand_all_languages()
