import { beforeEach, describe, expect, it } from "vitest";
import {
  getCurrentDifficulty,
  getDifficultyColor,
  getDifficultyMultiplier,
  getStartingDifficulty,
  invalidateDifficultyCache,
} from "../../src/utils/difficultyManager";

describe("difficulty manager", () => {
  beforeEach(() => {
    localStorage.clear();
    invalidateDifficultyCache();
  });

  it("loads and caches a valid starting difficulty", () => {
    localStorage.setItem(
      "game-settings",
      JSON.stringify({ difficulty: "Hard" }),
    );
    expect(getStartingDifficulty()).toBe("Hard");

    localStorage.setItem(
      "game-settings",
      JSON.stringify({ difficulty: "Easy" }),
    );
    expect(getStartingDifficulty()).toBe("Hard");

    invalidateDifficultyCache();
    expect(getStartingDifficulty()).toBe("Easy");
  });

  it("falls back safely for malformed or unsupported settings", () => {
    localStorage.setItem("game-settings", "not-json");
    expect(getStartingDifficulty()).toBe("Normal");

    invalidateDifficultyCache();
    localStorage.setItem(
      "game-settings",
      JSON.stringify({ difficulty: "Impossible" }),
    );
    expect(getStartingDifficulty()).toBe("Normal");
  });

  it("progresses each starting mode at its configured boundaries", () => {
    expect(getCurrentDifficulty(1, "Easy")).toBe("Easy");
    expect(getCurrentDifficulty(40, "Easy")).toBe("Normal");
    expect(getCurrentDifficulty(30, "Normal")).toBe("Hard");
    expect(getCurrentDifficulty(25, "Hard")).toBe("Expert");
    expect(getCurrentDifficulty(20, "Expert")).toBe("Master");
    expect(getCurrentDifficulty(1, "Master")).toBe("Master");
  });

  it("provides stable multipliers and display colors", () => {
    expect(getDifficultyMultiplier("Easy")).toBe(0.6);
    expect(getDifficultyMultiplier("Normal")).toBe(1);
    expect(getDifficultyMultiplier("Hard")).toBe(1.35);
    expect(getDifficultyMultiplier("Expert")).toBe(1.65);
    expect(getDifficultyMultiplier("Master")).toBe(2);
    expect(getDifficultyColor("Easy")).toBe("#4ade80");
    expect(getDifficultyColor("Master")).toBe("#ef4444");
  });
});
