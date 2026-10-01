import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dreiMocks = vi.hoisted(() => ({
  clear: vi.fn(),
  preload: vi.fn(),
}));

vi.mock("@react-three/drei", () => ({
  useGLTF: Object.assign(vi.fn(), dreiMocks),
}));

vi.mock("../../src/utils/logger", () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
}));

import { resourcePreloader } from "../../src/utils/resourcePreloader";
import { performanceMonitor } from "../../src/utils/performanceMonitor";
import { warn } from "../../src/utils/logger";

interface PreloaderInternals {
  currentCacheSize: number;
  isProcessing: boolean;
  loadedAssets: Map<string, unknown>;
  loadingQueue: unknown[];
  maxCacheSize: number;
}

class FakeImage extends EventTarget {
  static shouldFail = false;
  private source = "";

  set src(value: string) {
    this.source = value;
    this.dispatchEvent(new Event(FakeImage.shouldFail ? "error" : "load"));
  }

  get src() {
    return this.source;
  }
}

describe("resource preloader", () => {
  let internals: PreloaderInternals;
  let appendedNodes: number;

  beforeEach(() => {
    vi.clearAllMocks();
    internals = resourcePreloader as unknown as PreloaderInternals;
    appendedNodes = 0;
    internals.loadedAssets = new Map();
    internals.loadingQueue = [];
    internals.currentCacheSize = 0;
    internals.maxCacheSize = 100 * 1024 * 1024;
    internals.isProcessing = false;
    FakeImage.shouldFail = false;
    vi.stubGlobal("Image", FakeImage);
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          statusText: "OK",
          text: vi.fn(() => Promise.resolve("loaded")),
        }),
      ),
    );
    vi.spyOn(document.head, "append").mockImplementation((node) => {
      appendedNodes += 1;
      if (node instanceof Node) node.dispatchEvent(new Event("load"));
    });
    vi.spyOn(performanceMonitor, "measureAsync").mockImplementation(
      async (_label, operation) => {
        await operation();
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("preloads and retains the critical model and font set", async () => {
    await resourcePreloader.preloadCriticalAssets();

    expect(dreiMocks.preload).toHaveBeenCalledTimes(2);
    expect(appendedNodes).toBe(1);
    expect(resourcePreloader.getCacheStats()).toMatchObject({
      totalAssets: 3,
      queueLength: 0,
      maxCacheSizeMB: "100.00",
    });

    await resourcePreloader.preloadCriticalAssets();
    expect(dreiMocks.preload).toHaveBeenCalledTimes(2);
  });

  it("loads queued images and data by priority without duplicates", async () => {
    vi.useFakeTimers();
    resourcePreloader.queueAsset("/data/config.json", "low");
    resourcePreloader.queueAsset("/image.webp", "high");
    resourcePreloader.queueAsset("/image.webp", "high");
    resourcePreloader.queueAssets(["/more.png", "/words.yaml"], "medium");

    await vi.runAllTimersAsync();

    expect(resourcePreloader.getCacheStats()).toMatchObject({
      totalAssets: 4,
      queueLength: 0,
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("evicts least-recent noncritical assets and clears loaded models", async () => {
    vi.useFakeTimers();
    internals.maxCacheSize = 250 * 1024;
    resourcePreloader.queueAsset("/first.webp", "low");
    resourcePreloader.queueAsset("/second.webp", "high");
    resourcePreloader.queueAsset("/ship.glb", "medium");
    await vi.runAllTimersAsync();

    expect(resourcePreloader.getCacheStats().totalAssets).toBe(1);
    resourcePreloader.clearNonCriticalAssets();
    expect(resourcePreloader.getCacheStats().totalAssets).toBe(0);
    expect(dreiMocks.clear).toHaveBeenCalledWith("/ship.glb");
  });

  it("logs statistics and tolerates failed image and data preloads", async () => {
    vi.useFakeTimers();
    FakeImage.shouldFail = true;
    vi.mocked(fetch).mockResolvedValue(
      new Response("", { status: 404, statusText: "Not Found" }),
    );

    resourcePreloader.queueAssets(["/missing.jpg", "/missing.yaml"]);
    await vi.runAllTimersAsync();
    resourcePreloader.logStats();

    expect(warn).toHaveBeenCalledTimes(2);
    expect(resourcePreloader.getCacheStats().totalAssets).toBe(0);
  });
});
