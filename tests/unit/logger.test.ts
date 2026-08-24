import { afterEach, describe, expect, it, vi } from "vitest";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("records, filters, caps, exports, and forwards development logs", async () => {
    const consoleSpies = {
      debug: vi.spyOn(console, "debug").mockImplementation(() => false),
      info: vi.spyOn(console, "info").mockImplementation(() => false),
      warn: vi.spyOn(console, "warn").mockImplementation(() => false),
      error: vi.spyOn(console, "error").mockImplementation(() => false),
    };
    const module = await import("../../src/utils/logger");
    module.logger.clear();
    const errorCallback = vi.fn();
    module.logger.onError(errorCallback);
    const failure = new Error("boom");

    module.debug("debug message", { value: 1 }, "test");
    module.info("info message");
    module.warn("warn message");
    module.error("error message", failure, "test");
    module.error("string error", "failure");

    expect(consoleSpies.debug).toHaveBeenCalledOnce();
    expect(consoleSpies.info).toHaveBeenCalledOnce();
    expect(consoleSpies.warn).toHaveBeenCalledOnce();
    expect(consoleSpies.error).toHaveBeenCalledTimes(2);
    expect(errorCallback).toHaveBeenCalledWith(failure, "test");
    expect(module.logger.getLogs("warn")).toHaveLength(1);
    expect(module.logger.getWarningCount()).toBe(1);
    expect(module.logger.getErrorCount()).toBe(2);
    expect(JSON.parse(module.logger.export())).toHaveLength(5);
    expect(window.__ptypeLogger).toBe(module.logger);

    for (let index = 0; index < 101; index++) {
      module.info(`entry-${index.toString()}`);
    }
    expect(module.logger.getLogs()).toHaveLength(100);
  });

  it("suppresses debug and console output outside the browser", async () => {
    vi.stubGlobal("window", undefined);
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => false);
    const module = await import("../../src/utils/logger");

    module.debug("hidden");
    module.info("stored");
    expect(module.logger.getLogs()).toHaveLength(1);
    expect(infoSpy).not.toHaveBeenCalled();

    module.logger.clear();
    expect(module.logger.getLogs()).toEqual([]);
  });
});
