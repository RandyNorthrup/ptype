import { describe, expect, it } from "vitest";
import {
  getGraphemes,
  getTextLength,
  getTextLocale,
  isWordCandidate,
  isTextMatch,
} from "../../src/utils/text";

describe("Unicode text", () => {
  it("normalizes accents and counts complete graphemes rather than UTF-16 units", () => {
    expect(getGraphemes("e\u{301}𐌀🧑🏽‍🚀")).toEqual(["é", "𐌀", "🧑🏽‍🚀"]);
    expect(getTextLength("你好")).toBe(2);
    expect(getTextLength("e\u{301}𐌀🧑🏽‍🚀")).toBe(3);
    expect(getGraphemes("क्ष")).toEqual(["क्ष"]);
  });
  it("keeps accents meaningful and compares case with the selected locale", () => {
    expect(isTextMatch("CAFÉ", "cafe\u{301}", "fr")).toBe(true);
    expect(isTextMatch("café", "cafe", "fr")).toBe(false);
    expect(isTextMatch("I", "ı", "tr")).toBe(true);
    expect(isTextMatch("I", "i", "tr")).toBe(false);
    expect(isTextMatch("Σ", "ς", "el")).toBe(true);
    expect(isTextMatch("a-b", "ab")).toBe(false);
  });
  it("handles unknown locale tags without mislabelling the word language", () => {
    expect(getTextLocale("not_a_locale")).toBe("und");
    expect(getTextLocale("fr-CA")).toBe("fr-CA");
    expect(isTextMatch("ABC", "abc", "not_a_locale")).toBe(true);
    for (let index = 0; index < 80; index++)
      isTextMatch(
        "a",
        "A",
        `q${String.fromCodePoint(97 + Math.floor(index / 26), 97 + (index % 26))}`,
      );
    expect(isTextMatch("a", "A", "en")).toBe(true);
  });
  it.each(["café", "مرحبا", "你好", "क्ष", "𐌀", "mother-in-law", "l’été"])(
    "accepts printable native titles %s",
    (word) => {
      expect(isWordCandidate(word)).toBe(true);
    },
  );
  it.each([
    "",
    " ",
    " word",
    "word ",
    "!",
    "$100 hamburger",
    "a\nword",
    "word\u{202E}",
    "x\u{D800}",
    "a".repeat(25),
    "<script>",
  ])("rejects non-playable title %s", (word) => {
    expect(isWordCandidate(word)).toBe(false);
  });
});
