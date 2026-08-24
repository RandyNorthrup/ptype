/// <reference lib="es2024.promise" />

import axe from "axe-core";
import type { ReactNode } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GameMode,
  type Achievement,
  type TriviaQuestion,
} from "../../src/types";

const mocks = vi.hoisted(() => ({
  achievementCallback: undefined as
    ((achievement: Achievement) => void) | undefined,
  answerTrivia: vi.fn(),
  clearAssets: vi.fn(),
  debug: vi.fn(),
  hideTrivia: vi.fn(),
  loadAchievements: vi.fn(),
  loadDictionary: vi.fn((language?: string) => {
    void language;
    return Promise.resolve();
  }),
  loadPersistedStats: vi.fn(() => ({ enemiesDestroyed: 4 })),
  loadTrivia: vi.fn(() => Promise.resolve()),
  logError: vi.fn(),
  playMusic: vi.fn(),
  preloadAssets: vi.fn(() => Promise.resolve()),
  queueAsset: vi.fn(),
  resetGame: vi.fn(),
  resumeGame: vi.fn(),
  setClearColor: vi.fn(),
  syncAchievements: vi.fn(),
  unsubscribe: vi.fn(),
  store: {
    mode: "menu",
    currentTrivia: null as TriviaQuestion | null,
    isGameOver: false,
    isPaused: false,
    achievements: [] as Achievement[],
  },
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: ({
    children,
    onCreated,
  }: {
    children: ReactNode;
    onCreated?: (state: {
      gl: { setClearColor: typeof mocks.setClearColor };
    }) => void;
  }) => {
    onCreated?.({ gl: { setClearColor: mocks.setClearColor } });
    return <div data-testid="webgl-canvas">{children}</div>;
  },
}));

vi.mock("../../src/store/gameContext", () => ({
  useGameStore: () => ({
    ...mocks.store,
    answerTrivia: mocks.answerTrivia,
    hideTrivia: mocks.hideTrivia,
    resetGame: mocks.resetGame,
    resumeGame: mocks.resumeGame,
    syncAchievements: mocks.syncAchievements,
  }),
}));

vi.mock("../../src/utils/wordDictionary", () => ({
  wordDictionary: { loadDictionary: mocks.loadDictionary },
}));
vi.mock("../../src/utils/triviaDatabase", () => ({
  triviaDatabase: { load: mocks.loadTrivia },
}));
vi.mock("../../src/utils/audioManager", () => ({
  getAudioManager: () => ({ playMusic: mocks.playMusic }),
}));
vi.mock("../../src/utils/achievementsManager", () => ({
  achievementsManager: {
    load: mocks.loadAchievements,
    onUnlock: (callback: (achievement: Achievement) => void) => {
      mocks.achievementCallback = callback;
      return mocks.unsubscribe;
    },
  },
  loadPersistedAchievementStats: mocks.loadPersistedStats,
}));
vi.mock("../../src/utils/resourcePreloader", () => ({
  resourcePreloader: {
    clearNonCriticalAssets: mocks.clearAssets,
    preloadCriticalAssets: mocks.preloadAssets,
    queueAsset: mocks.queueAsset,
  },
}));
vi.mock("../../src/utils/logger", () => ({
  debug: mocks.debug,
  error: mocks.logError,
}));

vi.mock("../../src/components/MainMenu", () => ({
  MainMenu: () => <div>Main menu</div>,
}));
vi.mock("../../src/components/TypingHandler", () => ({
  TypingHandler: () => <div>Typing handler</div>,
}));
vi.mock("../../src/components/CameraController", () => ({
  CameraController: ({ isGame }: { isGame: boolean }) => (
    <div>Camera {isGame ? "game" : "menu"}</div>
  ),
}));
vi.mock("../../src/components/SpaceScene", () => ({
  SpaceScene: () => <div>Space scene</div>,
}));
vi.mock("../../src/components/GameCanvas", () => ({
  GameCanvas: () => <div>Game canvas</div>,
}));
vi.mock("../../src/components/LaserEffect", () => ({
  LaserEffect: () => <div>Laser effect</div>,
}));
vi.mock("../../src/components/TriviaOverlay", () => ({
  TriviaOverlay: ({
    onAnswer,
    onTimeout,
  }: {
    onAnswer: (answer: number, isCorrect: boolean, bonus: null) => void;
    onTimeout: () => void;
  }) => (
    <div>
      Trivia overlay
      <button
        type="button"
        onClick={() => {
          onAnswer(1, true, null);
        }}
      >
        Answer trivia
      </button>
      <button type="button" onClick={onTimeout}>
        Time out trivia
      </button>
    </div>
  ),
}));
vi.mock("../../src/components/PauseMenu", () => ({
  PauseMenu: ({
    onResume,
    onMainMenu,
  }: {
    onResume: () => void;
    onMainMenu: () => void;
  }) => (
    <div>
      Pause menu
      <button type="button" onClick={onResume}>
        Resume mock
      </button>
      <button type="button" onClick={onMainMenu}>
        Main menu mock
      </button>
    </div>
  ),
}));
vi.mock("../../src/components/GameOverScreen", () => ({
  GameOverScreen: () => <div>Game over screen</div>,
}));
vi.mock("../../src/components/AchievementToast", () => ({
  AchievementToast: ({
    achievement,
    onDismiss,
  }: {
    achievement: Achievement;
    onDismiss: () => void;
  }) => (
    <button type="button" onClick={onDismiss}>
      Toast {achievement.name}
    </button>
  ),
}));

import App from "../../src/App";

const TRIVIA: TriviaQuestion = {
  question: "Which answer?",
  options: ["A", "B"],
  correctAnswer: 1,
  difficulty: "easy",
  category: "testing",
};

const ACHIEVEMENT: Achievement = {
  id: "test-achievement",
  name: "Test Pilot",
  description: "Test the application",
  iconName: "test.svg",
  unlocked: true,
  progress: 1,
  maxProgress: 1,
};

async function renderReadyApp(): Promise<ReturnType<typeof render>> {
  const rendered = render(<App />);
  await screen.findByText("Main menu");
  return rendered;
}

describe("application orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mocks.achievementCallback = undefined;
    mocks.store.mode = GameMode.MENU;
    mocks.store.currentTrivia = null;
    mocks.store.isGameOver = false;
    mocks.store.isPaused = false;
    mocks.store.achievements = [];
    mocks.preloadAssets.mockResolvedValue(undefined);
    mocks.loadDictionary.mockResolvedValue(undefined);
    mocks.loadTrivia.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("loads resources and renders an accessible menu shell", async () => {
    const { container } = render(<App />);
    expect(screen.getByRole("status")).toHaveAccessibleName(
      "Loading 3D assets...",
    );
    await screen.findByText("Main menu");

    expect(mocks.loadDictionary).toHaveBeenCalledWith("normal");
    expect(mocks.queueAsset).toHaveBeenCalledTimes(2);
    expect(mocks.loadAchievements).toHaveBeenCalledWith([], {
      enemiesDestroyed: 4,
    });
    expect(mocks.syncAchievements).toHaveBeenCalledOnce();
    expect(mocks.setClearColor).toHaveBeenCalledWith("#000000", 1);
    expect(screen.getByTestId("webgl-canvas")).toBeVisible();
    expect(await screen.findByText("Camera menu")).toBeInTheDocument();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("coordinates game, trivia, pause, and game-over states", async () => {
    const rendered = await renderReadyApp();

    mocks.store.mode = GameMode.NORMAL;
    rendered.rerender(<App />);
    expect(await screen.findByText("Game canvas")).toBeVisible();
    expect(screen.getByText("Laser effect")).toBeVisible();
    expect(screen.getByText("Camera game")).toBeInTheDocument();
    expect(screen.queryByText("Main menu")).not.toBeInTheDocument();

    mocks.store.isPaused = true;
    rendered.rerender(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "Resume mock" }));
    expect(mocks.resumeGame).toHaveBeenCalledOnce();

    const confirm = vi.spyOn(window, "confirm");
    confirm.mockReturnValueOnce(false).mockReturnValueOnce(true);
    const mainMenu = screen.getByRole("button", { name: "Main menu mock" });
    fireEvent.click(mainMenu);
    expect(mocks.resetGame).not.toHaveBeenCalled();
    fireEvent.click(mainMenu);
    expect(mocks.resetGame).toHaveBeenCalledOnce();
    expect(mocks.clearAssets).toHaveBeenCalledOnce();

    mocks.store.mode = GameMode.TRIVIA;
    mocks.store.currentTrivia = TRIVIA;
    mocks.store.isPaused = false;
    rendered.rerender(<App />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Answer trivia" }),
    );
    expect(mocks.answerTrivia).toHaveBeenCalledWith(1, true, null);
    await waitFor(() => {
      expect(mocks.hideTrivia).toHaveBeenCalledOnce();
    });
    fireEvent.click(screen.getByRole("button", { name: "Time out trivia" }));
    expect(mocks.answerTrivia).toHaveBeenLastCalledWith(0, false, null);
    await waitFor(() => {
      expect(mocks.hideTrivia).toHaveBeenCalledTimes(2);
    });

    mocks.store.mode = GameMode.GAME_OVER;
    mocks.store.currentTrivia = null;
    mocks.store.isPaused = true;
    mocks.store.isGameOver = true;
    rendered.rerender(<App />);
    expect(await screen.findByText("Game over screen")).toBeVisible();
    expect(screen.queryByText("Pause menu")).not.toBeInTheDocument();
  });

  it("queues, synchronizes, and dismisses achievement notifications", async () => {
    const rendered = await renderReadyApp();
    expect(mocks.achievementCallback).toBeTypeOf("function");
    const baselineSyncs = mocks.syncAchievements.mock.calls.length;

    act(() => mocks.achievementCallback?.(ACHIEVEMENT));
    const toast = await screen.findByRole("button", {
      name: "Toast Test Pilot",
    });
    expect(mocks.syncAchievements).toHaveBeenCalledTimes(baselineSyncs + 1);
    expect(mocks.debug).toHaveBeenCalledWith(
      "Achievement unlocked: Test Pilot",
      { id: "test-achievement" },
      "App",
    );
    fireEvent.click(toast);
    expect(
      screen.queryByRole("button", { name: "Toast Test Pilot" }),
    ).toBeNull();

    rendered.unmount();
    act(() => mocks.achievementCallback?.(ACHIEVEMENT));
    expect(mocks.syncAchievements).toHaveBeenCalledTimes(baselineSyncs + 1);
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });

  it("recovers from critical and background loading failures", async () => {
    mocks.preloadAssets.mockRejectedValueOnce(new Error("critical failure"));
    const critical = render(<App />);
    await screen.findByText("Main menu");
    expect(mocks.logError).toHaveBeenCalledWith(
      "Failed to initialize game",
      expect.any(Error),
      "App",
    );
    critical.unmount();

    vi.clearAllMocks();
    mocks.preloadAssets.mockResolvedValue(undefined);
    mocks.loadTrivia.mockRejectedValueOnce(new Error("trivia failure"));
    mocks.loadDictionary.mockImplementation((language?: string) =>
      language === "normal"
        ? Promise.resolve()
        : Promise.reject(new Error("dictionary failure")),
    );
    render(<App />);
    await screen.findByText("Main menu");
    await waitFor(() => {
      expect(mocks.logError).toHaveBeenCalledTimes(2);
    });
    expect(mocks.logError).toHaveBeenCalledWith(
      "Failed to load trivia database",
      expect.any(Error),
      "App",
    );
    expect(mocks.logError).toHaveBeenCalledWith(
      "Failed to load dictionaries",
      expect.any(Error),
      "App",
    );
  });

  it("stops initialization work after unmounting", async () => {
    const assets = Promise.withResolvers<undefined>();
    mocks.preloadAssets.mockReturnValueOnce(assets.promise);
    const first = render(<App />);
    first.unmount();
    await act(async () => {
      assets.resolve(undefined);
      await assets.promise;
    });
    expect(mocks.loadDictionary).not.toHaveBeenCalled();

    vi.clearAllMocks();
    const dictionary = Promise.withResolvers<undefined>();
    mocks.preloadAssets.mockResolvedValue(undefined);
    mocks.loadDictionary.mockReturnValueOnce(dictionary.promise);
    const second = render(<App />);
    await waitFor(() => {
      expect(mocks.loadDictionary).toHaveBeenCalledWith("normal");
    });
    second.unmount();
    await act(async () => {
      dictionary.resolve(undefined);
      await dictionary.promise;
    });
    expect(mocks.queueAsset).not.toHaveBeenCalled();
  });
});
