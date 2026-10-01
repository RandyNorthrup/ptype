import { beforeEach, describe, expect, it, vi } from "vitest";
import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { GameMode, ProgrammingLanguage } from "../../src/types";

const mocks = vi.hoisted(() => {
  const optionalState: {
    programmingLanguage: string | undefined;
    previousMode: string | undefined;
    previousLanguage: string | undefined;
  } = {
    programmingLanguage: undefined,
    previousMode: "programming",
    previousLanguage: "Python",
  };
  return {
    resetGame: vi.fn(),
    startGame: vi.fn(),
    store: {
      score: 500,
      level: 4,
      wpm: 82,
      accuracy: 96.5,
      highScores: [
        {
          score: 500,
          level: 4,
          mode: "programming",
          language: "Python",
        },
      ],
      mode: "game_over",
      ...optionalState,
    },
  };
});

vi.mock("../../src/store/gameContext", () => ({
  useGameStore: () => ({
    ...mocks.store,
    resetGame: mocks.resetGame,
    startGame: mocks.startGame,
  }),
}));

import { GameOverScreen } from "../../src/components/GameOverScreen";

describe("game over screen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.store.previousMode = GameMode.PROGRAMMING;
    mocks.store.previousLanguage = ProgrammingLanguage.PYTHON;
  });

  it("renders accessible results, ranking, and responsive actions", async () => {
    const { container } = render(<GameOverScreen />);
    expect(screen.getByRole("dialog", { name: "GAME OVER" })).toBeVisible();
    expect(screen.getByText(/NEW HIGH SCORE! #1/)).toBeInTheDocument();
    expect(screen.getByTestId("final-score")).toHaveTextContent("500");
    expect(screen.getByTestId("final-accuracy")).toHaveTextContent("96.5%");
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);

    fireEvent.click(screen.getByRole("button", { name: /play again/i }));
    expect(mocks.resetGame).toHaveBeenCalledOnce();
    expect(mocks.startGame).toHaveBeenCalledWith(
      GameMode.PROGRAMMING,
      ProgrammingLanguage.PYTHON,
    );
    fireEvent.click(screen.getByRole("button", { name: /main menu/i }));
    expect(mocks.resetGame).toHaveBeenCalledTimes(2);
  });

  it("omits ranking and restart when prior mode is unavailable", () => {
    mocks.store.previousMode = undefined;
    mocks.store.previousLanguage = undefined;
    const { rerender } = render(<GameOverScreen />);
    expect(screen.queryByText(/NEW HIGH SCORE/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /play again/i }));
    expect(mocks.startGame).not.toHaveBeenCalled();

    mocks.store.previousMode = GameMode.NORMAL;
    rerender(<GameOverScreen />);
    expect(screen.queryByText(/NEW HIGH SCORE/)).toBeNull();
  });
});
