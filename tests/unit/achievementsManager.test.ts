import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACHIEVEMENTS_DEFINITIONS,
  achievementsManager,
  loadPersistedAchievementStats,
  type AchievementStats,
} from "../../src/utils/achievementsManager";

vi.mock("../../src/utils/logger", () => ({ info: vi.fn() }));

const EMPTY_STATS: AchievementStats = {
  bonusItemsUsed: 0,
  bonusItemsCollected: 0,
  bossesDefeated: 0,
  gamesPlayed: 0,
  highestAccuracy: 0,
  highestLevel: 0,
  highestScore: 0,
  highestWPM: 0,
  languagesPlayed: new Set(),
  perfectWordStreak: 0,
  playTimeSeconds: 0,
  triviaCorrect: 0,
  triviaStreak: 0,
  wordsTyped: 0,
};

describe("achievements manager", () => {
  beforeEach(() => {
    localStorage.clear();
    achievementsManager.load(
      ACHIEVEMENTS_DEFINITIONS.map((achievement) => ({
        ...achievement,
        progress: 0,
        unlocked: false,
      })),
      { ...EMPTY_STATS, languagesPlayed: new Set() },
    );
  });

  it("loads validated persisted statistics", () => {
    expect(loadPersistedAchievementStats()).toEqual({});
    localStorage.setItem("ptype-achievement-stats", "invalid");
    expect(loadPersistedAchievementStats()).toEqual({});
    localStorage.setItem("ptype-achievement-stats", "[]");
    expect(loadPersistedAchievementStats()).toEqual({});

    localStorage.setItem(
      "ptype-achievement-stats",
      JSON.stringify({
        wordsTyped: 12,
        gamesPlayed: Infinity,
        languagesPlayed: ["Python", "Java"],
        highestScore: "bad",
      }),
    );
    expect(loadPersistedAchievementStats()).toEqual({
      wordsTyped: 12,
      languagesPlayed: new Set(["Python", "Java"]),
    });
  });

  it("merges saved achievements and notifies subscribers once", () => {
    const listener = vi.fn();
    const unsubscribe = achievementsManager.onUnlock(listener);

    achievementsManager.onWordCompleted();
    achievementsManager.onWordCompleted();
    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0]?.[0]).toMatchObject({
      id: "first_word",
      unlocked: true,
    });

    unsubscribe();
    achievementsManager.onBossDefeated();
    expect(listener).toHaveBeenCalledOnce();
    expect(achievementsManager.getUnlockedCount()).toBeGreaterThan(0);
    expect(achievementsManager.getTotalCount()).toBe(
      ACHIEVEMENTS_DEFINITIONS.length,
    );
  });

  it("records every gameplay event and resets streaks", () => {
    achievementsManager.onWordCompleted();
    achievementsManager.onTypingMistake();
    achievementsManager.onWordCompleted();
    achievementsManager.onWordMissed();
    achievementsManager.onBossDefeated();
    achievementsManager.onBonusCollected();
    achievementsManager.onBonusUsed();
    achievementsManager.onTriviaAnswered(true);
    achievementsManager.onTriviaAnswered(false);
    achievementsManager.onLanguagePlayed("Python");
    achievementsManager.onGameEnd({
      score: 5000,
      level: 12,
      wpm: 120,
      accuracy: 99,
      playTimeSeconds: 60,
    });

    expect(achievementsManager.getStats()).toMatchObject({
      wordsTyped: 2,
      gamesPlayed: 1,
      bossesDefeated: 1,
      perfectWordStreak: 0,
      triviaCorrect: 1,
      triviaStreak: 0,
      bonusItemsCollected: 1,
      bonusItemsUsed: 1,
      playTimeSeconds: 60,
      highestWPM: 120,
      highestAccuracy: 99,
      highestScore: 5000,
      highestLevel: 12,
    });
    expect(achievementsManager.getStats().languagesPlayed).toEqual(
      new Set(["Python"]),
    );
    expect(localStorage.getItem("ptype-achievement-stats")).toContain(
      '"Python"',
    );
  });

  it("unlocks all definitions when every threshold is met", () => {
    achievementsManager.updateStats({
      wordsTyped: 100_000,
      gamesPlayed: 100_000,
      bossesDefeated: 100_000,
      perfectWordStreak: 100_000,
      triviaCorrect: 100_000,
      triviaStreak: 100_000,
      bonusItemsCollected: 100_000,
      bonusItemsUsed: 100_000,
      languagesPlayed: new Set([
        "Python",
        "Java",
        "JavaScript",
        "C#",
        "C++",
        "CSS",
        "HTML",
      ]),
      playTimeSeconds: 100_000,
      highestWPM: 100_000,
      highestAccuracy: 100_000,
      highestScore: 100_000,
      highestLevel: 100_000,
    });

    expect(achievementsManager.getUnlockedCount()).toBe(
      achievementsManager.getTotalCount(),
    );
  });

  it("tolerates unavailable persistence", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    expect(() => {
      achievementsManager.onBonusCollected();
    }).not.toThrow();
  });
});
