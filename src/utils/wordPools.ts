import {
  getGraphemes,
  getTextLength,
  isWordCandidate,
  isTextMatch,
} from "./text";

export type WordTier = "beginner" | "intermediate" | "advanced";
export interface WordData {
  keywords: Record<WordTier, string[]>;
  boss_words: Record<WordTier, string[]>;
}
export interface WordSource {
  title: string;
  pageId: number;
  url: string;
}
export interface PreparedWordData {
  data: WordData;
  sources: Map<string, WordSource[]>;
  generated: Set<string>;
}

const WORD_LEVELS = { beginnerMaximum: 30, intermediateMaximum: 70 } as const;
const POOL_LIMITS = {
  beginnerQuantile: 0.34,
  intermediateQuantile: 0.67,
  maximumTargetGraphemes: 80,
  maximumSequenceWords: 32,
  generatedVariants: 32,
} as const;

export function getWordTier(level: number): WordTier {
  if (level <= WORD_LEVELS.beginnerMaximum) return "beginner";
  if (level <= WORD_LEVELS.intermediateMaximum) return "intermediate";
  return "advanced";
}

function makeSequence(
  entries: WordSource[],
  offset: number,
  minimumLength: number,
): WordSource[] | undefined {
  const parts: WordSource[] = [];
  let length = 0;
  for (let index = 0; index < POOL_LIMITS.maximumSequenceWords; index++) {
    const entry = entries[(offset + index) % entries.length];
    if (!entry) return;
    const nextLength =
      length + getTextLength(entry.title) + (parts.length > 0 ? 1 : 0);
    if (nextLength > POOL_LIMITS.maximumTargetGraphemes) return;
    parts.push(entry);
    length = nextLength;
    if (parts.length > 1 && length >= minimumLength) return parts;
  }
  return;
}

function makeSequences(
  entries: WordSource[],
  minimumLength: number,
): WordSource[][] {
  const result: WordSource[][] = [];
  const variants = Math.min(entries.length, POOL_LIMITS.generatedVariants);
  for (let offset = 0; offset < variants; offset++) {
    const sequence = makeSequence(entries, offset, minimumLength);
    if (sequence) result.push(sequence);
  }
  return result;
}

/**
 * Language-relative grapheme cost is typing complexity, not a CEFR/proficiency rating.
 * Generated practice sequences retain every real headword's attribution.
 */
export function prepareWordPools(
  entries: WordSource[],
  language: string,
  canRenderText: (text: string) => boolean,
): PreparedWordData {
  const usable: WordSource[] = [];
  for (const entry of entries) {
    const title = entry.title.normalize("NFC");
    if (
      !isWordCandidate(title) ||
      !canRenderText(title) ||
      usable.some((previous) => isTextMatch(previous.title, title, language))
    )
      continue;
    usable.push({ ...entry, title });
  }
  usable.sort(
    (first, second) => getTextLength(first.title) - getTextLength(second.title),
  );
  if (usable.length === 0)
    throw new Error("No playable words with supported characters");
  const beginnerBoundary =
    usable[Math.floor((usable.length - 1) * POOL_LIMITS.beginnerQuantile)];
  const intermediateBoundary =
    usable[Math.floor((usable.length - 1) * POOL_LIMITS.intermediateQuantile)];
  if (!beginnerBoundary || !intermediateBoundary)
    throw new Error("Invalid word pool boundaries");
  const beginnerMaximum = getTextLength(beginnerBoundary.title);
  const intermediateMaximum = Math.max(
    beginnerMaximum + 1,
    getTextLength(intermediateBoundary.title),
  );
  const groups: Record<WordTier, WordSource[][]> = {
    beginner: [],
    intermediate: [],
    advanced: [],
  };
  for (const entry of usable) {
    const length = getTextLength(entry.title);
    let tier: WordTier = "advanced";
    if (length <= beginnerMaximum) tier = "beginner";
    else if (length <= intermediateMaximum) tier = "intermediate";
    groups[tier].push([entry]);
  }
  if (groups.intermediate.length === 0)
    groups.intermediate = makeSequences(usable, beginnerMaximum + 1);
  const intermediateCost = Math.max(
    intermediateMaximum,
    ...groups.intermediate.map((parts) =>
      getTextLength(parts.map((part) => part.title).join(" ")),
    ),
  );
  if (groups.advanced.length === 0)
    groups.advanced = makeSequences(usable, intermediateCost + 1);
  const output: PreparedWordData = {
    data: {
      keywords: { beginner: [], intermediate: [], advanced: [] },
      boss_words: { beginner: [], intermediate: [], advanced: [] },
    },
    sources: new Map(),
    generated: new Set(),
  };
  const add = (parts: WordSource[], pool: string[]) => {
    const text = parts.map((part) => part.title).join(" ");
    if (
      !canRenderText(text) ||
      getGraphemes(text).length > POOL_LIMITS.maximumTargetGraphemes
    )
      return;
    if (!pool.includes(text)) pool.push(text);
    output.sources.set(text, parts);
    if (parts.length > 1) output.generated.add(text);
  };
  const tiers = ["beginner", "intermediate", "advanced"] as const;
  for (const tier of tiers) {
    const candidates = groups[tier];
    for (const parts of candidates) add(parts, output.data.keywords[tier]);
    const regular = output.data.keywords[tier];
    const minimumCost = Math.min(...regular.map((word) => getTextLength(word)));
    const sequences = makeSequences(usable, minimumCost + 1);
    for (const parts of sequences) add(parts, output.data.boss_words[tier]);
    if (regular.length === 0 || output.data.boss_words[tier].length === 0) {
      throw new Error(`No playable ${tier} pool with supported characters`);
    }
  }
  return output;
}
