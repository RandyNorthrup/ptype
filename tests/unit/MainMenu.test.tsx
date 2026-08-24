import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameMode, ProgrammingLanguage } from "../../src/types";

const mocks = vi.hoisted(() => ({
  logError: vi.fn(),
  startGame: vi.fn(),
}));

vi.mock("../../src/store/gameContext", () => ({
  useGameStore: () => ({ startGame: mocks.startGame }),
}));

vi.mock("../../src/utils/logger", () => ({ error: mocks.logError }));

vi.mock("../../src/components/PlayerStatsModal", () => ({
  PlayerStatsModal: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" aria-label="Mock stats">
      <button type="button" onClick={onClose}>
        Close stats
      </button>
    </div>
  ),
}));

vi.mock("../../src/components/SettingsMenu", () => ({
  SettingsMenu: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" aria-label="Mock settings">
      <button type="button" onClick={onClose}>
        Close settings
      </button>
    </div>
  ),
}));

import { MainMenu } from "../../src/components/MainMenu";

function chooseMode(name: string): void {
  fireEvent.click(screen.getByTestId("mode-selector-button"));
  fireEvent.click(screen.getByRole("option", { name }));
}

describe("main menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("selects and starts normal and programming games", () => {
    render(<MainMenu />);
    const start = screen.getByRole("button", { name: "NEW GAME" });
    const selector = screen.getByTestId("mode-selector-button");
    expect(start).toBeDisabled();
    expect(selector).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(selector);
    expect(selector).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox", { name: "Game mode" })).toBeVisible();
    const normal = screen.getByRole("option", { name: "Normal" });
    fireEvent.mouseEnter(normal);
    fireEvent.mouseLeave(normal);
    fireEvent.click(normal);
    expect(start).toBeEnabled();
    fireEvent.mouseEnter(start);
    fireEvent.mouseLeave(start);
    fireEvent.click(start);
    expect(mocks.startGame).toHaveBeenCalledWith(GameMode.NORMAL);

    chooseMode("Python");
    fireEvent.click(start);
    expect(mocks.startGame).toHaveBeenLastCalledWith(
      GameMode.PROGRAMMING,
      ProgrammingLanguage.PYTHON,
    );
  });

  it("closes the mode list on outside clicks and reports start failures", () => {
    mocks.startGame.mockImplementationOnce(() => {
      throw new Error("start failed");
    });
    render(<MainMenu />);
    const selector = screen.getByTestId("mode-selector-button");
    fireEvent.mouseEnter(selector);
    fireEvent.mouseLeave(selector);
    fireEvent.click(selector);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    chooseMode("Normal");
    fireEvent.click(screen.getByRole("button", { name: "NEW GAME" }));
    expect(mocks.logError).toHaveBeenCalledWith(
      "Failed to start game with mode: Normal",
      expect.any(Error),
      "MainMenu",
    );
  });

  it("opens and closes statistics and settings", () => {
    render(<MainMenu />);
    for (const [openName, dialogName, closeName] of [
      ["Player Stats", "Mock stats", "Close stats"],
      ["Settings", "Mock settings", "Close settings"],
    ] as const) {
      const open = screen.getByRole("button", { name: openName });
      fireEvent.mouseEnter(open);
      fireEvent.mouseLeave(open);
      fireEvent.click(open);
      expect(screen.getByRole("dialog", { name: dialogName })).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: closeName }));
      expect(screen.queryByRole("dialog", { name: dialogName })).toBeNull();
    }
  });

  it("renders an accessible responsive About dialog", async () => {
    const { container } = render(<MainMenu />);
    fireEvent.click(screen.getByRole("button", { name: "About" }));

    expect(screen.getByRole("dialog", { name: "P-Type" })).toBeVisible();
    expect(screen.getByText(/Created by Randy Northrup/)).toBeInTheDocument();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog", { name: "P-Type" })).toBeNull();
    expect(
      screen.getByTestId("mode-selector-button").parentElement,
    ).toHaveClass("main-menu-control");
  });
});
