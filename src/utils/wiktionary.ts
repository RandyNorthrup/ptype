import { version } from "../../package.json";
import { type WordSource } from "./wordPools";

export interface WiktionaryLanguage {
  code: string;
  name: string;
  scripts: string[];
  categoryId: number;
  entryCount: number;
}

const API = "https://en.wiktionary.org/w/api.php";
const API_POLICY = {
  batchSize: 500,
  directoryPages: 40,
  wordPages: 8,
  timeoutMs: 15_000,
  maximumResponseCharacters: 4_000_000,
  cacheMs: 604_800_000,
  maximumRetryMs: 60_000,
  defaultRetryMs: 5000,
  throttledStatus: 429,
  unavailableStatus: 503,
  millisecondsPerSecond: 1000,
  categoryNamespace: 14,
  maximumCachedLanguages: 8,
} as const;
const LANGUAGE_EXPORT =
  "{{#invoke:JSON data|export_languages||1|4|wikimedia_codes}}";
type ApiRecord = Record<string, unknown>;

function record(value: unknown): ApiRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("Invalid Wiktionary response");
  return value as ApiRecord;
}
function list(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("Invalid Wiktionary page list");
  return value;
}
function positiveInteger(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0)
    throw new Error("Invalid Wiktionary page identity");
  return value;
}
function string(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error("Invalid Wiktionary text");
  return value;
}
function continuation(data: ApiRecord, key: string): string | undefined {
  if (data["continue"] === undefined) return undefined;
  return string(record(data["continue"])[key]);
}
function abortIfNeeded(signal?: AbortSignal): void {
  if (signal?.aborted)
    throw new DOMException("Wiktionary request aborted", "AbortError");
}

function parseCategory(
  raw: unknown,
  byName: Map<string, { code: string; scripts: string[] }>,
): WiktionaryLanguage | undefined {
  const entry = record(raw);
  if (entry["ns"] !== API_POLICY.categoryNamespace)
    throw new Error("Invalid Wiktionary category namespace");
  const title = string(entry["title"]);
  if (!title.startsWith("Category:") || !title.endsWith(" lemmas")) return;
  const name = title.slice("Category:".length, -" lemmas".length);
  const language = byName.get(name);
  if (!language) return;
  const count = record(entry["categoryinfo"])["pages"];
  if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0)
    throw new Error("Invalid Wiktionary entry count");
  if (count === 0) return;
  return {
    ...language,
    name,
    categoryId: positiveInteger(entry["pageid"]),
    entryCount: count,
  };
}

function parseEntry(raw: unknown): WordSource | undefined {
  const entry = record(raw);
  if (entry["ns"] !== 0) throw new Error("Invalid Wiktionary word namespace");
  const pageId = positiveInteger(entry["pageid"]);
  const title = string(entry["title"]);
  if (title.startsWith("Unsupported titles/")) return;
  return {
    title,
    pageId,
    url: `https://en.wiktionary.org/?curid=${String(pageId)}`,
  };
}

/**
Fixed anonymous provider; requests are serial and public data is cached in memory.
*/
export class WiktionarySource {
  private queue: Promise<unknown> = Promise.resolve();
  private retryAt = 0;
  private languages: { at: number; value: WiktionaryLanguage[] } | undefined;
  private entries = new Map<string, { at: number; value: WordSource[] }>();

  private async request(
    parameters: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<ApiRecord> {
    const preceding = this.queue;
    const request = this.sendRequest(parameters, preceding, signal);
    this.queue = request;
    return await request;
  }

  private async sendRequest(
    parameters: Record<string, string>,
    preceding: Promise<unknown>,
    signal?: AbortSignal,
  ): Promise<ApiRecord> {
    // The barrier observes completion, including a prior caller's reported failure.
    // This request still propagates its own failures to its caller.
    await Promise.allSettled([preceding]);
    abortIfNeeded(signal);
    if (Date.now() < this.retryAt)
      throw new Error("Wiktionary is temporarily throttled; retry later");
    const url = new URL(API);
    url.search = new URLSearchParams({
      ...parameters,
      format: "json",
      formatversion: "2",
      origin: "*",
      maxlag: "5",
      maxage: String(API_POLICY.cacheMs / API_POLICY.millisecondsPerSecond),
      smaxage: String(API_POLICY.cacheMs / API_POLICY.millisecondsPerSecond),
    }).toString();
    const timeout = AbortSignal.timeout(API_POLICY.timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const response = await fetch(url, {
      credentials: "omit",
      signal: combined,
      headers: {
        "Api-User-Agent": `PType/${version} (https://github.com/RandyNorthrup/ptype)`,
      },
    });
    if (!response.ok) {
      const seconds = Number(response.headers.get("Retry-After"));
      if (
        response.status === API_POLICY.throttledStatus ||
        response.status === API_POLICY.unavailableStatus
      )
        this.retryAt = Date.now() + API_POLICY.defaultRetryMs;
      if (Number.isFinite(seconds) && seconds > 0) {
        this.retryAt =
          Date.now() +
          Math.min(
            seconds * API_POLICY.millisecondsPerSecond,
            API_POLICY.maximumRetryMs,
          );
      }
      throw new Error(`Wiktionary HTTP ${String(response.status)}`);
    }
    const body = await response.text();
    if (body.length > API_POLICY.maximumResponseCharacters)
      throw new Error("Wiktionary response is too large");
    const data = record(JSON.parse(body));
    if (data["error"] !== undefined)
      throw new Error(
        `Wiktionary API ${string(record(data["error"])["code"])}`,
      );
    abortIfNeeded(signal);
    return data;
  }

  async getLanguages(signal?: AbortSignal): Promise<WiktionaryLanguage[]> {
    abortIfNeeded(signal);
    if (this.languages && Date.now() - this.languages.at < API_POLICY.cacheMs)
      return this.languages.value;
    const exported = await this.request(
      { action: "expandtemplates", text: LANGUAGE_EXPORT, prop: "wikitext" },
      signal,
    );
    const expansion = record(exported["expandtemplates"]);
    const metadataText = string(expansion["wikitext"]);
    const metadata = record(JSON.parse(metadataText));
    const byName = new Map<string, { code: string; scripts: string[] }>();
    for (const [code, raw] of Object.entries(metadata)) {
      if (!/^[a-z]{2,3}(?:-[a-z0-9]+)*$/u.test(code))
        throw new Error("Invalid Wiktionary language code");
      const detail = record(raw);
      const name = string(detail["1"]);
      if (byName.has(name))
        throw new Error("Ambiguous Wiktionary language identity");
      const scripts =
        detail["4"] === undefined ? [] : string(detail["4"]).split(",");
      byName.set(name, { code, scripts });
    }
    if (byName.size === 0)
      throw new Error("Empty Wiktionary language catalogue");
    const languages = new Map<string, WiktionaryLanguage>();
    const seen = new Set<string>();
    let token: string | undefined;
    for (let page = 0; page < API_POLICY.directoryPages; page++) {
      const data = await this.request(
        {
          action: "query",
          generator: "categorymembers",
          gcmtitle: "Category:Lemmas by language",
          gcmtype: "subcat",
          gcmlimit: String(API_POLICY.batchSize),
          prop: "categoryinfo",
          ...(token && { gcmcontinue: token }),
        },
        signal,
      );
      const pages = list(record(data["query"])["pages"]);
      for (const raw of pages) {
        const language = parseCategory(raw, byName);
        if (language) languages.set(language.code, language);
      }
      token = continuation(data, "gcmcontinue");
      if (!token) {
        if (languages.size === 0)
          throw new Error("No Wiktionary languages with entries");
        const result: WiktionaryLanguage[] = [];
        languages.forEach((language) => {
          result.push(language);
        });
        result.sort((first, second) => first.name.localeCompare(second.name));
        this.languages = { at: Date.now(), value: result };
        return result;
      }
      if (seen.has(token)) throw new Error("Wiktionary continuation loop");
      seen.add(token);
    }
    throw new Error(
      "Wiktionary language catalogue exceeded its request budget",
    );
  }

  async getEntries(code: string, signal?: AbortSignal): Promise<WordSource[]> {
    abortIfNeeded(signal);
    const cached = this.entries.get(code);
    if (cached && Date.now() - cached.at < API_POLICY.cacheMs)
      return cached.value;
    const catalogue = await this.getLanguages(signal);
    const language = catalogue.find((candidate) => candidate.code === code);
    if (!language)
      throw new Error("Unknown or unavailable Wiktionary language");
    const entries = new Map<number, WordSource>();
    const seen = new Set<string>();
    let token: string | undefined;
    for (let page = 0; page < API_POLICY.wordPages; page++) {
      const data = await this.request(
        {
          action: "query",
          list: "categorymembers",
          cmpageid: String(language.categoryId),
          cmnamespace: "0",
          cmtype: "page",
          cmlimit: String(API_POLICY.batchSize),
          ...(token && { cmcontinue: token }),
        },
        signal,
      );
      const members = list(record(data["query"])["categorymembers"]);
      for (const raw of members) {
        const entry = parseEntry(raw);
        if (entry) entries.set(entry.pageId, entry);
      }
      token = continuation(data, "cmcontinue");
      if (!token) break;
      if (seen.has(token)) throw new Error("Wiktionary continuation loop");
      seen.add(token);
    }
    if (entries.size === 0)
      throw new Error("No Wiktionary entries for this language");
    const result: WordSource[] = [];
    entries.forEach((entry) => {
      result.push(entry);
    });
    if (
      !this.entries.has(code) &&
      this.entries.size >= API_POLICY.maximumCachedLanguages
    ) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(code, { at: Date.now(), value: result });
    return result;
  }
}
