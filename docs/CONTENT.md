# Content inventory

P-Type ships its gameplay content as YAML in [`public/data`](../public/data).
The browser validates every document while loading it; malformed entries fail
closed and are reported through the application logger.

The inventory below was verified against the repository on August 24, 2026.

## Word dictionaries

Each dictionary contains `beginner`, `intermediate`, and `advanced` regular
word lists plus the same three tiers under `boss_words`.

| File                    |    Regular |      Boss |      Total |
| ----------------------- | ---------: | --------: | ---------: |
| `cplusplus_words.yaml`  |      1,265 |       207 |      1,472 |
| `csharp_words.yaml`     |      1,254 |       239 |      1,493 |
| `css_words.yaml`        |      1,009 |       159 |      1,168 |
| `html_words.yaml`       |      1,103 |       153 |      1,256 |
| `java_words.yaml`       |      1,388 |       241 |      1,629 |
| `javascript_words.yaml` |      1,389 |       257 |      1,646 |
| `normal_words.yaml`     |      1,237 |       274 |      1,511 |
| `python_words.yaml`     |      1,600 |       276 |      1,876 |
| **Total**               | **10,245** | **1,806** | **12,051** |

Regular words use the beginner tier through level 30, intermediate through
level 70, and advanced afterward. Boss lists use the same thresholds. Pools are
shuffled and exhausted before they are refilled, reducing immediate repetition.

## Trivia

`trivia.yaml` contains 368 validated questions across 10 categories:

| Category    | Questions |
| ----------- | --------: |
| Pop culture |        17 |
| Sports      |        18 |
| History     |        18 |
| Python      |        45 |
| JavaScript  |        45 |
| Java        |        45 |
| C#          |        45 |
| C++         |        45 |
| CSS         |        45 |
| HTML        |        45 |
| **Total**   |   **368** |

Programming games select questions from the active language. Normal games use
the three general categories. Each category may supply beginner, intermediate,
and advanced lists; a missing difficulty falls back to that category's beginner
list, and unavailable data falls back to a built-in arithmetic question.

The complete repository inventory is 12,419 words, boss phrases, and trivia
questions.

## Editing content safely

1. Preserve the existing YAML mappings and list shapes.
2. Keep every word value a string.
3. Give each trivia item a nonempty question, at least two nonempty string
   options, and a zero-based integer `correct` index within that list. Empty
   trivia datasets fail loading. Failed requests are rejected and may be retried;
   concurrent requests share one fetch.
4. Run `npm test` to execute loader validation and `npm run quality` before
   submitting the change.
