import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AchievementToast } from "../../src/components/AchievementToast";

const achievement = {
  id: "first",
  name: "First Steps",
  description: "Type a word",
  iconName: "/assets/icons/first.svg",
  unlocked: true,
  progress: 1,
  maxProgress: 1,
};

describe("achievement toast", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("announces, animates, and dismisses an SVG achievement", () => {
    vi.useFakeTimers();
    const dismiss = vi.fn();
    render(<AchievementToast achievement={achievement} onDismiss={dismiss} />);
    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent("First Steps");
    expect(screen.getByAltText("First Steps")).toBeInTheDocument();
    expect(toast).toHaveStyle({ opacity: "1" });

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(toast).toHaveStyle({ opacity: "0" });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it("uses the latest callback and supports text icons", () => {
    vi.useFakeTimers();
    const firstDismiss = vi.fn();
    const latestDismiss = vi.fn();
    const { rerender } = render(
      <AchievementToast
        achievement={{ ...achievement, iconName: "🏆" }}
        onDismiss={firstDismiss}
      />,
    );
    expect(screen.getByTestId("achievement-icon")).toHaveTextContent("🏆");
    rerender(
      <AchievementToast
        achievement={{ ...achievement, iconName: "🏆" }}
        onDismiss={latestDismiss}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(3300);
    });
    expect(firstDismiss).not.toHaveBeenCalled();
    expect(latestDismiss).toHaveBeenCalledOnce();
  });

  it("cleans up timers when unmounted", () => {
    vi.useFakeTimers();
    const dismiss = vi.fn();
    const { unmount } = render(
      <AchievementToast achievement={achievement} onDismiss={dismiss} />,
    );
    unmount();
    vi.runAllTimers();
    expect(dismiss).not.toHaveBeenCalled();
  });
});
