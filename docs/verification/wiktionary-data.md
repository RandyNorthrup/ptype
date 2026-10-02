# Wiktionary data foundation evidence

Implementation is in progress; this record does not claim selectable/localized
gameplay or final font/browser certification.

VM source checks passed with 30 files / 171 tests and measured coverage
95.66% statements, 85.42% branches, 97.53% functions, 96.34% lines. Existing
94/82/97/95 floors remain. Formatting, strict lint and all type projects passed.
Subsequent cache/throttling changes still require a fresh complete hook run.

Three new controlled cases passed green/intended-red/exact-restored-green:

- Unicode grapheme count: independent accented/astral/ZWJ length assertion.
- Complete catalogue continuation: dropping later language pages fails the
  independently expected directory.
- Supported glyphs: removing both title and generated-target eligibility checks
  exposes an unsupported character and fails the expected pool assertion.

The initial glyph mutation hit a second guard rather than the intended assertion;
that run was rejected as red proof. The corrected mutation disabled both checks,
failed intentionally and restored exact bytes. Prior lint/failure logs remain.

Actual canonical adapter execution on WIN-11-VM returned 5,273 languages with
entries and a bounded 3,998-entry French sample. All entry links use real positive
page identities. Earlier API probes returned HTTP 200 with CORS `*` and exported
8,246 total language metadata records. These counts are observed snapshots;
entry presence does not establish usable fonts or game eligibility.

A first Node live request received HTTP 429. The adapter surfaced it. Identified
Node User-Agent/Origin and public caching then allowed actual adapter execution.
Browser client uses Api-User-Agent, as required for browser callers; real browser
CORS/start/render behavior remains a separate UI obligation. Requests stay serial,
bounded, anonymous and cached; no profile/save data is transmitted.

Argos Translate 1.11.0, CTranslate2 4.8.2 and SentencePiece 0.2.2 installed in a
separate owned VM tooling environment. All twelve selected English-to-UI models
executed real sample translations, including Arabic, Hindi and CJK. Machine output
has not yet become complete UI catalogues; ambiguous critical controls need review.
No runtime translation backend, API credential or model weights enter the product.

Next proof is normal complete commit hooks with all maintained drills/browsers and
history clearance. Then implement independent selection/localization, Unicode/IME
gameplay and font/glyph-gated rendering before closing feature acceptance.
