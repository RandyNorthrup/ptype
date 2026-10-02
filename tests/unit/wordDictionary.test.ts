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
    expect(() => dictionary.getLanguageKey(GameMode.WIKTIONARY)).toThrow(
      "selected word language",
    );
    expect(
      dictionary.getLanguageKey(GameMode.WIKTIONARY, undefined, "fr"),
    ).toBe("wiktionary:fr");
  });

  it("integrates real provider-shaped data with glyph-gated pools and attribution", async () => {
    const languages = ["en", "fr", "de", "es", "it", "ar", "ja", "ko", "zh"];
    const definitions = Object.fromEntries(
      languages.map((code) => [code, { "1": code, "4": "Latn" }]),
    );
    const categories = languages.map((code, index) => ({
      ns: 14,
      title: `Category:${code} lemmas`,
      pageid: index + 1,
      categoryinfo: { pages: 3 },
    }));
    const entries = ["a", "bb", "ccc"].map((title, index) => ({
      title,
      ns: 0,
      pageid: index + 20,
    }));
    const mock = vi.fn<typeof fetch>((input) => {
      if (!(input instanceof URL))
        throw new Error("Provider did not use a structured fixed URL");
      const parameters = input.searchParams;
      let payload: unknown;
      if (parameters.get("action") === "expandtemplates")
        payload = {
          expandtemplates: { wikitext: JSON.stringify(definitions) },
        };
      else if (parameters.get("generator") === "categorymembers")
        payload = { query: { pages: categories } };
      else payload = { query: { categorymembers: entries } };
      return Promise.resolve(Response.json(payload));
    });
    vi.stubGlobal("fetch", mock);
    const dictionary = new WordDictionary();
    expect(await dictionary.getWiktionaryLanguages()).toHaveLength(9);
    await dictionary.loadWiktionary("en", () => true);
    expect(dictionary.getWord("wiktionary:en", 1)).toBe("a");
    expect(dictionary.getWord("wiktionary:en", 31)).toBe("bb");
    expect(dictionary.getWord("wiktionary:en", 71)).toBe("ccc");
    expect(dictionary.getWordSources("wiktionary:en", "a")).toEqual([
      { title: "a", pageId: 20, url: "https://en.wiktionary.org/?curid=20" },
    ]);
    expect(dictionary.isGeneratedPractice("wiktionary:en", "a bb")).toBe(true);
    expect(dictionary.isGeneratedPractice("normal", "none")).toBe(false);
    expect(dictionary.getWordSources("normal", "none")).toEqual([]);
    expect(dictionary.getWordSources("wiktionary:en", "absent")).toEqual([]);
    await dictionary.loadWiktionary("en", (text) => !/[ac]/u.test(text));
    expect(dictionary.getWord("wiktionary:en", 1)).toBe("bb");
    expect(dictionary.getWordSources("wiktionary:en", "a")).toEqual([]);
    await expect(dictionary.loadWiktionary("fr", () => false)).rejects.toThrow(
      "supported characters",
    );
    expect(() => dictionary.getWord("wiktionary:fr", 1)).toThrow("not loaded");
    for (const code of languages.slice(1))
      await dictionary.loadWiktionary(code, () => true);
    expect(() => dictionary.getWord("wiktionary:en", 1)).toThrow("not loaded");
    expect(dictionary.getWord("wiktionary:zh", 1)).toBe("a");
    const controller = new AbortController();
    controller.abort();
    await expect(
      dictionary.loadWiktionary("zh", () => true, controller.signal),
    ).rejects.toHaveProperty("name", "AbortError");
  });
});
