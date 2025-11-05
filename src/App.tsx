/**
 * Main App Component
 * Optimized with intelligent lazy loading and prefetching
 */
import { useEffect, useState, lazy, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { MainMenu } from './components/MainMenu';
import { TypingHandler } from './components/TypingHandler';
import { AchievementToast } from './components/AchievementToast';
import { CameraController } from './components/CameraController';

// Lazy load heavy components with prefetching
const GameCanvas = lazy(() => import('./components/GameCanvas').then(m => ({ default: m.GameCanvas })));
const TriviaOverlay = lazy(() => import('./components/TriviaOverlay').then(m => ({ default: m.TriviaOverlay })));
const GameOverScreen = lazy(() => import('./components/GameOverScreen').then(m => ({ default: m.GameOverScreen })));
const PauseMenu = lazy(() => import('./components/PauseMenu').then(m => ({ default: m.PauseMenu })));
const SpaceScene = lazy(() => import('./components/SpaceScene').then(m => ({ default: m.SpaceScene })));
const LaserEffect = lazy(() => import('./components/LaserEffect').then(m => ({ default: m.LaserEffect })));

import { useGameStore } from './store/gameContext';
import { GameMode, Achievement } from './types';
import { wordDictionary } from './utils/wordDictionary';
import { triviaDatabase } from './utils/triviaDatabase';
import { getAudioManager } from './utils/audioManager';
import { achievementsManager } from './utils/achievementsManager';
import { resourcePreloader } from './utils/resourcePreloader';
import { error as logError, debug } from './utils/logger';

function App() {
  const store = useGameStore();
  const { 
    mode, 
    currentTrivia, 
    answerTrivia, 
    hideTrivia, 
    isGameOver, 
    syncAchievements, 
    achievements,
    isPaused,
    resumeGame,
    resetGame,
  } = store;
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  // CRITICAL: Force reset to menu on app mount to prevent stale state
  useEffect(() => {
    debug('App mounted - forcing reset to menu', { currentMode: mode }, 'App');
    if (mode !== GameMode.MENU) {
      resetGame();
    }

    // Handle page unload/close - ensure clean state on next load
    const handleBeforeUnload = () => {
      debug('Page unloading - state will be reset on next load', undefined, 'App');
      // The merge function in gameStore will ensure we start at menu
      // No need to explicitly reset here as it happens on mount
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Run once on mount only

  useEffect(() => {
    // Initialize game assets and resources
    const initialize = async () => {
      try {
        // Preload critical 3D assets first
        setLoadingStatus('Loading 3D assets...');
        await resourcePreloader.preloadCriticalAssets();
        
        // Load only essential dictionaries initially (normal mode)
        setLoadingStatus('Loading word dictionaries...');
        await wordDictionary.loadDictionary('normal');
        
        // Load trivia database in background (non-blocking)
        setLoadingStatus('Loading trivia questions...');
        triviaDatabase.load().catch((err) => logError('Failed to load trivia database', err, 'App'));
        
        // Preload other dictionaries in background after initial load
        Promise.all([
          'python', 'javascript', 'java', 'csharp', 
          'cplusplus', 'css', 'html'
        ].map(lang => wordDictionary.loadDictionary(lang))).catch((err) => logError('Failed to load dictionaries', err, 'App'));
        
        // Queue additional assets for background loading
        resourcePreloader.queueAsset('/assets/models/ships/enemy-fast.glb');
        resourcePreloader.queueAsset('/assets/models/ships/enemy-boss.glb');
        
        // Initialize achievements manager with saved data
        setLoadingStatus('Loading achievements...');
        const savedAchievements = achievements;
        const savedStats = undefined; // TODO: Load stats from localStorage
        achievementsManager.load(savedAchievements, savedStats);
        
        // Subscribe to achievement unlocks
        achievementsManager.onUnlock((achievement) => {
          setAchievementQueue(prev => [...prev, achievement]);
          debug(`Achievement unlocked: ${achievement.name}`, { id: achievement.id }, 'App');
        });
        
        // Sync achievements back to store
        syncAchievements();
        
        // TODO: Initialize Rodin manager
        setLoadingStatus('Preparing 3D assets...');
        
        // TODO: Pre-generate common ship models
        
        // Initialize audio manager
        setLoadingStatus('Initializing audio...');
        const audioManager = getAudioManager();
        // Start background music after a short delay
        setTimeout(() => {
          audioManager.playMusic();
        }, 1000);
        
        setLoadingStatus('Ready!');
        setIsLoading(false);
      } catch (err) {
        logError('Failed to initialize game', err as Error, 'App');
        setLoadingStatus('Error loading game assets');
        // Still allow game to start
        setIsLoading(false);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  if (isLoading) {
    return (
      <div className="flex-center" style={{ width: '100%', height: '100%', backgroundColor: '#0a0e27' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ marginTop: '20px', color: '#09ff00', fontSize: '1.2rem' }}>{loadingStatus}</p>
        </div>
      </div>
    );
  }

  const showGame = mode !== GameMode.MENU && 
                   mode !== GameMode.PROFILE_SELECT && 
                   mode !== GameMode.ABOUT &&
                   mode !== GameMode.SETTINGS;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000000' }}>
      {/* Single Canvas for entire app - no more context switching */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Canvas 
          camera={{ position: [0, 12, -35], fov: 75 }}
          gl={{ 
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#000000', 1);
            debug('Single WebGL context initialized', undefined, 'App');
          }}
        >
          <Suspense fallback={null}>
            {/* Dynamic camera controller */}
            <CameraController isGame={showGame} />
            
            {/* Base lighting - always present */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 10, 5]} intensity={0.5} />
            
            {/* Always show space background */}
            <SpaceScene />
            
            {/* Game content only when playing */}
            {showGame && <GameCanvas />}
          </Suspense>
        </Canvas>
      </div>
      
      {/* Laser Effect */}
      {showGame && (
        <Suspense fallback={null}>
          <LaserEffect />
        </Suspense>
      )}
      
      {/* Typing Handler - always active to capture input */}
      <TypingHandler />

      {/* Main Menu */}
      {!showGame && <MainMenu />}

      {/* Trivia Overlay */}
      {currentTrivia && (
        <Suspense fallback={null}>
          <TriviaOverlay
            question={currentTrivia}
            onAnswer={(selectedAnswer, correct, bonusItem) => {
              answerTrivia(selectedAnswer, correct, bonusItem);
              // Hide trivia after a delay
              setTimeout(() => {
                hideTrivia();
              }, 500);
            }}
            onTimeout={() => {
              answerTrivia(0, false, null);
              setTimeout(() => {
                hideTrivia();
              }, 500);
            }}
          />
        </Suspense>
      )}

      {/* Pause Menu */}
      {isPaused && !isGameOver && (
        <Suspense fallback={null}>
          <PauseMenu
            onResume={resumeGame}
            onSettings={() => {
              // Settings handled via MainMenu for now
              debug('Settings not available during gameplay', undefined, 'App');
            }}
            onMainMenu={() => {
              if (window.confirm('Are you sure you want to quit to main menu? Your progress will be lost.')) {
                resetGame();
                // Clean up non-critical assets when returning to menu
                resourcePreloader.clearNonCriticalAssets();
              }
            }}
          />
        </Suspense>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <Suspense fallback={null}>
          <GameOverScreen />
        </Suspense>
      )}

      {/* Achievement Toasts */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {achievementQueue.map((achievement, index) => (
          <AchievementToast
            key={`${achievement.id}-${index}`}
            achievement={achievement}
            onDismiss={() => {
              setAchievementQueue(prev => prev.filter((_, i) => i !== index));
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
