import { afterEach, describe, expect, it, vi } from "vitest";
import { publicAssetUrl } from "../../src/utils/publicAssetUrl";

describe("public asset URLs", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("resolves root hosting without duplicate slashes", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(publicAssetUrl("/assets/fonts/Orbitron-Regular.ttf")).toBe(
      "/assets/fonts/Orbitron-Regular.ttf",
    );
  });

  it("keeps models, data, and icons within the Pages project path", () => {
    vi.stubEnv("BASE_URL", "/ptype/");
    expect(publicAssetUrl("/assets/models/ships/player-ship.glb")).toBe(
      "/ptype/assets/models/ships/player-ship.glb",
    );
    expect(publicAssetUrl("data/trivia.yaml")).toBe("/ptype/data/trivia.yaml");
    expect(publicAssetUrl("//assets/icons/star.svg")).toBe(
      "/ptype/assets/icons/star.svg",
    );
  });
});
