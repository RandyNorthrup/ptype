/**
 * Main App Component
 * Optimized with intelligent lazy loading and prefetching
 */
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import { Canvas } from "@react-three/fiber";
import { MainMenu } from "./components/MainMenu";
import { TypingHandler } from "./components/TypingHandler";
import { AchievementToast } from "./components/AchievementToast";
import { CameraController } from "./components/CameraController";

// Lazy load heavy components with prefetching
const GameCanvas = lazy(async () => {
  const module = await import("./components/GameCanvas");
  return { default: module.GameCanvas };
});
const TriviaOverlay = lazy(async () => {
  const module = await import("./components/TriviaOverlay");
  return { default: module.TriviaOverlay };
});
const GameOverScreen = lazy(async () => {
  const module = await import("./components/GameOverScreen");
  return { default: module.GameOverScreen };
});
const PauseMenu = lazy(async () => {
  const module = await import("./components/PauseMenu");
  return { default: module.PauseMenu };
});
const SpaceScene = lazy(async () => {
  const module = await import("./components/SpaceScene");
  return { default: module.SpaceScene };
});
const LaserEffect = lazy(async () => {
  const module = await import("./components/LaserEffect");
  return { default: module.LaserEffect };
});

import { useGameStore } from "./store/gameContext";
import { GameMode, type Achievement, type BonusItem } from "./types";
import { wordDictionary } from "./utils/wordDictionary";
import { triviaDatabase } from "./utils/triviaDatabase";
import { getAudioManager } from "./utils/audioManager";
import {
  achievementsManager,
  loadPersistedAchievementStats,
} from "./utils/achievementsManager";
import { resourcePreloader } from "./utils/resourcePreloader";
import { error as logError, debug } from "./utils/logger";

const TUNING = {
  musicStartDelayMs: 1000,
  triviaDismissDelayMs: 500,
  initialCameraHeight: 12,
  initialCameraDepth: -35,
  keyLightOffset: 10,
  keyLightDepth: 5,
} as const;

const ACTIVE_GAME_MODES = new Set<GameMode>([
  GameMode.NORMAL,
  GameMode.PROGRAMMING,
  GameMode.TRIVIA,
  GameMode.GAME_OVER,
]);

function isSignalAborted(signal: AbortSignal): boolean {
  return signal.aborted;
}

async function loadBackgroundGameData(): Promise<void> {
  try {
    await triviaDatabase.load();
  } catch (error: unknown) {
    logError("Failed to load trivia database", error, "App");
  }

  try {
    await Promise.all(
      [
        "python",
        "javascript",
        "java",
        "csharp",
        "cplusplus",
        "css",
        "html",
      ].map((language) => wordDictionary.loadDictionary(language)),
    );
  } catch (error: unknown) {
    logError("Failed to load dictionaries", error, "App");
  }
}

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
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [achievementQueue, setAchievementQueue] = useState<
    (Achievement & { _toastId: number })[]
  >([]);
  const initialAchievementsReference = useRef(achievements);

  useEffect(() => {
    const abortController = new AbortController();
    let musicTimer: ReturnType<typeof setTimeout> | undefined;

    // Subscribe to achievement unlocks synchronously (before any await)
    // so cleanup can always unsubscribe
    const unsubscribe = achievementsManager.onUnlock((achievement) => {
      if (abortController.signal.aborted) return;
      setAchievementQueue((previous) => [
        ...previous,
        { ...achievement, _toastId: Date.now() + Math.random() },
      ]);
      // Sync unlocked state to React store so it gets persisted to localStorage
      syncAchievements();
      debug(
        `Achievement unlocked: ${achievement.name}`,
        { id: achievement.id },
        "App",
      );
    });

    // Initialize game assets and resources
    const initialize = async () => {
      try {
        // Preload critical 3D assets first
        setLoadingStatus("Loading 3D assets...");
        await resourcePreloader.preloadCriticalAssets();
        if (isSignalAborted(abortController.signal)) return;

        // Load only essential dictionaries initially (normal mode)
        setLoadingStatus("Loading word dictionaries...");
        await wordDictionary.loadDictionary("normal");
        if (isSignalAborted(abortController.signal)) return;

        // Load trivia database in background (non-blocking)
        setLoadingStatus("Loading trivia questions...");
        void loadBackgroundGameData();

        // Queue additional assets for background loading
        resourcePreloader.queueAsset("/assets/models/ships/enemy-fast.glb");
        resourcePreloader.queueAsset("/assets/models/ships/enemy-boss.glb");

        // Initialize achievements manager with saved data
        setLoadingStatus("Loading achievements...");
        achievementsManager.load(
          initialAchievementsReference.current,
          loadPersistedAchievementStats(),
        );

        // Sync achievements back to store
        syncAchievements();

        // Initialize audio manager
        setLoadingStatus("Preparing assets...");
        const audioManager = getAudioManager();
        // Start background music after a short delay
        musicTimer = setTimeout(() => {
          if (!abortController.signal.aborted) audioManager.playMusic();
        }, TUNING.musicStartDelayMs);

        setLoadingStatus("Ready!");
        if (!isSignalAborted(abortController.signal)) setIsLoading(false);
      } catch (error) {
        logError("Failed to initialize game", error, "App");
        setLoadingStatus("Error loading game assets");
        // Still allow game to start
        if (!abortController.signal.aborted) setIsLoading(false);
      }
    };

    void initialize();
    return () => {
      abortController.abort();
      if (musicTimer) clearTimeout(musicTimer);
      unsubscribe();
    };
  }, [syncAchievements]);

  // All hooks MUST be above the early return to satisfy Rules of Hooks
  const isShowGame = ACTIVE_GAME_MODES.has(mode);

  // Stable callbacks for memoized children
  const handleTriviaAnswer = useCallback(
    (
      selectedAnswer: number,
      isCorrect: boolean,
      bonusItem: BonusItem | null,
    ) => {
      answerTrivia(selectedAnswer, isCorrect, bonusItem);
      setTimeout(() => {
        hideTrivia();
      }, TUNING.triviaDismissDelayMs);
    },
    [answerTrivia, hideTrivia],
  );

  const handleTriviaTimeout = useCallback(() => {
    answerTrivia(0, false, null);
    setTimeout(() => {
      hideTrivia();
    }, TUNING.triviaDismissDelayMs);
  }, [answerTrivia, hideTrivia]);

  const handlePauseMainMenu = useCallback(() => {
    resetGame();
    resourcePreloader.clearNonCriticalAssets();
  }, [resetGame]);

  // Stable callback for dismissing achievement toasts
  const handleDismissAchievement = useCallback((toastId: number) => {
    setAchievementQueue((previous) =>
      previous.filter((a) => a._toastId !== toastId),
    );
  }, []);

  if (isLoading) {
    return (
      <div
        className="flex-center"
        role="status"
        aria-live="polite"
        aria-label={loadingStatus}
        style={{ width: "100%", height: "100%", backgroundColor: "#0a0e27" }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="spinner" aria-hidden="true" />
          <p
            style={{ marginTop: "20px", color: "#09ff00", fontSize: "1.2rem" }}
          >
            {loadingStatus}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#000000",
      }}
    >
      {/* Single Canvas for entire app - no more context switching */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <Canvas
          camera={{
            position: [
              0,
              TUNING.initialCameraHeight,
              TUNING.initialCameraDepth,
            ],
            fov: 75,
          }}
          gl={{
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.setClearColor("#000000", 1);
            debug("Single WebGL context initialized", undefined, "App");
          }}
        >
          <Suspense fallback={null}>
            {/* Dynamic camera controller */}
            <CameraController isGame={isShowGame} />

            {/* Base lighting - always present */}
            <ambientLight intensity={0.3} />
            <directionalLight
              position={[
                TUNING.keyLightOffset,
                TUNING.keyLightOffset,
                TUNING.keyLightDepth,
              ]}
              intensity={0.5}
            />

            {/* Always show space background */}
            <SpaceScene />

            {/* Game content only when playing */}
            {isShowGame && <GameCanvas />}
          </Suspense>
        </Canvas>
      </div>

      {/* Laser Effect */}
      {isShowGame && (
        <Suspense fallback={null}>
          <LaserEffect />
        </Suspense>
      )}

      {/* Typing Handler - always active to capture input */}
      <TypingHandler />

      {/* Main Menu */}
      {!isShowGame && <MainMenu />}

      {/* Trivia Overlay */}
      {currentTrivia && (
        <Suspense fallback={null}>
          <TriviaOverlay
            question={currentTrivia}
            onAnswer={handleTriviaAnswer}
            onTimeout={handleTriviaTimeout}
          />
        </Suspense>
      )}

      {/* Pause Menu */}
      {isPaused && !isGameOver && mode !== GameMode.TRIVIA && (
        <Suspense fallback={null}>
          <PauseMenu onResume={resumeGame} onMainMenu={handlePauseMainMenu} />
        </Suspense>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <Suspense fallback={null}>
          <GameOverScreen />
        </Suspense>
      )}

      {/* Achievement Toasts */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {achievementQueue.map((achievement) => (
          <AchievementToast
            key={achievement._toastId}
            achievement={achievement}
            onDismiss={() => {
              handleDismissAchievement(achievement._toastId);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
