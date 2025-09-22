
# Changelog

## [1.5.2] - 2025-09-22

### Fixed
- Universal macOS and Linux build support in GitHub Actions
- Architecture mismatch errors on macOS x86_64
- Improved workflow for multi-arch compatibility

### Changed
- Updated dependencies and version info


All notable changes to P-Type - The Typing Game will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-19

### 🚀 Major Update - Enhanced Boss System & Extended Gameplay

#### Added
- **100-Level Progression System**
  - Expanded from 20 to 100 levels for extended gameplay
  - Maximum WPM increased from 300 to 400
  - Smoother difficulty curve across all levels

- **Enhanced Boss AI**
  - Aggressive movement patterns that actively hunt the player
  - Horizontal tracking with smooth lag for fairness
  - Dynamic target recalculation (5% chance per frame)
  - Boss-specific movement properties

- **Improved Boss Features**
  - Level-scaled collision damage (30 HP at level 1, 80 HP at level 100)
  - Better speed scaling for 100-level progression
  - Programming mode boss speed adjustments based on code length
  - Boss level stored for accurate damage calculation

- **Visual Improvements**
  - Fixed z-order rendering for boss words (always on top)
  - Shield effects render behind everything
  - Active indicator rings render behind ship
  - Words render on top of all effects for maximum visibility

#### Fixed
- Sound effects not working in compiled builds (added numpy dependency)
- Boss words being obscured by forcefield/shield effects
- Boss movement not targeting player correctly
- Data directory missing in GitHub Actions builds
- PyInstaller build failures due to missing directories

#### Changed
- Boss speed calculations completely redesigned for 100 levels
- Boss collision damage now scales with progression
- Settings now stored in user home directory (~/.ptype/)
- Build workflow includes numpy for sound generation

#### Technical
- Added numpy>=1.24.0 as core dependency
- Updated GitHub Actions workflow for proper builds
- Added hidden imports for PyInstaller (numpy)
- Created empty data directory during builds

## [1.0.0] - 2025-01-19

### 🎉 Initial Release - Launch Edition

#### Features
- **Core Gameplay**
  - Modern typing game with falling word mechanics
  - Smooth 60 FPS gameplay with responsive controls
  - Progressive difficulty across 20 levels (20-300 WPM)
  - Health and shield system with collision mechanics

- **Game Modes**
  - **Normal Mode**: 500+ word English dictionary (beginner, intermediate, advanced)
  - **Programming Mode**: Training for 7 programming languages
    - Python, JavaScript, Java, C#, C++, CSS, HTML
    - Real code snippets and syntax practice

- **Boss Battles**
  - Challenging boss encounters at level completion
  - Reduced boss speeds (5-8% of base) for balanced gameplay
  - Special visual effects and animations
  - High damage on collision (75% health without shield)

- **Visual Design**
  - Modern UI with 3D-style ship graphics
  - Smooth animations and particle effects
  - Custom spaceship icon for window and executable
  - Responsive design that adapts to window size
  - Background starfield with twinkling effects

- **Audio**
  - Background music with volume control
  - Sound effects for typing, explosions, and collisions
  - Adjustable audio settings

- **Player Features**
  - Multiple player profiles support
  - Save/load game functionality
  - High score tracking
  - Detailed statistics (WPM, accuracy, streaks)
  - Continue from saved games

- **Quality of Life**
  - Smart dropdown menus with scrolling
  - Full keyboard support including special characters
  - Pause menu with save option
  - Settings persistence
  - EMP weapon for clearing screen

#### Technical
- Built with Python 3.11 and Pygame 2.5.2
- Cross-platform support (Windows, macOS, Linux)
- GitHub Actions for automated builds
- PyInstaller configuration for standalone executables
- Optimized performance with efficient rendering

#### Assets
- Custom spaceship icon
- Logo image
- Background music (3MB MP3)
- All assets bundled in executable

#### Known Issues
- macOS users may need to allow app in Security settings
- Some special characters may not register on certain keyboard layouts

### Contributors
- Created by Randy Northrup

### License
MIT License - See LICENSE file for details

---

## Version History

- **1.0.0** (2025-01-19) - Initial Release: Launch Edition