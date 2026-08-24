import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/store/gameContext", () => ({
  useGameStore: () => ({ level: 3, score: 1234, wpm: 72, accuracy: 97.5 }),
}));

vi.mock("../../src/components/SettingsMenu", () => ({
  SettingsMenu: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" aria-label="Pause settings">
      <button type="button" onClick={onClose}>
        Back
      </button>
    </div>
  ),
}));

import { PauseMenu } from "../../src/components/PauseMenu";

describe("pause menu", () => {
  it("renders accessible stats and invokes resume and main-menu actions", async () => {
    const resume = vi.fn();
    const mainMenu = vi.fn();
    const { container } = render(
      <PauseMenu onResume={resume} onMainMenu={mainMenu} />,
    );

    expect(screen.getByRole("dialog", { name: /paused/i })).toBeVisible();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("97.5%")).toBeInTheDocument();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);

    fireEvent.click(screen.getByRole("button", { name: /resume game/i }));
    fireEvent.click(screen.getByRole("button", { name: /main menu/i }));
    expect(resume).toHaveBeenCalledOnce();
    expect(mainMenu).toHaveBeenCalledOnce();
  });

  it("opens settings and returns to the pause dialog", () => {
    render(<PauseMenu onResume={vi.fn()} onMainMenu={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /settings/i }));
    expect(
      screen.getByRole("dialog", { name: "Pause settings" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("dialog", { name: /paused/i })).toBeVisible();
  });

  it("resumes when the backdrop is dismissed", () => {
    const resume = vi.fn();
    render(<PauseMenu onResume={resume} onMainMenu={vi.fn()} />);
    fireEvent.click(screen.getByTestId("pause-menu-overlay"));
    expect(resume).toHaveBeenCalledOnce();
  });
});
