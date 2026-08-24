import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameStoreProvider, useGameStore } from "../../src/store/gameContext";
import { BonusItemType, GameMode, ProgrammingLanguage } from "../../src/types";

vi.mock("../../src/utils/logger", () => ({
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <GameStoreProvider>{children}</GameStoreProvider>
);

describe("game store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts and resets a programming game", () => {
    const { result } = renderHook(() => useGameStore(), { wrapper });

    act(() => {
      result.current.startGame(
        GameMode.PROGRAMMING,
        ProgrammingLanguage.PYTHON,
      );
    });
    expect(result.current.mode).toBe(GameMode.PROGRAMMING);
    expect(result.current.programmingLanguage).toBe(ProgrammingLanguage.PYTHON);
    expect(result.current.startTime).toBeGreaterThan(0);

    act(() => {
      result.current.resetGame();
    });
    expect(result.current.mode).toBe(GameMode.MENU);
    expect(result.current.programmingLanguage).toBeUndefined();
  });

  it("updates combat score, health, and shield without exceeding bounds", () => {
    const { result } = renderHook(() => useGameStore(), { wrapper });

    act(() => {
      result.current.incrementScore(250);
      result.current.takeDamage(20);
      result.current.addShield(500);
      result.current.heal(500);
    });

    expect(result.current.score).toBe(250);
    expect(result.current.health).toBe(result.current.maxHealth);
    expect(result.current.shield).toBe(result.current.maxShield);
  });

  it("adds, selects, and consumes a bonus item", () => {
    const { result } = renderHook(() => useGameStore(), { wrapper });
    const bonus = {
      itemId: 1,
      name: "Shield Boost",
      description: "Restore shields",
      iconName: "shield",
      duration: 1,
      uses: 1,
      effectValue: 50,
      type: BonusItemType.DEFENSIVE,
    };

    act(() => {
      result.current.addBonusItem(bonus);
    });
    expect(result.current.bonusItems).toHaveLength(1);

    let consumed = null;
    act(() => {
      consumed = result.current.consumeSelectedBonus();
    });
    expect(consumed).toEqual(bonus);
    expect(result.current.bonusItems).toHaveLength(0);
  });

  it("records a completed run in scores and aggregate stats", () => {
    const { result } = renderHook(() => useGameStore(), { wrapper });

    act(() => {
      result.current.startGame(GameMode.NORMAL);
    });
    act(() => {
      result.current.incrementScore(500);
      result.current.updateStats(80, 96);
    });
    act(() => {
      result.current.endGame();
    });

    expect(result.current.mode).toBe(GameMode.GAME_OVER);
    expect(result.current.highScores[0]).toMatchObject({
      score: 500,
      wpm: 80,
      accuracy: 96,
      mode: GameMode.NORMAL,
    });
    expect(result.current.stats.totalGamesPlayed).toBe(1);
    expect(result.current.stats.bestScore).toBe(500);
  });
});
