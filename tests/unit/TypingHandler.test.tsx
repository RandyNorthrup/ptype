import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BonusItemType, GameMode, ProgrammingLanguage } from "../../src/types";

const callbacks = vi.hoisted(() => ({
  addShield: vi.fn(),
  consumeSelectedBonus: vi.fn(),
  heal: vi.fn(),
  incrementBossesDefeated: vi.fn(),
  incrementScore: vi.fn(),
  logError: vi.fn(),
  nextLevel: vi.fn(),
  onTypingMistake: vi.fn(),
  pauseGame: vi.fn(),
  playExplosion: vi.fn(),
  playTypeCorrect: vi.fn(),
  playTypeIncorrect: vi.fn(),
  playWordComplete: vi.fn(),
  resumeGame: vi.fn(),
  selectNextBonus: vi.fn(),
  setActiveEnemy: vi.fn(),
  setCurrentWord: vi.fn(),
  showTrivia: vi.fn(),
  submitWord: vi.fn(),
  triggerEMP: vi.fn(),
  triviaQuestion: vi.fn(() => ({
    question: "Trivia?",
    options: ["A", "B"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "history",
  })),
  typeCharacter: vi.fn(),
  updateEnemy: vi.fn(),
}));

const store = vi.hoisted(() => ({
  enemies: [] as {
    id: string;
    word: string;
    typedCharacters: number;
    isBoss: boolean;
  }[],
  isPaused: false,
  isGameOver: false,
  mode: "normal",
  level: 1,
  programmingLanguage: undefined as string | undefined,
  empCooldown: 0,
  activeEnemyId: null as string | null,
  bonusItems: [] as { name: string }[],
}));

vi.mock("../../src/store/gameContext", () => ({
  useGameStore: () => ({ ...store, ...callbacks }),
}));

vi.mock("../../src/utils/audioManager", () => ({
  getAudioManager: () => ({
    playExplosion: callbacks.playExplosion,
    playTypeCorrect: callbacks.playTypeCorrect,
    playTypeIncorrect: callbacks.playTypeIncorrect,
    playWordComplete: callbacks.playWordComplete,
  }),
}));

vi.mock("../../src/utils/triviaDatabase", () => ({
  triviaDatabase: { getQuestion: callbacks.triviaQuestion },
}));

vi.mock("../../src/utils/achievementsManager", () => ({
  achievementsManager: { onTypingMistake: callbacks.onTypingMistake },
}));

vi.mock("../../src/utils/logger", () => ({ error: callbacks.logError }));

import { TypingHandler } from "../../src/components/TypingHandler";

function press(key: string): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, cancelable: true });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe("typing handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.enemies = [];
    store.isPaused = false;
    store.isGameOver = false;
    store.mode = GameMode.NORMAL;
    store.level = 1;
    store.programmingLanguage = undefined;
    store.empCooldown = 0;
    store.activeEnemyId = null;
    store.bonusItems = [];
    callbacks.consumeSelectedBonus.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("toggles pause with Escape and gates inactive game modes", () => {
    const view = render(<TypingHandler />);
    expect(press("Escape").defaultPrevented).toBe(true);
    expect(callbacks.pauseGame).toHaveBeenCalledOnce();

    store.isPaused = true;
    view.rerender(<TypingHandler />);
    press("Escape");
    expect(callbacks.resumeGame).toHaveBeenCalledOnce();

    store.isPaused = false;
    store.mode = GameMode.MENU;
    view.rerender(<TypingHandler />);
    expect(press("x").defaultPrevented).toBe(false);
    store.mode = GameMode.TRIVIA;
    view.rerender(<TypingHandler />);
    press("Escape");
    store.isGameOver = true;
    store.mode = GameMode.NORMAL;
    view.rerender(<TypingHandler />);
    press("Escape");
    expect(callbacks.pauseGame).toHaveBeenCalledOnce();
  });

  it("switches targets with Tab and resets partial progress", () => {
    const view = render(<TypingHandler />);
    press("Tab");
    expect(callbacks.setActiveEnemy).not.toHaveBeenCalled();

    store.enemies = [
      { id: "one", word: "one", typedCharacters: 1, isBoss: false },
      { id: "two", word: "two", typedCharacters: 0, isBoss: false },
    ];
    store.activeEnemyId = "one";
    view.rerender(<TypingHandler />);
    press("Tab");
    expect(callbacks.updateEnemy).toHaveBeenCalledWith("one", {
      typedCharacters: 0,
    });
    expect(callbacks.setActiveEnemy).toHaveBeenCalledWith("two");
    expect(callbacks.setCurrentWord).toHaveBeenCalledWith("");

    store.activeEnemyId = "missing";
    view.rerender(<TypingHandler />);
    press("Tab");
    expect(callbacks.setActiveEnemy).toHaveBeenLastCalledWith("one");
  });

  it("uses EMP and bonus controls only when available", () => {
    const view = render(<TypingHandler />);
    press("Enter");
    expect(callbacks.triggerEMP).toHaveBeenCalledOnce();
    store.empCooldown = 5;
    view.rerender(<TypingHandler />);
    press("Enter");
    expect(callbacks.triggerEMP).toHaveBeenCalledOnce();

    press("ArrowUp");
    expect(callbacks.selectNextBonus).not.toHaveBeenCalled();
    store.bonusItems = [{ name: "bonus" }];
    view.rerender(<TypingHandler />);
    press("ArrowUp");
    expect(callbacks.selectNextBonus).toHaveBeenCalledOnce();

    callbacks.consumeSelectedBonus.mockReturnValueOnce({
      itemId: 1,
      name: "Shield boost",
      description: "Shield",
      iconName: "shield",
      duration: 0,
      uses: 1,
      effectValue: 30,
      type: BonusItemType.DEFENSIVE,
    });
    press("ArrowDown");
    expect(callbacks.addShield).toHaveBeenCalledWith(30);

    callbacks.consumeSelectedBonus.mockReturnValueOnce({
      itemId: 2,
      name: "Repair",
      description: "Heal",
      iconName: "repair",
      duration: 0,
      uses: 1,
      effectValue: 20,
      type: BonusItemType.DEFENSIVE,
    });
    press("ArrowDown");
    expect(callbacks.heal).toHaveBeenCalledWith(20);

    callbacks.consumeSelectedBonus.mockReturnValueOnce({
      itemId: 3,
      name: "Blast",
      description: "Attack",
      iconName: "blast",
      duration: 0,
      uses: 1,
      effectValue: 1,
      type: BonusItemType.OFFENSIVE,
    });
    press("ArrowDown");
    expect(callbacks.triggerEMP).toHaveBeenCalledTimes(2);
    expect(callbacks.playWordComplete).toHaveBeenCalledTimes(3);
  });

  it("starts, continues, rejects, and completes regular words", () => {
    const view = render(<TypingHandler />);
    store.enemies = [
      { id: "word", word: "go", typedCharacters: 0, isBoss: false },
    ];
    view.rerender(<TypingHandler />);
    expect(press("g").defaultPrevented).toBe(true);
    expect(callbacks.setActiveEnemy).toHaveBeenCalledWith("word");
    expect(callbacks.playTypeCorrect).toHaveBeenCalledOnce();

    store.activeEnemyId = "word";
    store.enemies = [
      { id: "word", word: "go", typedCharacters: 1, isBoss: false },
    ];
    view.rerender(<TypingHandler />);
    press("x");
    expect(callbacks.onTypingMistake).toHaveBeenCalledOnce();
    expect(callbacks.playTypeIncorrect).toHaveBeenCalledOnce();
    press("o");
    expect(callbacks.updateEnemy).toHaveBeenCalledWith("word", { health: 0 });
    expect(callbacks.incrementScore).toHaveBeenCalledWith(20);
    expect(callbacks.submitWord).toHaveBeenCalledOnce();

    store.activeEnemyId = null;
    store.enemies = [];
    view.rerender(<TypingHandler />);
    press("z");
    expect(callbacks.onTypingMistake).toHaveBeenCalledTimes(2);
  });

  it("completes single-character bosses and schedules milestone trivia", () => {
    vi.useFakeTimers();
    store.level = 6;
    store.mode = GameMode.PROGRAMMING;
    store.programmingLanguage = ProgrammingLanguage.PYTHON;
    store.enemies = [
      { id: "boss", word: "z", typedCharacters: 0, isBoss: true },
    ];
    render(<TypingHandler />);
    press("z");

    expect(callbacks.incrementScore).toHaveBeenCalledWith(50);
    expect(callbacks.playExplosion).toHaveBeenCalledOnce();
    expect(callbacks.incrementBossesDefeated).toHaveBeenCalledOnce();
    expect(callbacks.nextLevel).toHaveBeenCalledOnce();
    expect(callbacks.triviaQuestion).toHaveBeenCalledWith(
      GameMode.PROGRAMMING,
      ProgrammingLanguage.PYTHON,
      6,
    );
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(callbacks.showTrivia).toHaveBeenCalledWith(
      callbacks.triviaQuestion.mock.results[0]?.value,
    );
  });

  it("logs handler failures and removes its listener on unmount", () => {
    callbacks.pauseGame.mockImplementationOnce(() => {
      throw new Error("pause failed");
    });
    const view = render(<TypingHandler />);
    press("Escape");
    expect(callbacks.logError).toHaveBeenCalledWith(
      "Failed to handle keypress",
      expect.any(Error),
      "TypingHandler",
    );
    view.unmount();
    press("Escape");
    expect(callbacks.pauseGame).toHaveBeenCalledOnce();
  });
});
