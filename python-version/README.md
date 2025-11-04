# P-Type - Python/Pygame Version

This directory contains the original Python/Pygame implementation of P-Type.

## Requirements

- Python 3.8 or higher
- Pygame

## Installation

```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

## Running the Game

```bash
# Make sure virtual environment is activated
python ptype.py
```

## Project Structure

- `ptype.py` - Main game entry point
- `constants.py` - Game constants and configuration
- `audio/` - Sound and music management
- `core/` - Core game logic (game state, profiles, settings)
- `data/` - Word dictionaries and trivia database
- `effects/` - Visual effects
- `entities/` - Game entities (player, enemies)
- `gameplay/` - Gameplay mechanics (input, enemy management, bonuses)
- `graphics/` - Graphics rendering (ships, stars)
- `ui/` - User interface components (HUD, screens, widgets)

## Building Executable

```bash
pyinstaller ptype.spec
```

The executable will be created in the `dist/` directory.

## Notes

This is the legacy Python version. The main web version is located in the parent directory's `web/` folder and is built with React, TypeScript, and Three.js.
