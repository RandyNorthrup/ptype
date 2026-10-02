import { describe, expect, it } from "vitest";
import {
  getWordTier,
  prepareWordPools,
  type WordSource,
} from "../../src/utils/wordPools";
import { getTextLength } from "../../src/utils/text";

function entry(title: string, pageId = 1): WordSource {
  return {
    title,
    pageId,
    url: `https://en.wiktionary.org/?curid=${String(pageId)}`,
  };
}
describe("word pool preparation", () => {
  it("retains exact existing level boundaries for regular and boss selection", () => {
    expect([1, 30, 31, 70, 71, 100].map((level) => getWordTier(level))).toEqual(
      [
        "beginner",
        "beginner",
        "intermediate",
        "intermediate",
        "advanced",
        "advanced",
      ],
    );
  });
  it("uses language-relative grapheme cost and retains source attribution", () => {
    const prepared = prepareWordPools(
      [
        entry("a"),
        entry("ab", 2),
        entry("abc", 3),
        entry("abcd", 4),
        entry("abcde", 5),
        entry("abcdef", 6),
      ],
      "en",
      () => true,
    );
    expect(prepared.data.keywords.beginner).toEqual(["a", "ab"]);
    expect(prepared.data.keywords.intermediate).toEqual(["abc", "abcd"]);
    expect(prepared.data.keywords.advanced).toEqual(["abcde", "abcdef"]);
    expect(prepared.sources.get("ab")).toEqual([entry("ab", 2)]);
    expect(prepared.data.boss_words.beginner).toContain("a ab");
    expect(prepared.sources.get("a ab")).toEqual([entry("a"), entry("ab", 2)]);
    expect(prepared.generated.has("a ab")).toBe(true);
    expect(prepared.generated.has("ab")).toBe(false);
  });
  it("supports small genuine corpora with explicitly generated progressive practice", () => {
    const prepared = prepareWordPools([entry("你")], "zh", () => true);
    expect(prepared.data.keywords.beginner).toEqual(["你"]);
    expect(prepared.data.keywords.intermediate).toEqual(["你 你"]);
    expect(prepared.data.keywords.advanced).toEqual(["你 你 你"]);
    expect(prepared.sources.get("你 你 你")).toEqual([
      entry("你"),
      entry("你"),
      entry("你"),
    ]);
    for (const pool of Object.values(prepared.data.boss_words))
      expect(pool.length).toBeGreaterThan(0);
  });
  it("filters unavailable glyphs, unsafe titles, and case/normalization duplicates", () => {
    const prepared = prepareWordPools(
      [
        entry("e\u{301}"),
        entry("É", 2),
        entry("你", 3),
        entry("<script>", 4),
        entry("!!!", 5),
      ],
      "fr",
      (value) => !value.includes("你"),
    );
    expect(prepared.data.keywords.beginner).toEqual(["é"]);
    expect(prepared.sources.get("é")?.[0]?.pageId).toBe(1);
    expect(() => prepareWordPools([entry("你")], "zh", () => false)).toThrow(
      "supported characters",
    );
    expect(() => prepareWordPools([], "en", () => true)).toThrow(
      "No playable words",
    );
  });
  it("rejects generated targets when the available character set cannot type their separator", () => {
    expect(() =>
      prepareWordPools([entry("a")], "en", (text) => !text.includes(" ")),
    ).toThrow("pool with supported characters");
  });
  it("bounds target size while preserving complete usable tiers", () => {
    const prepared = prepareWordPools(
      [entry("a".repeat(16))],
      "en",
      () => true,
    );
    expect(prepared.data.keywords.advanced[0]).toBe(
      `${"a".repeat(16)} ${"a".repeat(16)} ${"a".repeat(16)}`,
    );
    for (const pool of [
      ...Object.values(prepared.data.keywords),
      ...Object.values(prepared.data.boss_words),
    ]) {
      expect(pool.length).toBeGreaterThan(0);
      expect(pool.every((word) => getTextLength(word) <= 80)).toBe(true);
    }
    expect(() =>
      prepareWordPools([entry("a".repeat(24))], "en", () => true),
    ).toThrow("advanced pool");
  });
});
