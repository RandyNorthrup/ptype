import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("rejects store access outside its provider", () => {
    expect(() => renderHook(() => useGameStore())).toThrow(
      "useGameStore must be used within GameStoreProvider",
    );
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

  it("manages profiles, pause state, and high-score ranking", () => {
    const { result } = renderHook(() => useGameStore(), { wrapper });
    const profile = {
      ...result.current.currentProfile!,
      name: "Ace",
    };

    act(() => {
      result.current.setProfile(profile);
      result.current.pauseGame();
    });
    expect(result.current.currentProfile?.name).toBe("Ace");
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.resumeGame();
      result.current.addHighScore({
        playerName: "Ace",
        score: 10,
        level: 1,
        wpm: 20,
        accuracy: 90,
        timestamp: "low",
        mode: GameMode.NORMAL,
      });
      result.current.addHighScore({
        playerName: "Ace",
        score: 100,
        level: 2,
        wpm: 30,
        accuracy: 95,
        timestamp: "high",
        mode: GameMode.NORMAL,
      });
    });
    expect(result.current.isPaused).toBe(false);
    expect(result.current.highScores.map(({ score }) => score)).toEqual([
      100, 10,
    ]);
  });

  it("runs the full trivia lifecycle and grants only correct bonuses", () => {
    const { result } = renderHook(() => useGameStore(), { wrapper });
    const question = {
      question: "Answer?",
      options: ["Yes", "No"],
      correctAnswer: 0,
      difficulty: "easy",
      category: "history",
    };
    const bonus = {
      itemId: 2,
      name: "Repair",
      description: "Heal",
      iconName: "repair",
      duration: 0,
      uses: 1,
      effectValue: 20,
      type: BonusItemType.DEFENSIVE,
    };

    act(() => {
      result.current.startGame(GameMode.NORMAL);
      result.current.showTrivia(question);
    });
    expect(result.current.mode).toBe(GameMode.TRIVIA);
    expect(result.current.currentTrivia).toEqual(question);

    act(() => {
      result.current.answerTrivia(0, true, bonus);
    });
    expect(result.current.triviaAnswered).toBe(true);
    expect(result.current.triviaResult).toBe(true);
    expect(result.current.selectedTriviaAnswer).toBe(0);
    expect(result.current.bonusItems).toContainEqual(bonus);

    act(() => {
      result.current.hideTrivia();
    });
    expect(result.current.mode).toBe(GameMode.NORMAL);
    expect(result.current.currentTrivia).toBeNull();
  });

  it("adds, updates, targets, and removes enemies", () => {
    const { result } = renderHook(() => useGameStore(), { wrapper });
    const enemy = {
      id: "enemy-1",
      word: "orbit",
      position: { x: 0, y: 0, z: 10 },
      velocity: { x: 0, y: 0, z: 1 },
      speed: 1,
      health: 10,
      maxHealth: 10,
      isBoss: false,
      scale: 1,
      typedCharacters: 0,
      spawnPoint: 1,
    };

    act(() => {
      result.current.addEnemy(enemy);
      result.current.setActiveEnemy(enemy.id);
    });
    act(() => {
      result.current.updateEnemy(enemy.id, { health: 5 });
    });
    expect(result.current.enemies[0]?.health).toBe(5);
    expect(result.current.activeEnemyId).toBe(enemy.id);

    act(() => {
      result.current.removeEnemy(enemy.id);
    });
    expect(result.current.enemies).toEqual([]);
    expect(result.current.activeEnemyId).toBeNull();
  });

  it("updates typing, level, boss, and missed-word counters", () => {
    const { result } = renderHook(() => useGameStore(), { wrapper });

    act(() => {
      result.current.setCurrentWord("ab");
      result.current.typeCharacter("c");
      result.current.submitWord();
      result.current.incrementWordsMissed();
      result.current.incrementBossesDefeated();
      result.current.nextLevel();
    });

    expect(result.current.currentWord).toBe("");
    expect(result.current.wordsTyped).toBe(2);
    expect(result.current.wordsCorrect).toBe(1);
    expect(result.current.wordsMissed).toBe(1);
    expect(result.current.bossesDefeated).toBe(1);
    expect(result.current.level).toBe(2);
  });

  it("cycles bonuses and handles empty consumption", () => {
    const { result } = renderHook(() => useGameStore(), { wrapper });
    const first = {
      itemId: 1,
      name: "First",
      description: "First bonus",
      iconName: "first",
      duration: 1,
      uses: 1,
      effectValue: 1,
      type: BonusItemType.OFFENSIVE,
    };
    const second = { ...first, itemId: 2, name: "Second" };

    expect(result.current.consumeSelectedBonus()).toBeNull();
    act(() => {
      result.current.addBonusItem(first);
      result.current.addBonusItem(second);
      result.current.selectNextBonus();
    });
    expect(result.current.selectedBonusIndex).toBe(1);

    let consumed = null;
    act(() => {
      consumed = result.current.consumeSelectedBonus();
    });
    expect(consumed).toEqual(second);
    expect(result.current.selectedBonusIndex).toBe(0);
  });

  it("applies EMP scoring, preserves bosses, and enforces cooldown", () => {
    const { result } = renderHook(() => useGameStore(), { wrapper });
    const baseEnemy = {
      position: { x: 0, y: 0, z: 10 },
      velocity: { x: 0, y: 0, z: 1 },
      speed: 1,
      health: 10,
      maxHealth: 10,
      scale: 1,
      typedCharacters: 0,
      spawnPoint: 1,
    };
    const regular = {
      ...baseEnemy,
      id: "regular",
      word: "four",
      isBoss: false,
    };
    const boss = { ...baseEnemy, id: "boss", word: "boss", isBoss: true };

    act(() => {
      result.current.addEnemy(regular);
      result.current.addEnemy(boss);
      result.current.setActiveEnemy(regular.id);
    });
    act(() => {
      result.current.triggerEMP();
    });
    expect(result.current.enemies).toEqual([boss]);
    expect(result.current.score).toBe(40);
    expect(result.current.activeEnemyId).toBeNull();
    expect(result.current.empCooldown).toBe(result.current.empMaxCooldown);

    act(() => {
      result.current.triggerEMP();
      result.current.setEmpCooldown(1);
      result.current.decrementEmpCooldown();
      result.current.decrementEmpCooldown();
    });
    expect(result.current.score).toBe(40);
    expect(result.current.empCooldown).toBe(0);
  });

  it("unlocks and updates achievement state", () => {
    const { result } = renderHook(() => useGameStore(), { wrapper });
    const achievement = result.current.achievements[0]!;

    act(() => {
      result.current.updateAchievementProgress(achievement.id, 2);
      result.current.unlockAchievement(achievement.id);
    });
    expect(result.current.achievements[0]).toMatchObject({
      progress: 2,
      unlocked: true,
    });

    act(() => {
      result.current.syncAchievements();
    });
    expect(result.current.achievements.length).toBeGreaterThan(0);
  });

  it("ends the game after lethal damage and ignores non-positive healing", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useGameStore(), { wrapper });

    act(() => {
      result.current.heal(0);
      result.current.addShield(-1);
      result.current.takeDamage(0);
      result.current.takeDamage(1000);
    });
    expect(result.current.health).toBe(0);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.mode).toBe(GameMode.GAME_OVER);
    unmount();
  });

  it("loads valid persisted data and discards malformed data", () => {
    const stored = {
      achievements: [],
      highScores: [],
      stats: {
        totalGamesPlayed: 3,
        totalScore: 50,
        totalWordsTyped: 4,
        totalWordsCorrect: 3,
        totalWordsMissed: 1,
        totalTimePlayed: 20,
        bestScore: 50,
        bestLevel: 2,
        bestWPM: 30,
        bestAccuracy: 90,
      },
    };
    localStorage.setItem("ptype-game-storage", JSON.stringify(stored));
    const valid = renderHook(() => useGameStore(), { wrapper });
    expect(valid.result.current.stats.totalGamesPlayed).toBe(3);
    valid.unmount();

    localStorage.setItem("ptype-game-storage", "not-json");
    const malformed = renderHook(() => useGameStore(), { wrapper });
    expect(malformed.result.current.highScores).toEqual([]);
  });
});
