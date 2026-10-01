import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BonusItemType } from "../../src/types";

const mocks = vi.hoisted(() => ({
  getBonusItem: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("../../src/utils/triviaDatabase", () => ({
  triviaDatabase: { getBonusItem: mocks.getBonusItem },
}));

vi.mock("../../src/utils/logger", () => ({ error: mocks.logError }));

import { TriviaOverlay } from "../../src/components/TriviaOverlay";

const question = {
  question: "Which answer is correct?",
  options: ["First", "Second", "Third"],
  correctAnswer: 1,
  difficulty: "easy",
  category: "history",
};

const bonus = {
  itemId: 1,
  name: "Shield",
  description: "Restore shields",
  iconName: "🛡️",
  duration: 60,
  uses: 1,
  effectValue: 20,
  type: BonusItemType.DEFENSIVE,
};

describe("trivia overlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.getBonusItem.mockReturnValue(bonus);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("awards a bonus for a correct answer and delays completion", () => {
    const answer = vi.fn();
    render(
      <TriviaOverlay
        question={question}
        onAnswer={answer}
        onTimeout={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("dialog", { name: "Which answer is correct?" }),
    ).toBeVisible();
    const option = screen.getByRole("button", { name: /B Second/ });
    fireEvent.mouseEnter(option);
    fireEvent.mouseLeave(option);
    fireEvent.click(option);

    expect(screen.getByRole("alert")).toHaveTextContent("CORRECT!");
    expect(screen.getByRole("alert")).toHaveTextContent("Shield");
    fireEvent.mouseEnter(option);
    fireEvent.mouseLeave(option);
    expect(answer).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(answer).toHaveBeenCalledWith(1, true, bonus);
  });

  it("marks an incorrect answer without granting a bonus", () => {
    const answer = vi.fn();
    render(
      <TriviaOverlay
        question={question}
        onAnswer={answer}
        onTimeout={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /A First/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("INCORRECT!");
    expect(mocks.getBonusItem).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(answer).toHaveBeenCalledWith(0, false, null);
  });

  it("counts down through timer bands and times out", () => {
    const timeout = vi.fn();
    render(
      <TriviaOverlay
        question={question}
        onAnswer={vi.fn()}
        onTimeout={timeout}
      />,
    );
    expect(screen.getByRole("timer")).toHaveAccessibleName(
      "15 seconds remaining",
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("timer")).toHaveAccessibleName(
      "10 seconds remaining",
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("timer")).toHaveAccessibleName(
      "5 seconds remaining",
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("alert")).toHaveTextContent("INCORRECT!");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(timeout).toHaveBeenCalledOnce();
  });

  it("reports reward failures without escaping the event handler", () => {
    const failure = new Error("reward unavailable");
    mocks.getBonusItem.mockImplementation(() => {
      throw failure;
    });
    render(
      <TriviaOverlay
        question={question}
        onAnswer={vi.fn()}
        onTimeout={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /B Second/ }));
    expect(mocks.logError).toHaveBeenCalledWith(
      "Failed to handle trivia answer",
      failure,
      "TriviaOverlay",
    );
  });
});
