/**
Unicode text semantics shared by dictionary preparation and gameplay.
*/
const graphemeSegmenter = new Intl.Segmenter(undefined, {
  granularity: "grapheme",
});
const comparisonCache = new Map<string, Intl.Collator>();
const TEXT_LIMITS = { comparisonLocales: 64, entryGraphemes: 24 } as const;

export function getTextLocale(language: string): string {
  try {
    return new Intl.Locale(language).baseName;
  } catch {
    return "und";
  }
}

export function getGraphemes(text: string): string[] {
  return Array.from(
    graphemeSegmenter.segment(text.normalize("NFC")),
    ({ segment }) => segment,
  );
}

export function getTextLength(text: string): number {
  return getGraphemes(text).length;
}

/**
Case-insensitive comparison preserves meaningful accents and punctuation.
*/
export function isTextMatch(
  first: string,
  second: string,
  language = "und",
): boolean {
  const locale = getTextLocale(language);
  let comparison = comparisonCache.get(locale);
  if (!comparison) {
    comparison = new Intl.Collator(locale, {
      usage: "search",
      sensitivity: "accent",
      ignorePunctuation: false,
    });
    if (comparisonCache.size >= TEXT_LIMITS.comparisonLocales) {
      const oldest = comparisonCache.keys().next().value;
      if (oldest !== undefined) comparisonCache.delete(oldest);
    }
    comparisonCache.set(locale, comparison);
  }
  return (
    comparison.compare(first.normalize("NFC"), second.normalize("NFC")) === 0
  );
}

/**
Only bounded, printable natural-language titles can become practice words.
*/
export function isWordCandidate(value: string): boolean {
  return (
    value.trim() === value &&
    /\p{L}/u.test(value) &&
    /^[\p{L}\p{M}\p{N} '’ʼ.\-\u{200C}\u{200D}]+$/u.test(value) &&
    getTextLength(value) <= TEXT_LIMITS.entryGraphemes
  );
}
