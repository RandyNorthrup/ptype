/**
 * Main App Component
 * Optimized with intelligent lazy loading and prefetching
 */
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { MainMenu } from "./components/MainMenu";
import { TypingHandler } from "./components/TypingHandler";
import { AchievementToast } from "./components/AchievementToast";
import { CameraController } from "./components/CameraController";

// Lazy load heavy components with prefetching
const GameCanvas = lazy(() =>
  import("./components/GameCanvas").then((m) => ({ default: m.GameCanvas })),
);
const TriviaOverlay = lazy(() =>
  import("./components/TriviaOverlay").then((m) => ({
    default: m.TriviaOverlay,
  })),
);
const GameOverScreen = lazy(() =>
  import("./components/GameOverScreen").then((m) => ({
    default: m.GameOverScreen,
  })),
);
const PauseMenu = lazy(() =>
  import("./components/PauseMenu").then((m) => ({ default: m.PauseMenu })),
);
const SpaceScene = lazy(() =>
  import("./components/SpaceScene").then((m) => ({ default: m.SpaceScene })),
);
const LaserEffect = lazy(() =>
  import("./components/LaserEffect").then((m) => ({ default: m.LaserEffect })),
);

import { useGameStore } from "./store/gameContext";
import { GameMode, type Achievement } from "./types";
import { wordDictionary } from "./utils/wordDictionary";
import { triviaDatabase } from "./utils/triviaDatabase";
import { getAudioManager } from "./utils/audioManager";
import { achievementsManager } from "./utils/achievementsManager";
import { resourcePreloader } from "./utils/resourcePreloader";
import { error as logError, debug } from "./utils/logger";

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

  // CRITICAL: Force reset to menu on app mount to prevent stale state
  useEffect(() => {
    debug("App mounted - forcing reset to menu", { currentMode: mode }, "App");
    if (mode !== GameMode.MENU) {
      resetGame();
    }
  }, []); // Run once on mount only

  useEffect(() => {
    let isCancelled = false;
    let unsubscribeReference: (() => void) | undefined;

    // Subscribe to achievement unlocks synchronously (before any await)
    // so cleanup can always unsubscribe
    unsubscribeReference = achievementsManager.onUnlock((achievement) => {
      if (isCancelled) return;
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
        if (isCancelled) return;

        // Load only essential dictionaries initially (normal mode)
        setLoadingStatus("Loading word dictionaries...");
        await wordDictionary.loadDictionary("normal");
        if (isCancelled) return;

        // Load trivia database in background (non-blocking)
        setLoadingStatus("Loading trivia questions...");
        triviaDatabase.load().catch((error) => {
          logError("Failed to load trivia database", error, "App");
        });

        // Preload other dictionaries in background after initial load
        Promise.all(
          [
            "python",
            "javascript",
            "java",
            "csharp",
            "cplusplus",
            "css",
            "html",
          ].map((lang) => wordDictionary.loadDictionary(lang)),
        ).catch((error) => {
          logError("Failed to load dictionaries", error, "App");
        });

        // Queue additional assets for background loading
        resourcePreloader.queueAsset("/assets/models/ships/enemy-fast.glb");
        resourcePreloader.queueAsset("/assets/models/ships/enemy-boss.glb");

        // Initialize achievements manager with saved data
        setLoadingStatus("Loading achievements...");
        const savedAchievements = achievements;
        // Load achievement stats from localStorage
        let savedStats:
          | Partial<import("./utils/achievementsManager").AchievementStats>
          | undefined;
        try {
          const raw = localStorage.getItem("ptype-achievement-stats");
          if (raw) {
            const parsed = JSON.parse(raw);
            savedStats = {
              ...parsed,
              languagesPlayed: new Set(parsed.languagesPlayed || []),
            };
          }
        } catch {
          // Ignore parse errors
        }
        achievementsManager.load(savedAchievements, savedStats);

        // Sync achievements back to store
        syncAchievements();

        // Initialize audio manager
        setLoadingStatus("Preparing assets...");
        const audioManager = getAudioManager();
        // Start background music after a short delay
        setTimeout(() => {
          if (!isCancelled) audioManager.playMusic();
        }, 1000);

        setLoadingStatus("Ready!");
        if (!isCancelled) setIsLoading(false);
      } catch (error) {
        logError("Failed to initialize game", error, "App");
        setLoadingStatus("Error loading game assets");
        // Still allow game to start
        if (!isCancelled) setIsLoading(false);
      }
    };

    initialize();
    return () => {
      isCancelled = true;
      if (unsubscribeReference) unsubscribeReference();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // All hooks MUST be above the early return to satisfy Rules of Hooks
  const isShowGame =
    mode === GameMode.NORMAL ||
    mode === GameMode.PROGRAMMING ||
    mode === GameMode.TRIVIA ||
    mode === GameMode.GAME_OVER;

  // Stable callbacks for memoized children
  const handleTriviaAnswer = useCallback(
    (
      selectedAnswer: number,
      correct: boolean,
      bonusItem: import("./types").BonusItem | null,
    ) => {
      answerTrivia(selectedAnswer, correct, bonusItem);
      setTimeout(() => {
        hideTrivia();
      }, 500);
    },
    [answerTrivia, hideTrivia],
  );

  const handleTriviaTimeout = useCallback(() => {
    answerTrivia(0, false, null);
    setTimeout(() => {
      hideTrivia();
    }, 500);
  }, [answerTrivia, hideTrivia]);

  const handlePauseMainMenu = useCallback(() => {
    if (
      !window.confirm(
        "Are you sure you want to quit to main menu? Your progress will be lost.",
      )
    ) {
      return;
    }

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
        style={{ width: "100%", height: "100%", backgroundColor: "#0a0e27" }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="spinner" />
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
          camera={{ position: [0, 12, -35], fov: 75 }}
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
            <directionalLight position={[10, 10, 5]} intensity={0.5} />

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
