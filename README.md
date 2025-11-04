# P-Type: The Typing Game

A modern, educational typing game where players defend against waves of enemy spaceships by typing words as fast and accurately as possible. Built with React, TypeScript, and Three.js for immersive 3D graphics.

🎮 **Live Demo**: [Deployed on Vercel](https://ptype.vercel.app)

## Versions

This repository contains two versions:

- **Web Version** - Modern React/Three.js implementation (primary, actively developed)
- **[Python Version](./python-version/)** - Original Pygame implementation (legacy reference)

## Features

### Core Gameplay
- **Real-time Typing Combat**: Defend your spaceship by typing words that destroy incoming enemy ships
- **Dynamic Word Destruction**: Type letters from left to right to destroy words - each letter explodes with dramatic particle effects
- **Progressive Difficulty**: Advance through 100 levels with increasing speed and complexity
- **Health & Shield System**: Survive enemy attacks with health points and shield boosts
- **Boss Battles**: Face larger, tougher enemies every 3 levels with enhanced visual effects
- **Enemy Type Progression**: Basic ships in early levels, fast ships appear later with longer words
- **3-Lane Spawn System**: Enemies spawn in three positions (left, center, right) with intelligent rotation

### Game Modes
- **Normal Mode**: Practice typing English words organized by difficulty (beginner/intermediate/advanced)
- **Programming Mode**: Enhance coding skills with syntax and snippets from:
  - Python
  - JavaScript
  - Java
  - C#
  - C++
  - CSS
  - HTML

### Advanced Features
- **EMP Weapon**: Press Enter to trigger area-of-effect attack to clear multiple enemies (with cooldown)
- **Target Switching**: Press Tab to cycle between enemy targets
- **Visual Effects**: 
  - Dynamic laser beams that shoot from player ship wings
  - Orange glowing words with individual letter glow effects
  - 15-particle explosions when letters are destroyed
  - Ship debris explosions on collision with 20-30 particles
  - Dynamic text scaling (larger when far, smaller when close)
- **Smart Enemy AI**: 
  - Ships maintain separation with dynamic collision avoidance
  - Position-based repulsion forces prevent overlapping
  - Word-width-aware boundaries
- **Collision System**: Ships explode into debris particles on contact with player

### Progression & Stats
- **Profile System**: Multiple player profiles with persistent statistics
- **Achievements**: Unlock 18+ achievements for milestones like typing speed, accuracy, and boss defeats
- **Achievement Toasts**: 3-second notification popups when achievements are unlocked
- **High Scores**: Global and personal best scoreboards
- **Detailed Statistics**: Track WPM, accuracy, words typed, perfection streaks, and more
- **Trivia Mode**: Answer programming trivia questions every 2 boss defeats for rewards
- **Smart Word Cycling**: Words are shuffled and cycled to prevent immediate repetition
- **Level Progression**: Advance every 5 words defeated or immediately after defeating a boss

### Technical Features
- **Cross-platform**: Runs on Windows, macOS, and Linux
- **Modern UI**: Resizable window with sleek dark theme and neon accents
- **Audio System**: Procedural sound effects and background music
- **Save/Load**: Continue games across sessions with automatic saving
- **Settings**: Adjustable music/sound volumes and preference control

## Installation & Development

### Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Requirements
- Node.js 18+ and npm
- Modern browser with WebGL support
- Internet connection for 3D models (first load)

## Usage Guide

### Getting Started
1. **Create/Load Profile**: Select or create a player profile to track your progress
2. **Choose Game Mode**: Select Normal mode or choose a programming language
3. **Start Playing**: Type the text displayed on enemy ships to destroy them
4. **Monitor Stats**: Watch your WPM, accuracy, and level in real-time

### Profiles
- **Profile Management**: Create, select, and manage multiple player profiles
- **Persistent Progress**: Stats, achievements, and saves are tied to your profile
- **Statistics Tracking**: Comprehensive metrics across all game modes

### Controls

- **Typing**: Type letters to destroy words letter by letter
- **Backspace**: Delete last character (keeps target locked)
- **Tab**: Switch between enemy targets
- **Enter**: Activate EMP weapon (10-second cooldown)
- **Escape**: Pause/unpause game
- **Auto-targeting**: Automatically targets enemies by first letter
- **Bonus Items**: Arrow keys to cycle through collected power-ups

### Power-ups & Abilities
- **Rapid Fire**: Increased firing rate for a limited time
- **Multi-shot**: Fire multiple projectiles simultaneously
- **Invincibility**: Become temporarily immune to damage
- **Time Slow**: Slow down enemy movement
- **EMP**: Clear all nearby enemies instantly

## Game Mechanics

### Typing System
- Type words exactly as shown on enemy ships
- **Letter-by-Letter Destruction**: Each correct letter explodes with 15 particles in a radial pattern
- **Centered Display**: Remaining letters automatically re-center as word shrinks
- **Orange Glowing Text**: Words glow with orange color (#ff9800) matching the health bar theme
- **Target Locking**: Once a word is targeted, it stays locked until destroyed or Tab is pressed
- **Visual Feedback**: Laser beams shoot from ship wings on each keypress
- Complete words to destroy enemies and earn points

### Progression
- **Levels 1-7**: Beginner difficulty words with basic enemy ships
- **Levels 8-15**: Intermediate difficulty
- **Levels 16+**: Advanced difficulty
- **Boss Battles**: Every 3 levels (3, 6, 9, 12...) with larger ships (2.5x scale)
- **Enemy Types**:
  - **Basic Ships**: Start from level 1, standard speed
  - **Fast Ships**: Begin appearing at level 5, gradually increase in frequency
  - **Fast ships get longer words** for additional challenge
  - **Boss ships always include fast enemies** alongside the boss
- **Dynamic Speed Scaling**: Ships move 2-3x faster than legacy version
  - Regular enemies: 1.0-8.0 speed units
  - Boss enemies: 0.4-2.5 speed units
- **Spawn Control**: Maximum 3 enemies initially, slowly increases to prevent overwhelming
- **Spawn Rate**: 4 seconds base, decreases to 1.5 second minimum as level increases

### Scoring
- **Word Completion**: Base points per word typed
- **Accuracy Bonus**: Higher points for perfect accuracy
- **Combo Multipliers**: Bonus for typing multiple words correctly in sequence
- **Boss Multipliers**: Extra points for defeating boss enemies
- **Survival Bonus**: Points based on game duration and health remaining

### Dynamic Speed Scaling
- **Fast-Paced Action**: Ships move 1.8-10.0 speed units (regular), 0.6-3.5 (bosses)
- **Progressive Difficulty**: Speed increases with level and word complexity
- **3-Lane Spawn System**: Enemies spawn at positions -25, 0, +25 with intelligent rotation
- **Smart Collision Avoidance**: Ships maintain dynamic separation to prevent overlapping
- **Boss Encounters**: Every 3 levels with 2.5x ship scale and double health
- **Enemy Variety**: Basic ships early game, fast ships (20-60% spawn rate) from level 5+

## Tech Stack

Built with modern web technologies:
- **React 19** - UI framework with concurrent features
- **TypeScript 5.9** - Type-safe development
- **Three.js 0.181** / **React Three Fiber** - 3D graphics rendering
- **React Three Drei** - Three.js helpers and abstractions
- **Zustand** - Lightweight state management with persistence
- **Vite 7** - Lightning-fast build tooling and HMR
- **PWA** - Progressive Web App with offline support
- **Vercel** - Serverless deployment platform

### Project Structure
```
src/
├── components/       # React components (UI & game)
├── entities/         # 3D entities (ships, objects)
├── engine/          # Game loop and physics
├── store/           # Zustand state management
├── utils/           # Helpers and utilities
└── data/            # Game data (words, achievements)
```

## Contributing

Contributions are welcome! Please follow these guidelines:

### Code Style
- **TypeScript**: Strict mode enabled, full typing
- **React**: Functional components with hooks, memoization
- **Components**: Single responsibility, test IDs for E2E testing
- **Error Handling**: Comprehensive error logging, no console.log in production
- **State Management**: Zustand with proper selectors and persistence

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Test thoroughly (build, dev server, game mechanics)
5. Commit with clear messages
6. Push and open a Pull Request

## Performance & Optimization

- **Production Build**: 724KB Three.js core, 408KB total gzipped
- **PWA**: 2.4MB precached for offline play
- **React 19**: Automatic memo with compiler optimizations
- **Zero Console Output**: All logging stripped in production
- **Lazy Loading**: Components and assets load on demand
- **WebGL**: Hardware-accelerated 3D rendering

## Troubleshooting

### Common Issues
- **Performance**: Ensure hardware acceleration enabled in browser
- **3D Models**: First load may be slow, models cached after
- **Audio**: Browser autoplay policies may require user interaction
- **Mobile**: Game designed for desktop/laptop with physical keyboard

### Debug Mode
Check browser console for detailed logs in development mode.

## Documentation

Additional documentation in [`docs/`](docs/):
- **[CONTENT.md](docs/CONTENT.md)** - Game content (12,388 words, trivia questions)
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment instructions for Vercel
- **[3D_MODELS_INTEGRATION.md](docs/3D_MODELS_INTEGRATION.md)** - 3D model details

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Developed by Randy Northrup

### Technologies
- React, TypeScript, Three.js, React Three Fiber, React Three Drei
- Vite, Zustand, Vercel
- 3D models generated with Rodin AI and Polyhaven assets
- Icons from Tabler Icons

### Special Thanks
- Open source community for amazing tools and libraries
- Three.js and React Three Fiber communities
- Contributors and players providing feedback

---

**Enjoy improving your typing skills while defending the galaxy! 🚀**
