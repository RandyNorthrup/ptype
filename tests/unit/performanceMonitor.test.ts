import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { performanceMonitor } from "../../src/utils/performanceMonitor";
import { debug } from "../../src/utils/logger";

vi.mock("../../src/utils/logger", () => ({ debug: vi.fn() }));

describe("performance monitor", () => {
  let animationFrame: FrameRequestCallback | undefined;
  let clock = 0;

  beforeEach(() => {
    const internals = performanceMonitor as unknown as {
      frameCount: number;
      frames: number[];
      stats: {
        current: { fps: number; frameTime: number };
        average: { fps: number; frameTime: number };
        min: { fps: number; frameTime: number };
        max: { fps: number; frameTime: number };
      };
    };
    internals.frames = [];
    internals.frameCount = 0;
    internals.stats = {
      current: { fps: 0, frameTime: 0 },
      average: { fps: 0, frameTime: 0 },
      min: { fps: 0, frameTime: 0 },
      max: { fps: 0, frameTime: 0 },
    };
    clock = 0;
    animationFrame = undefined;
    performanceMonitor.stop();
    vi.spyOn(performance, "now").mockImplementation(() => {
      clock += 20;
      return clock;
    });
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        animationFrame = callback;
        return 1;
      }),
    );
    Object.defineProperty(performance, "memory", {
      configurable: true,
      value: {
        usedJSHeapSize: 5 * 1024 * 1024,
        totalJSHeapSize: 10 * 1024 * 1024,
        jsHeapSizeLimit: 100 * 1024 * 1024,
      },
    });
  });

  afterEach(() => {
    performanceMonitor.stop();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Object.defineProperty(performance, "memory", {
      configurable: true,
      value: undefined,
    });
  });

  it("samples frames, reports memory, and notifies subscribers", () => {
    const subscriber = vi.fn();
    const unsubscribe = performanceMonitor.subscribe(subscriber);
    performanceMonitor.start();
    performanceMonitor.start();

    for (let index = 0; index < 59; index++) {
      animationFrame?.(clock);
    }

    expect(subscriber).toHaveBeenCalledOnce();
    expect(performanceMonitor.getStats().current.fps).toBe(50);
    expect(performanceMonitor.getMemoryUsageMB()).toBe(5);
    expect(performanceMonitor.isPerformanceGood()).toBe(true);
    expect(performanceMonitor.getPerformanceRating()).toBe("good");

    unsubscribe();
    for (let index = 0; index < 60; index++) {
      animationFrame?.(clock);
    }
    expect(subscriber).toHaveBeenCalledOnce();
  });

  it("measures sync and async work and logs formatted statistics", async () => {
    const syncWork = vi.fn();
    const asyncWork = vi.fn(async () => {
      await Promise.resolve();
    });

    performanceMonitor.measure("sync", syncWork);
    await performanceMonitor.measureAsync("async", asyncWork);
    performanceMonitor.logStats();

    expect(syncWork).toHaveBeenCalledOnce();
    expect(asyncWork).toHaveBeenCalledOnce();
    expect(debug).toHaveBeenCalledWith(
      "Performance Stats",
      expect.objectContaining({ memoryMB: "N/A" }),
      "PerformanceMonitor",
    );
  });

  it("reports zero memory when the browser omits heap metrics", () => {
    Object.defineProperty(performance, "memory", {
      configurable: true,
      value: undefined,
    });
    expect(performanceMonitor.getMemoryUsageMB()).toBe(0);

    // A fresh frame updates only when memory is present, so stopping and a
    // no-memory environment remains safe even when prior samples exist.
    performanceMonitor.stop();
    expect(() => {
      performanceMonitor.logStats();
    }).not.toThrow();
  });

  it("classifies every performance rating band", () => {
    const internals = performanceMonitor as unknown as {
      stats: { average: { fps: number } };
    };
    for (const [fps, rating] of [
      [60, "excellent"],
      [45, "good"],
      [30, "fair"],
      [10, "poor"],
    ] as const) {
      internals.stats.average.fps = fps;
      expect(performanceMonitor.getPerformanceRating()).toBe(rating);
    }
  });
});
