import { create, act } from "@react-three/test-renderer";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { Group } from "three";
import { GameCanvas } from "../../src/components/GameCanvas";
import { EnemyShip } from "../../src/entities/EnemyShip";
import {
  LaserTargetHelper,
  getLaserTarget,
} from "../../src/components/LaserTargetHelper";
import { getEnemyLetterId } from "../../src/utils/testIds";
import { GameMode, type Enemy } from "../../src/types";

const enemy: Enemy = {
  id: "actor",
  word: "a",
  position: { x: 0, y: 0, z: 20 },
  velocity: { x: 0, y: 0, z: -10 },
  speed: 10,
  health: 100,
  maxHealth: 100,
  isBoss: false,
  enemyType: "basic",
  scale: 1,
  typedCharacters: 0,
  spawnPoint: 1,
};
const state = {
  enemies: [enemy],
  mode: GameMode.NORMAL,
  level: 1,
  programmingLanguage: undefined,
  isPaused: false,
  isGameOver: false,
  currentDifficulty: "Normal",
  wordsCorrect: 0,
  wordsMissed: 0,
  startTime: 0,
  activeEnemyId: null as string | null,
  addEnemy: vi.fn(),
  removeEnemy: vi.fn(),
  takeDamage: vi.fn(),
  updateStats: vi.fn(),
  decrementEmpCooldown: vi.fn(),
  incrementWordsMissed: vi.fn(),
};
const spawner = vi.hoisted(() => ({
  reset: vi.fn(),
  forceSpawn: vi.fn(),
  update: vi.fn(() => null),
}));
vi.mock("../../src/store/gameContext", () => ({ useGameStore: () => state }));
vi.mock("../../src/utils/enemySpawner", () => ({ enemySpawner: spawner }));
vi.mock("../../src/utils/audioManager", () => ({
  getAudioManager: () => ({ playDamage: vi.fn(), playExplosion: vi.fn() }),
}));
vi.mock("../../src/entities/PlayerShip", () => ({ PlayerShip: () => null }));
vi.mock("../../src/components/CanvasHUD", () => ({ CanvasHUD: () => null }));
vi.mock("@react-three/drei", () => ({
  useGLTF: () => ({ scene: new Group() }),
  Text: ({ name }: { name?: string }) => <mesh name={name ?? ""} />,
}));

describe("scene frame contracts", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
      value: true,
      writable: true,
      configurable: true,
    });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    vi.setSystemTime(0);
    vi.clearAllMocks();
    state.isPaused = false;
    state.isGameOver = false;
    state.mode = GameMode.NORMAL;
    state.enemies = [{ ...enemy, position: { ...enemy.position } }];
    state.activeEnemyId = null;
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(["pause", "game over", "trivia"] as const)(
    "freezes actors and delayed spawn during %s, then resumes",
    async (condition) => {
      const renderer = await create(<GameCanvas />);
      try {
        const actor = renderer.scene.findAllByType("Group")[0]?.instance;
        if (actor?.type !== "Group")
          throw new Error("Enemy actor not discovered");
        await renderer.advanceFrames(1, 1);
        expect(actor.position.z).toBe(10);
        expect(state.decrementEmpCooldown).toHaveBeenCalledOnce();
        if (condition === "pause") state.isPaused = true;
        else if (condition === "game over") state.isGameOver = true;
        else state.mode = GameMode.TRIVIA;
        await renderer.update(<GameCanvas />);
        await renderer.advanceFrames(10, 1);
        await vi.advanceTimersByTimeAsync(1000);
        expect(actor.position.z).toBe(10);
        expect(state.decrementEmpCooldown).toHaveBeenCalledOnce();
        expect(state.takeDamage).not.toHaveBeenCalled();
        expect(spawner.forceSpawn).not.toHaveBeenCalled();
        state.isPaused = false;
        state.isGameOver = false;
        state.mode = GameMode.NORMAL;
        await renderer.update(<GameCanvas />);
        await renderer.advanceFrames(1, 1);
        expect(actor.position.z).toBe(0);
      } finally {
        await renderer.unmount();
      }
    },
  );

  it("projects the live letter mesh and clears stale targets", async () => {
    const stationary = { ...enemy, speed: 0, position: { x: 5, y: 0, z: 20 } };
    state.enemies = [stationary];
    state.activeEnemyId = stationary.id;
    const renderer = await create(
      <>
        <EnemyShip enemy={stationary} isActive onReachPlayer={vi.fn()} />
        <LaserTargetHelper />
      </>,
      {
        width: 800,
        height: 600,
        orthographic: true,
        camera: {
          left: -20,
          right: 20,
          top: 20,
          bottom: -20,
          near: 0.1,
          far: 1000,
          position: [0, 0, 100],
          manual: true,
        },
      },
    );
    try {
      const frameState = renderer.scene.fiber.root.getState();
      expect(frameState.size).toMatchObject({ width: 800, height: 600 });
      frameState.camera.updateProjectionMatrix();
      frameState.camera.updateMatrixWorld(true);
      const actor = renderer.scene.children.at(0)?.instance;
      if (actor?.type !== "Group")
        throw new Error("Enemy actor not discovered");
      await renderer.advanceFrames(1, 0);
      expect(getLaserTarget()).toEqual({ x: 500, y: 300 });
      actor.position.x = 10;
      await renderer.advanceFrames(1, 0);
      expect(state.enemies[0]?.position.x).toBe(5);
      expect(getLaserTarget()).toEqual({ x: 600, y: 300 });
      state.activeEnemyId = null;
      await renderer.advanceFrames(1, 0);
      expect(getLaserTarget()).toBeNull();
    } finally {
      await renderer.unmount();
    }
    expect(getLaserTarget()).toBeNull();
  });

  it("identifies normal and boss letters with independently specified names", () => {
    expect(getEnemyLetterId({ id: "one", isBoss: false }, 0)).toBe(
      "enemy-word-one-0",
    );
    expect(getEnemyLetterId({ id: "two", isBoss: true }, 3)).toBe(
      "boss-word-two-3",
    );
  });

  it("animates destruction particles after ship movement stops", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const destroyed = { ...enemy, health: 0 };
    const renderer = await create(
      <EnemyShip enemy={destroyed} isActive onReachPlayer={vi.fn()} />,
    );
    try {
      const particles = renderer.scene.findAllByType("Mesh");
      expect(particles).toHaveLength(12);
      const particle = particles[0]?.instance;
      if (!particle) throw new Error("Destruction particle not discovered");
      expect(particle.position.x).toBe(0);
      await act(async () => {
        await renderer.advanceFrames(3, 1 / 60);
      });
      expect(particle.position.x).toBe(0.4);
    } finally {
      await renderer.unmount();
    }
  });
});
