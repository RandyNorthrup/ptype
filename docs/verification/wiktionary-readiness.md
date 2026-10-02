# Wiktionary and internationalization readiness

Owner requested Wiktionary mode, every language with playable entries, complete
UI internationalization independent of word language, and machine-translated UI
for major UI languages. Initial UI coverage: English, Spanish, French, German,
Portuguese, Italian, Arabic, Russian, Hindi, simplified/traditional Chinese,
Japanese and Korean. All playable dictionary languages remain selectable
independently. Installations/refactors are authorized.
Keep the established VM, muted-browser, full-hook/CI, protected-main and PR rules.

## Canonical source and reuse

Tracked application/tooling code contains 38 TypeScript, 36 TSX, one CSS, and one
HTML file. The native inventory succeeded; its additional Python/Rust/Go counts
come from ignored tool environments, not new product languages. Existing strict
configuration, 124 tests, forty drills, and final-main CI are the baseline.

- `wordDictionary.ts` owns loaded/shuffled regular/boss pools and the existing
  beginner <=30 / intermediate <=70 / advanced >70 boundaries. Extend it; keep
  normal/programming pools and the five difficulty/speed progressions intact.
- `enemySpawner.ts`, `gameContext.tsx`, `TypingHandler.tsx`, `EnemyShip.tsx`, and
  `LaserTargetHelper.tsx` own spawn/start/restart, typing/scoring, rendering and
  live targeting. Replace UTF-16 assumptions with shared grapheme semantics.
- `MainMenu.tsx`, `SettingsMenu.tsx`, existing dialogs/HUD and `ModalShell.tsx`
  own selection, persistence, labels, focus and layout. Extend these consumers.
- One external Wiktionary transport/catalogue adapter is justified: no existing
  implementation validates this provider or owns its continuation/cache policy.
  One UI-locale provider/catalogue owner is justified: no localization exists.
  A Unicode helper owns normalization/segmentation/comparison used by gameplay.
  These responsibilities must have real callers, not a parallel demonstration.

## Provider observations

Live GET probes on 2026-10-01 returned HTTP 200 and CORS `*` from the English
Wiktionary Action API. Category members include punctuation and unsupported-title
representations, so namespace zero alone does not establish playable words.
Category counts identify languages with entries. The documented JSON export
returned 8,246 language records with canonical names/scripts; this is an observed
snapshot, not a permanent count or proof that each has playable entries.

Use the fixed `https://en.wiktionary.org/w/api.php` endpoint, anonymous GETs,
`origin=*`, descriptive Api-User-Agent, serial bounded requests, continuation,
cache reuse and explicit errors. Reject malformed responses, wrong namespaces,
controls/unsupported-title surrogates, empty content and continuation loops.
Honor throttling; abort/stale responses must not replace a newer selection.
Persist only validated public data and provenance. Never send profile/save data.

Wiktionary supplies no typing-difficulty/CEFR rating. Classify validated targets
by grapheme typing complexity within each language, preserving the existing level
bands and regular/boss distinction. Short corpora may require clearly identified
practice sequences from real entries; retain their source links rather than
claiming generated phrases are dictionary headwords. No English/wrong-language
fallback or missing tier may silently manufacture a playable game.

Argos Translate is the chosen offline machine-translation provider. Its current
package index exposes 49 direct English targets. Generate complete static UI
catalogues for the 13 selected UI locales on the VM; publish only locales
actually generated/validated, with
provider/model identity and machine-translation disclosure. Map provider variants
such as Brazilian Portuguese and traditional Chinese to real UI locale tags.
No paid API, runtime secret, translation backend or per-player translation call
is required. Verify actual model execution before claiming translated coverage.
Complete UI strings, accessible names, numbers/dates, notices and dynamic game
copy must use the same locale owner. Preserve code identifiers and word language.

## Boundaries and acceptance review

Check Latin diacritics, decomposed accents, astral characters, Cyrillic, RTL,
Indic clusters and CJK composition. Normalize NFC without dropping meaningful
accents. Count graphemes for progress/scoring/speed, consume IME commits once,
ignore unfinished composition/hotkeys in editable controls, and preserve pause.
Unicode labels must use browser shaping/usable font fallback and actual rendered
positions for lasers. Keep classical visual behavior where its compatibility
contract needs a distinct renderer; avoid splitting joined scripts into isolated
glyphs and making unsupported font/physical-IME claims.

Owner explicitly clarified character availability: a language is playable only
when the selected real entries have usable supported characters/fonts and input.
Validate glyph coverage before start; filter unsupported entries and expose a
clear unavailable state if no compliant pools remain. A category having pages
does not prove its script is usable. No tofu/blank glyphs, transliteration or
English substitution may be presented as native-language gameplay. Bitmap
fallback alone does not establish correct shaping for complex scripts.

Selectors must support keyboard/search, clear labels, loading/error/retry and
focus restoration. Verify independent UI/word choices, long labels, RTL, reduced
motion and 390px/desktop layouts. Screen-reader status should report meaningful
target/selection changes without flooding per-frame announcements.

Automated fixtures cover real adapters, progression, Unicode input and UI;
controlled defects must fail and restore exactly. Existing coverage floors,
security/history, workflow and parity gates remain. Actual API/CORS/model/browser
checks are separate from mocks. Final code lands through checked PRs and main-only
Pages deployment; this feature does not implicitly publish another release.

Primary references: [category members](https://www.mediawiki.org/wiki/API:Categorymembers),
[CORS](https://www.mediawiki.org/wiki/API:Cross-site_requests),
[API etiquette](https://www.mediawiki.org/wiki/API:Etiquette),
[language JSON export](https://en.wiktionary.org/wiki/Module:JSON_data),
[data licensing](https://en.wiktionary.org/wiki/Wiktionary:Copyrights),
[Argos Translate](https://github.com/argosopentech/argos-translate), and
[Unifont coverage/limitations](https://unifoundry.com/unifont/index.html).

This review establishes requirements/reuse/failure cases. It does not certify
implementation, translation quality, fonts, physical IMEs or hosted behavior.
