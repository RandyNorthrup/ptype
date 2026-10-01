import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameMode, ProgrammingLanguage } from "../../src/types";
import { EnemySpawner } from "../../src/utils/enemySpawner";
import { wordDictionary } from "../../src/utils/wordDictionary";

vi.mock("../../src/utils/logger", () => ({
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
}));

describe("enemy spawner", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(wordDictionary, "getLanguageKey").mockReturnValue("normal");
    vi.spyOn(wordDictionary, "getWord").mockReturnValue("orbit");
  });

  it("force-spawns regular and boss enemies with bounded properties", () => {
    const spawner = new EnemySpawner();
    const regular = spawner.forceSpawn(
      1,
      GameMode.NORMAL,
      undefined,
      false,
      "Easy",
    );
    const boss = spawner.forceSpawn(
      10,
      GameMode.PROGRAMMING,
      ProgrammingLanguage.PYTHON,
      true,
      "Master",
    );

    expect(regular).toMatchObject({
      word: "orbit",
      health: 10.5,
      isBoss: false,
      scale: 1,
      spawnPoint: 0,
    });
    expect(regular?.position.x).toBe(-25);
    expect(regular?.speed).toBeGreaterThanOrEqual(1);
    expect(boss).toMatchObject({
      health: 200,
      isBoss: true,
      scale: 2,
      spawnPoint: 1,
    });
    expect(boss?.position.x).toBe(0);
  });

  it("spawns on schedule, rotates lanes, and respects the enemy cap", () => {
    const spawner = new EnemySpawner();

    expect(
      spawner.update(1, 1, GameMode.NORMAL, undefined, 0, "Normal"),
    ).toBeNull();
    const first = spawner.update(3, 1, GameMode.NORMAL, undefined, 0, "Normal");
    expect(first?.spawnPoint).toBe(0);

    expect(
      spawner.update(4, 1, GameMode.NORMAL, undefined, 3, "Normal"),
    ).toBeNull();
    const second = spawner.update(
      4,
      1,
      GameMode.NORMAL,
      undefined,
      0,
      "Normal",
    );
    expect(second?.spawnPoint).toBe(1);

    spawner.reset();
    expect(spawner.forceSpawn(1, GameMode.NORMAL, undefined)?.spawnPoint).toBe(
      0,
    );
  });

  it("force-spawns bosses at boss levels when the field is clear", () => {
    const spawner = new EnemySpawner();
    const enemy = spawner.update(4, 9, GameMode.NORMAL, undefined, 0, "Normal");
    expect(enemy?.isBoss).toBe(true);
    expect(enemy?.health).toBe(190);
  });

  it("chooses the longest retry candidate for a fast enemy", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const getWordMock = vi.spyOn(wordDictionary, "getWord");
    getWordMock
      .mockReturnValueOnce("short")
      .mockReturnValueOnce("considerably-longer")
      .mockReturnValueOnce("medium");
    const spawner = new EnemySpawner();

    const enemy = spawner.forceSpawn(20, GameMode.NORMAL, undefined);

    expect(enemy?.enemyType).toBe("fast");
    // forceSpawn intentionally performs one dictionary lookup; scheduled fast
    // enemies exercise the retry path.
    getWordMock
      .mockReturnValueOnce("short")
      .mockReturnValueOnce("considerably-longer")
      .mockReturnValueOnce("medium");
    const scheduled = spawner.update(
      4,
      20,
      GameMode.NORMAL,
      undefined,
      0,
      "Normal",
    );
    expect(scheduled?.word).toBe("considerably-longer");
  });

  it("returns null when dictionary access fails", () => {
    vi.spyOn(wordDictionary, "getLanguageKey").mockImplementation(() => {
      throw new Error("dictionary unavailable");
    });
    const spawner = new EnemySpawner();

    expect(spawner.forceSpawn(1, GameMode.NORMAL, undefined)).toBeNull();
    expect(
      spawner.update(4, 1, GameMode.NORMAL, undefined, 0, "Normal"),
    ).toBeNull();
  });
});
