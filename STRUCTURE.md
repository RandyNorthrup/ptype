# P-Type Project Structure

Modern React/TypeScript/Three.js typing game with 3D graphics.

## Root Directory

```
ptype/
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore patterns
├── LICENSE                     # MIT License
├── README.md                   # Main documentation
├── STRUCTURE.md                # This file
├── VERSION                     # Version number
├── package.json                # npm configuration
├── vercel.json                 # Vercel deployment config
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
│
├── api/                        # Serverless API endpoints
├── docs/                       # Documentation
├── public/                     # Static assets (3D models, sounds)
├── scripts/                    # Build and utility scripts
├── src/                        # Source code (main application)
│
└── python-version/             # Legacy Python/Pygame version
```

## Source Code (`/src/`)

Main application source code.

```
src/
├── components/                 # React components
│   ├── MainMenu.tsx            # Main menu UI
│   ├── PauseMenu.tsx           # Pause menu
│   ├── SettingsMenu.tsx        # Settings UI
│   ├── GameCanvas.tsx          # Main 3D game scene
│   ├── SpaceScene.tsx          # 3D background stars
│   ├── CanvasHUD.tsx           # In-game HUD (health, score)
│   ├── TriviaOverlay.tsx       # Trivia questions
│   ├── AchievementToast.tsx    # Achievement notifications
│   ├── PlayerStatsModal.tsx    # Stats/high scores/achievements
│   ├── LaserEffect.tsx         # Laser visual effects
│   ├── TypingHandler.tsx       # Keyboard input handler
│   └── ErrorBoundary.tsx       # Error handling
│
├── entities/                   # 3D game entities
│   ├── PlayerShip.tsx          # Player 3D model
│   └── EnemyShip.tsx           # Enemy 3D models with words
│
├── store/                      # State management
│   ├── gameStore.ts            # Zustand store (game state)
│   └── selectors.ts            # Store selectors
│
├── utils/                      # Utilities and helpers
│   ├── enemySpawner.ts         # Enemy spawning logic
│   ├── wordDictionary.ts       # Word management (12,388 words)
│   ├── triviaDatabase.ts       # Trivia questions
│   ├── achievementsManager.ts  # Achievement system
│   ├── audioManager.ts         # Sound effects
│   ├── logger.ts               # Error logging (stripped in prod)
│   ├── testIds.ts              # E2E test identifiers
│   └── ...
│
├── data/                       # Game data files
│   ├── *_words.yaml            # Word dictionaries by language
│   ├── trivia.yaml             # Trivia questions
│   └── achievementIcons.ts     # Achievement icon data
│
├── types.ts                    # TypeScript type definitions
├── App.tsx                     # Root React component
├── main.tsx                    # React entry point
└── index.css                   # Global styles
```

## Public Assets (`/public/`)

Static assets served directly.

```
public/
└── assets/
    ├── models/                 # 3D models (.glb format)
    │   └── ships/              # Player, enemy, boss ships
    ├── fonts/                  # Custom fonts
    ├── icons/                  # UI icons
    ├── images/                 # Textures and images
    └── sounds/                 # Audio files
```

## Documentation (`/docs/`)

```
docs/
├── CONTENT.md                  # Game content (words, trivia)
├── DEPLOYMENT.md               # Vercel deployment guide
└── 3D_MODELS_INTEGRATION.md    # 3D model details
```

## Scripts (`/scripts/`)

Build and utility scripts.

```
scripts/
├── README.md                   # Scripts documentation
├── dev-start.sh                # Development server
├── generate-assets.ts          # Asset generation with Rodin AI
├── generate-textures.ts        # Texture generation
└── get-achievement-icons.ts    # Achievement icon fetching
```

## API (`/api/`)

Serverless API endpoints (Vercel Functions).

```
api/
├── schema.sql                  # Database schema
└── rodin/                      # Rodin AI integration
    ├── generate-text.ts        # Text-to-3D generation
    ├── import-asset.ts         # Asset import
    └── job-status.ts           # Job status checking
```

## Key Technologies

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Three.js 0.181** - 3D graphics
- **React Three Fiber** - React Three.js renderer
- **React Three Drei** - Three.js helpers
- **Zustand** - State management
- **Vite 7** - Build tool
- **PWA** - Offline support

## Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

## Deployment

- **Platform**: Vercel
- **Config**: `vercel.json`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Functions**: `/api` directory

## Code Organization

### Component Patterns
- Functional components with hooks
- React.memo for expensive renders
- Custom hooks for reusable logic
- Test IDs on all interactive elements

### State Management
- Zustand store with persistence
- Selectors for derived state
- Actions for state updates
- LocalStorage persistence

### Type Safety
- Strict TypeScript mode
- Type definitions in `types.ts`
- No `any` types
- Proper error handling

### Performance
- React 19 compiler optimizations
- Three.js model caching
- Lazy component loading
- Production build optimization
