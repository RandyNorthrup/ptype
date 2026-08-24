import { describe, expect, it } from "vitest";
import {
  getTargetWPM,
  getWPMColor,
  isBossLevel,
  ProgrammingLanguage,
  LANGUAGE_FILE_MAP,
} from "../../src/types";

describe("game type helpers", () => {
  it("identifies every third positive level as a boss level", () => {
    expect(isBossLevel(0)).toBe(false);
    expect(isBossLevel(1)).toBe(false);
    expect(isBossLevel(3)).toBe(true);
    expect(isBossLevel(99)).toBe(true);
  });

  it("scales target speed across the complete level range", () => {
    expect(getTargetWPM(1)).toBe(20);
    expect(getTargetWPM(100)).toBe(400);
    expect(getTargetWPM(50)).toBeCloseTo(208.08, 2);
  });

  it("maps speed bands to readable status colors", () => {
    expect(getWPMColor(50)).toBe("#39ff14");
    expect(getWPMColor(100)).toBe("#00ffff");
    expect(getWPMColor(150)).toBe("#ffeb3b");
    expect(getWPMColor(200)).toBe("#ff9800");
    expect(getWPMColor(250)).toBe("#ff1493");
    expect(getWPMColor(251)).toBe("#ff4444");
  });

  it("maps every programming language to its data file", () => {
    for (const language of Object.values(ProgrammingLanguage)) {
      expect(LANGUAGE_FILE_MAP[language]).toBeTruthy();
    }
    expect(LANGUAGE_FILE_MAP[ProgrammingLanguage.CSHARP]).toBe("csharp");
    expect(LANGUAGE_FILE_MAP[ProgrammingLanguage.CPLUSPLUS]).toBe("cplusplus");
  });
});
