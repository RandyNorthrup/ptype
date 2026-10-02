import { afterEach, describe, expect, it, vi } from "vitest";
import { WiktionarySource } from "../../src/utils/wiktionary";

const LANGUAGE_METADATA = {
  en: { "1": "English", "4": "Latn" },
  fr: { "1": "French", "4": "Latn" },
  ja: { "1": "Japanese", "4": "Jpan" },
  xyz: { "1": "Empty" },
};
function metadata(value: unknown = LANGUAGE_METADATA): unknown {
  return { expandtemplates: { wikitext: JSON.stringify(value) } };
}
function category(title: string, pageid: number, pages = 5, ns = 14): unknown {
  return { title, pageid, ns, categoryinfo: { pages } };
}
function categories(pages: unknown[], token?: string): unknown {
  return {
    query: { pages },
    ...(token && { continue: { gcmcontinue: token } }),
  };
}
function words(title = "cat", pageid = 10, token?: string, ns = 0): unknown {
  return {
    query: { categorymembers: [{ title, pageid, ns }] },
    ...(token && { continue: { cmcontinue: token } }),
  };
}
function responses(values: unknown[]) {
  const mock = vi.fn<typeof fetch>();
  for (const value of values) mock.mockResolvedValueOnce(Response.json(value));
  vi.stubGlobal("fetch", mock);
  return mock;
}
function requestUrl(input: RequestInfo | URL | undefined): URL {
  if (input instanceof URL) return input;
  if (typeof input === "string") return new URL(input);
  if (input instanceof Request) return new URL(input.url);
  throw new Error("Missing expected provider request");
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Wiktionary provider", () => {
  it("completes category pagination, validates language identity, and caches public data", async () => {
    const mock = responses([
      metadata(),
      categories(
        [
          category("Category:English lemmas", 1),
          category("Category:Lemmas subcategories by language", 3),
          category("Category:Empty lemmas", 4, 0),
        ],
        "next",
      ),
      categories([category("Category:French lemmas", 2)]),
      words("cat", 10, "more"),
      words("dog", 11),
    ]);
    const provider = new WiktionarySource();
    expect(await provider.getLanguages()).toEqual([
      {
        code: "en",
        name: "English",
        scripts: ["Latn"],
        categoryId: 1,
        entryCount: 5,
      },
      {
        code: "fr",
        name: "French",
        scripts: ["Latn"],
        categoryId: 2,
        entryCount: 5,
      },
    ]);
    expect(await provider.getEntries("en")).toEqual([
      { title: "cat", pageId: 10, url: "https://en.wiktionary.org/?curid=10" },
      { title: "dog", pageId: 11, url: "https://en.wiktionary.org/?curid=11" },
    ]);
    await provider.getEntries("en");
    await provider.getLanguages();
    expect(mock).toHaveBeenCalledTimes(5);
    for (const [url, init] of mock.mock.calls) {
      expect(requestUrl(url).href).toMatch(
        /^https:\/\/en\.wiktionary\.org\/w\/api\.php\?/u,
      );
      const parameters = requestUrl(url).searchParams;
      expect(parameters.get("origin")).toBe("*");
      expect(parameters.get("formatversion")).toBe("2");
      expect(init?.credentials).toBe("omit");
      expect(init?.headers).toHaveProperty("Api-User-Agent");
    }
    expect(
      requestUrl(mock.mock.calls[2]?.[0]).searchParams.get("gcmcontinue"),
    ).toBe("next");
    expect(
      requestUrl(mock.mock.calls[4]?.[0]).searchParams.get("cmcontinue"),
    ).toBe("more");
  });
  it("serializes requests and does not poison the queue after a rejected request", async () => {
    const pending = Promise.withResolvers<Response>();
    const mock = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(() => pending.promise);
    const directory = categories([category("Category:English lemmas", 1)]);
    mock
      .mockResolvedValueOnce(Response.json(metadata()))
      .mockResolvedValueOnce(Response.json(directory));
    vi.stubGlobal("fetch", mock);
    const provider = new WiktionarySource();
    const first = provider.getLanguages();
    const rejected = expect(first).rejects.toThrow("HTTP 500");
    const second = provider.getLanguages();
    await vi.waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1);
    });
    pending.resolve(new Response("", { status: 500 }));
    await rejected;
    const result = await second;
    expect(result[0]?.code).toBe("en");
  });
  it.each([
    [null, "Invalid Wiktionary response"],
    [{ expandtemplates: { wikitext: "[]" } }, "Invalid Wiktionary response"],
    [metadata({}), "Empty Wiktionary language catalogue"],
    [metadata({ "../bad": { "1": "Bad" } }), "language code"],
    [
      metadata({ en: { "1": "English" }, eng: { "1": "English" } }),
      "Ambiguous",
    ],
    [{ error: { code: "maxlag" } }, "API maxlag"],
  ])(
    "rejects invalid provider metadata without fallback",
    async (payload, diagnostic) => {
      responses([payload]);
      await expect(new WiktionarySource().getLanguages()).rejects.toThrow(
        diagnostic,
      );
    },
  );
  it.each([
    [categories([category("Category:English lemmas", 1, 1, 0)]), "namespace"],
    [categories([category("Category:English lemmas", 0)]), "identity"],
    [categories([category("Category:English lemmas", 1, -1)]), "entry count"],
    [categories([]), "No Wiktionary languages"],
    [{ query: { pages: null } }, "page list"],
  ])("rejects malformed/empty directory pages", async (payload, diagnostic) => {
    responses([metadata(), payload]);
    await expect(new WiktionarySource().getLanguages()).rejects.toThrow(
      diagnostic,
    );
  });
  it("detects loops and refuses a truncated language catalogue", async () => {
    responses([
      metadata(),
      categories([category("Category:English lemmas", 1)], "same"),
      categories([], "same"),
    ]);
    await expect(new WiktionarySource().getLanguages()).rejects.toThrow(
      "continuation loop",
    );
    responses([
      metadata(),
      ...Array.from({ length: 40 }, (_, index) =>
        categories([], `page${String(index)}`),
      ),
    ]);
    await expect(new WiktionarySource().getLanguages()).rejects.toThrow(
      "request budget",
    );
  });
  it("rejects unrecognized languages and wrong word namespaces and skips unsupported-title representations", async () => {
    responses([
      metadata(),
      categories([category("Category:English lemmas", 1)]),
    ]);
    await expect(new WiktionarySource().getEntries("fr")).rejects.toThrow(
      "unavailable",
    );
    responses([
      metadata(),
      categories([category("Category:English lemmas", 1)]),
      words("wrong", 10, undefined, 14),
    ]);
    await expect(new WiktionarySource().getEntries("en")).rejects.toThrow(
      "word namespace",
    );
    responses([
      metadata(),
      categories([category("Category:English lemmas", 1)]),
      words("Unsupported titles/Space"),
    ]);
    await expect(new WiktionarySource().getEntries("en")).rejects.toThrow(
      "No Wiktionary entries",
    );
  });
  it("detects entry loops and bounds deliberate corpus sampling", async () => {
    responses([
      metadata(),
      categories([category("Category:English lemmas", 1)]),
      words("a", 10, "same"),
      words("b", 11, "same"),
    ]);
    await expect(new WiktionarySource().getEntries("en")).rejects.toThrow(
      "continuation loop",
    );
    const mock = responses([
      metadata(),
      categories([category("Category:English lemmas", 1)]),
      ...Array.from({ length: 8 }, (_, index) =>
        words(`word${String(index)}`, index + 10, `page${String(index)}`),
      ),
    ]);
    expect(await new WiktionarySource().getEntries("en")).toHaveLength(8);
    expect(mock).toHaveBeenCalledTimes(10);
  });
  it("honors abort before cached or queued work and does not cache an aborted response", async () => {
    const controller = new AbortController();
    controller.abort();
    responses([]);
    const provider = new WiktionarySource();
    await expect(
      provider.getLanguages(controller.signal),
    ).rejects.toHaveProperty("name", "AbortError");
    await expect(
      provider.getEntries("en", controller.signal),
    ).rejects.toHaveProperty("name", "AbortError");
    expect(fetch).not.toHaveBeenCalled();
    const active = new AbortController();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        active.abort();
        return Promise.resolve(Response.json(metadata()));
      }),
    );
    await expect(provider.getLanguages(active.signal)).rejects.toHaveProperty(
      "name",
      "AbortError",
    );
  });
  it("honors Retry-After and permits a later retry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const mock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response("", { status: 429, headers: { "Retry-After": "2" } }),
      );
    vi.stubGlobal("fetch", mock);
    const provider = new WiktionarySource();
    await expect(provider.getLanguages()).rejects.toThrow("HTTP 429");
    await expect(provider.getLanguages()).rejects.toThrow("throttled");
    expect(mock).toHaveBeenCalledOnce();
    vi.setSystemTime(3001);
    const directory = categories([category("Category:English lemmas", 1)]);
    mock
      .mockResolvedValueOnce(Response.json(metadata()))
      .mockResolvedValueOnce(Response.json(directory));
    expect(await provider.getLanguages()).toHaveLength(1);
  });
  it("expires the public cache and rejects an oversized response", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const mock = responses([
      metadata(),
      categories([category("Category:English lemmas", 1)]),
      metadata(),
      categories([category("Category:French lemmas", 2)]),
    ]);
    const provider = new WiktionarySource();
    await provider.getLanguages();
    vi.setSystemTime(604_802_000);
    const fresh = await provider.getLanguages();
    expect(fresh[0]?.code).toBe("fr");
    expect(mock).toHaveBeenCalledTimes(4);
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(" ".repeat(4_000_001)))),
    );
    await expect(new WiktionarySource().getLanguages()).rejects.toThrow(
      "too large",
    );
  });
});
