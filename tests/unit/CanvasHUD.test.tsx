import axe from "axe-core";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BonusItemType, GameMode, ProgrammingLanguage } from "../../src/types";

const mocks = vi.hoisted(() => ({
  store: {
    score: 1234,
    level: 1,
    health: 100,
    maxHealth: 100,
    shield: 50,
    maxShield: 50,
    wpm: 42,
    accuracy: 98.5,
    bonusItems: [] as {
      itemId: number;
      name: string;
      description: string;
      iconName: string;
      duration: number;
      uses: number;
      effectValue: number;
      type: BonusItemType;
    }[],
    selectedBonusIndex: 0,
    empCooldown: 0,
    empMaxCooldown: 300,
    mode: "normal",
    programmingLanguage: undefined as string | undefined,
    currentDifficulty: "Normal",
  },
}));

vi.mock("@react-three/drei", () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../../src/store/gameContext", () => ({
  useGameStore: () => mocks.store,
}));

import { CanvasHUD } from "../../src/components/CanvasHUD";

describe("canvas HUD", () => {
  beforeEach(() => {
    mocks.store.health = 100;
    mocks.store.mode = GameMode.NORMAL;
    mocks.store.programmingLanguage = undefined;
    mocks.store.bonusItems = [];
    mocks.store.selectedBonusIndex = 0;
    mocks.store.empCooldown = 0;
  });

  it("announces accessible normal-mode status and ready EMP", async () => {
    const { container } = render(<CanvasHUD />);
    expect(
      screen.getByRole("status", { name: "Game status" }),
    ).toHaveTextContent("SCORE: 1,234");
    expect(screen.getByText("Normal")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Health" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    expect(screen.getByRole("timer", { name: "EMP ready" })).toHaveTextContent(
      "READY",
    );
    expect(screen.queryByRole("list", { name: "Bonus items" })).toBeNull();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("renders programming details, low health, bonuses, and EMP countdown", () => {
    mocks.store.health = 20;
    mocks.store.mode = GameMode.PROGRAMMING;
    mocks.store.programmingLanguage = ProgrammingLanguage.PYTHON;
    mocks.store.empCooldown = 121;
    mocks.store.bonusItems = [
      {
        itemId: 1,
        name: "Repair",
        description: "Heal",
        iconName: "repair",
        duration: 0,
        uses: 2,
        effectValue: 20,
        type: BonusItemType.DEFENSIVE,
      },
      {
        itemId: 2,
        name: "Laser",
        description: "Attack",
        iconName: "laser",
        duration: 0,
        uses: 1,
        effectValue: 20,
        type: BonusItemType.OFFENSIVE,
      },
    ];
    mocks.store.selectedBonusIndex = 1;

    render(<CanvasHUD />);
    expect(screen.getByText("Programming - Python")).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Bonus items" }).children,
    ).toHaveLength(2);
    expect(
      screen.getByRole("timer", { name: "EMP recharging" }),
    ).toHaveTextContent("3s");
    expect(screen.getByText("Laser").parentElement).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
