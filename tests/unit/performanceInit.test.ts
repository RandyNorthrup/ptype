import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cacheStats: {
    totalAssets: 3,
    cacheSize: 100,
    cacheSizeMB: "0.10",
    maxCacheSizeMB: "100.00",
    utilizationPercent: "0.1",
    queueLength: 0,
  },
  debug: vi.fn(),
  getMemoryUsageMB: vi.fn(() => 12),
  getPerformanceRating: vi.fn<() => "excellent" | "good" | "fair" | "poor">(
    () => "good",
  ),
  getStats: vi.fn(() => ({
    current: { fps: 59.6 },
    average: { fps: 58.5 },
    min: { fps: 40.4 },
    max: { fps: 61.2 },
  })),
  info: vi.fn(),
  measureAsync: vi.fn(
    async (_label: string, operation: () => Promise<void>) => {
      await operation();
    },
  ),
  preloadCriticalAssets: vi.fn(() => Promise.resolve()),
  queueAssets: vi.fn(),
  start: vi.fn(),
}));

vi.mock("../../src/utils/performanceMonitor", () => ({
  performanceMonitor: {
    getMemoryUsageMB: mocks.getMemoryUsageMB,
    getPerformanceRating: mocks.getPerformanceRating,
    getStats: mocks.getStats,
    measureAsync: mocks.measureAsync,
    start: mocks.start,
  },
}));

vi.mock("../../src/utils/resourcePreloader", () => ({
  resourcePreloader: {
    getCacheStats: () => mocks.cacheStats,
    preloadCriticalAssets: mocks.preloadCriticalAssets,
    queueAssets: mocks.queueAssets,
  },
}));

vi.mock("../../src/utils/logger", () => ({
  debug: mocks.debug,
  info: mocks.info,
}));

import {
  getPerformanceStatus,
  initializePerformanceOptimizations,
} from "../../src/utils/performanceInit";

describe("performance initialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("starts local monitoring, preloads critical assets, and queues the rest", async () => {
    vi.useFakeTimers();
    await initializePerformanceOptimizations();

    expect(mocks.start).toHaveBeenCalledOnce();
    expect(mocks.preloadCriticalAssets).toHaveBeenCalledOnce();
    expect(mocks.queueAssets).toHaveBeenCalledWith(
      [
        "/assets/models/ships/enemy-fast.glb",
        "/assets/models/ships/enemy-boss.glb",
      ],
      "medium",
    );

    vi.advanceTimersByTime(1000);
    expect(mocks.debug).toHaveBeenCalledWith(
      "Initial Cache Stats",
      { resources: mocks.cacheStats },
      "PerformanceInit",
    );
  });

  it("initializes safely outside a browser", async () => {
    vi.stubGlobal("window", undefined);
    await initializePerformanceOptimizations();
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.preloadCriticalAssets).toHaveBeenCalledOnce();
  });

  it("returns rounded performance and cache status", () => {
    expect(getPerformanceStatus()).toEqual({
      fps: { current: 60, average: 59, min: 40, max: 61 },
      rating: "good",
      memory: 12,
      cache: mocks.cacheStats,
      isGood: true,
    });

    mocks.getPerformanceRating.mockReturnValueOnce("poor");
    expect(getPerformanceStatus().isGood).toBe(false);
  });
});
