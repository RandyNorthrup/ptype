import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as DifficultyManagerModule from "../../src/utils/difficultyManager";

const mocks = vi.hoisted(() => ({
  invalidateDifficultyCache: vi.fn(),
  logError: vi.fn(),
  playLaser: vi.fn(),
  setMusicVolume: vi.fn(),
  setSfxVolume: vi.fn(),
}));

vi.mock("../../src/utils/audioManager", () => ({
  getAudioManager: () => ({
    playLaser: mocks.playLaser,
    setMusicVolume: mocks.setMusicVolume,
    setSfxVolume: mocks.setSfxVolume,
  }),
}));

vi.mock("../../src/utils/difficultyManager", async (loadOriginal) => {
  const original = await loadOriginal<typeof DifficultyManagerModule>();
  return {
    ...original,
    invalidateDifficultyCache: mocks.invalidateDifficultyCache,
  };
});

vi.mock("../../src/utils/logger", () => ({ error: mocks.logError }));

import { SettingsMenu } from "../../src/components/SettingsMenu";

describe("settings menu", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders accessible defaults and persists edited settings", async () => {
    const close = vi.fn();
    const { container } = render(<SettingsMenu onClose={close} />);
    const music = screen.getByRole("slider", { name: /music volume/i });
    const sfx = screen.getByRole("slider", { name: /sfx volume/i });

    expect(music).toHaveValue("50");
    expect(sfx).toHaveValue("50");
    expect(screen.getByRole("combobox", { name: /difficulty/i })).toHaveValue(
      "Normal",
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);

    fireEvent.change(music, { target: { value: "75" } });
    fireEvent.change(sfx, { target: { value: "25" } });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Master" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(JSON.parse(localStorage.getItem("game-settings")!)).toEqual({
      musicVolume: 75,
      sfxVolume: 25,
      difficulty: "Master",
    });
    expect(mocks.playLaser).toHaveBeenCalledOnce();
    expect(mocks.invalidateDifficultyCache).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it("validates and clamps persisted settings", () => {
    localStorage.setItem(
      "game-settings",
      JSON.stringify({
        musicVolume: 500,
        sfxVolume: NaN,
        difficulty: "Impossible",
      }),
    );
    render(<SettingsMenu onClose={vi.fn()} />);

    expect(screen.getByRole("slider", { name: /music volume/i })).toHaveValue(
      "100",
    );
    expect(screen.getByRole("slider", { name: /sfx volume/i })).toHaveValue(
      "50",
    );
    expect(screen.getByRole("combobox")).toHaveValue("Normal");
  });

  it("falls back after malformed storage and closes on cancel or backdrop", () => {
    localStorage.setItem("game-settings", "invalid");
    const close = vi.fn();
    const { unmount } = render(<SettingsMenu onClose={close} />);
    expect(mocks.logError).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(close).toHaveBeenCalledOnce();
    unmount();

    const second = render(<SettingsMenu onClose={close} />);
    fireEvent.click(screen.getByTestId("settings-menu-overlay"));
    expect(close).toHaveBeenCalledTimes(2);
    second.unmount();
  });

  it("still closes and reports when persistence fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const close = vi.fn();
    render(<SettingsMenu onClose={close} />);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(mocks.logError).toHaveBeenCalledWith(
      "Failed to save settings to localStorage",
      expect.any(Error),
      "SettingsMenu",
    );
    expect(close).toHaveBeenCalledOnce();
  });
});
