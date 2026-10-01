import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameMode } from "../../src/types";

const mocks = vi.hoisted(() => ({
  logError: vi.fn(),
  store: {
    achievements: [
      {
        id: "first_word",
        name: "First Steps",
        description: "Type a word",
        iconName: "/assets/icons/baby-bottle.svg",
        unlocked: true,
        unlockedAt: "2026-01-01T00:00:00.000Z",
        progress: 1,
        maxProgress: 1,
      },
      {
        id: "speed_demon",
        name: "Speed Demon",
        description: "Type quickly",
        iconName: "/assets/icons/lightning-bolt.svg",
        unlocked: false,
        progress: 0,
        maxProgress: 100,
      },
      {
        id: "custom",
        name: "Custom",
        description: "Custom achievement",
        iconName: "trophy",
        unlocked: true,
        progress: 1,
        maxProgress: 1,
      },
    ],
    highScores: [] as {
      playerName: string;
      score: number;
      level: number;
      wpm: number;
      accuracy: number;
      timestamp: string;
      mode: GameMode;
    }[],
    stats: {
      totalGamesPlayed: 2,
      totalScore: 1500,
      totalWordsTyped: 20,
      totalWordsCorrect: 18,
      totalWordsMissed: 2,
      totalTimePlayed: 3660,
      bestScore: 1000,
      bestLevel: 5,
      bestWPM: 80,
      bestAccuracy: 98,
    },
  },
}));

vi.mock("../../src/store/gameContext", () => ({
  useGameStore: () => mocks.store,
}));

vi.mock("../../src/utils/logger", () => ({ error: mocks.logError }));

import { PlayerStatsModal } from "../../src/components/PlayerStatsModal";

describe("player statistics modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.store.highScores = [];
  });

  it("renders accessible aggregate statistics and empty states", async () => {
    const close = vi.fn();
    const { container } = render(<PlayerStatsModal onClose={close} />);

    expect(
      screen.getByRole("dialog", { name: /player statistics/i }),
    ).toBeVisible();
    expect(screen.getByText("1h 1m")).toBeInTheDocument();
    expect(
      screen.getByText("No high scores yet. Start playing to set records!"),
    ).toBeInTheDocument();
    expect(screen.getByText("90.0%")).toBeInTheDocument();
    expect(screen.getByAltText("First Steps")).toBeInTheDocument();
    expect(screen.getByText("🔒")).toBeInTheDocument();
    expect(screen.getByText("🏆")).toBeInTheDocument();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(close).toHaveBeenCalledOnce();
  });

  it("sorts scores and exercises achievement hover states", () => {
    mocks.store.highScores = [
      {
        playerName: "Low",
        score: 10,
        level: 1,
        wpm: 20,
        accuracy: 90,
        timestamp: "low",
        mode: GameMode.NORMAL,
      },
      {
        playerName: "High",
        score: 100,
        level: 3,
        wpm: 40,
        accuracy: 95,
        timestamp: "high",
        mode: GameMode.NORMAL,
      },
    ];
    render(<PlayerStatsModal onClose={vi.fn()} />);

    const scores = screen.getAllByText(/^(100|10)$/);
    expect(scores[0]).toHaveTextContent("100");
    const unlocked = screen.getByTitle(/First Steps/);
    const locked = screen.getByTitle(/Speed Demon/);
    fireEvent.mouseEnter(unlocked);
    fireEvent.mouseLeave(unlocked);
    fireEvent.mouseEnter(locked);
    fireEvent.mouseLeave(locked);
    expect(unlocked).toHaveStyle({ transform: "scale(1)" });
    expect(locked).toHaveStyle({ transform: "scale(1)" });
  });

  it("reports close-handler errors from backdrop dismissal", () => {
    const failure = new Error("close failed");
    render(
      <PlayerStatsModal
        onClose={() => {
          throw failure;
        }}
      />,
    );
    fireEvent.click(screen.getByTestId("player-stats-modal"));
    expect(mocks.logError).toHaveBeenCalledWith(
      "Failed to close player stats modal",
      failure,
      "PlayerStatsModal",
    );
  });
});
