import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameMode, ProgrammingLanguage } from "../../src/types";
import { WordDictionary } from "../../src/utils/wordDictionary";

const COMPLETE_DICTIONARY = `
beginner:
  - alpha
  - beta
intermediate:
  - gamma
advanced:
  - delta
boss_words:
  beginner:
    - boss-one
  intermediate:
    - boss-two
  advanced:
    - boss-three
`;

describe("word dictionary", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(new Response(COMPLETE_DICTIONARY, { status: 200 })),
      ),
    );
  });

  it("loads, parses, and caches dictionary data", async () => {
    const dictionary = new WordDictionary();
    const first = await dictionary.loadDictionary("sample");
    const second = await dictionary.loadDictionary("sample");

    expect(first.keywords.beginner).toEqual(["alpha", "beta"]);
    expect(first.boss_words.advanced).toEqual(["boss-three"]);
    expect(second).toBe(first);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("cycles through a shuffled pool before refilling", async () => {
    const dictionary = new WordDictionary();
    await dictionary.loadDictionary("sample");
    vi.spyOn(Math, "random").mockReturnValue(0);

    const words = [
      dictionary.getWord("sample", 1),
      dictionary.getWord("sample", 1),
    ];
    expect(new Set(words)).toEqual(new Set(["alpha", "beta"]));
    expect(dictionary.getWord("sample", 1)).toBeTruthy();
    expect(dictionary.getWord("sample", 1, true)).toBe("boss-one");
  });

  it("reports missing and empty dictionaries", async () => {
    const dictionary = new WordDictionary();
    expect(() => dictionary.getWord("missing", 1)).toThrow(
      "Dictionary for missing not loaded",
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(
            "beginner: []\nintermediate: []\nadvanced: []\nboss_words:\n  beginner: []\n  intermediate: []\n  advanced: []",
            {
              status: 200,
            },
          ),
        ),
      ),
    );
    await dictionary.loadDictionary("empty");
    expect(() => dictionary.getWord("empty", 1)).toThrow(
      "No words available in empty-regular-beginner",
    );
  });

  it("surfaces network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response("", { status: 404, statusText: "Missing" }),
        ),
      ),
    );
    const dictionary = new WordDictionary();
    await expect(dictionary.loadDictionary("absent")).rejects.toThrow(
      "Failed to load absent dictionary: Missing",
    );
  });

  it("selects the correct dictionary for each game mode", () => {
    const dictionary = new WordDictionary();
    expect(dictionary.getLanguageKey(GameMode.NORMAL)).toBe("normal");
    expect(
      dictionary.getLanguageKey(
        GameMode.PROGRAMMING,
        ProgrammingLanguage.CSHARP,
      ),
    ).toBe("csharp");
    expect(dictionary.getLanguageKey(GameMode.PROGRAMMING)).toBe("normal");
  });
});
