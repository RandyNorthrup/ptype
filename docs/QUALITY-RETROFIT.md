# Quality retrofit audit

Date: 2026-09-30 (America/Los_Angeles). Independent source, dependency, tooling,
and documentation remediation continues under the owner's reiterated
installation/refactor authorization. This is not a release certification.
`PLAN.md` owns task state; this report owns rationale and compliance evidence.

## Baseline

The initial working tree was clean at
`4f4d77fefda9bceb04939b3e0a0e2d698b3328cd`. Existing formatting, lint, strict
TypeScript, Knip, cycle, duplication, and build checks passed. Vitest discovered
24 files and passed 101 tests; coverage was 94.92% statements, 82.67% branches,
97.29% functions, and 95.58% lines. `npm run quality` failed at its dependency
audit with four high-severity package findings. The build passed separately.

Inventory counted 62 TypeScript, 4 JavaScript, 3 CSS, and 31 HTML files; the
HTML/CSS inventory included pre-existing generated coverage/build artifacts.
The owned browser source has 35 TypeScript/TSX files. Existing configs and tests
were extended. The baseline formatter was already clean, so no unrelated
formatting sweep or new blame-ignore revision was needed.

## Changes and reuse

- Existing exact npm pins and lockfile were patched. Runtime js-yaml is 5.4.2;
  transitive brace-expansion, fast-uri, and undici findings were resolved.
  Knip 6.39, Playwright 1.63, and the compatible React Three test renderer are
  pinned; package installation and audits use the committed locks.
- Existing ESLint gained self-comparison, exhaustive-switch, strict unused
  local checks, and typed test safety. The blanket TSX magic-number exemption
  was removed. Owned configuration now names timing, scoring, geometry,
  animation, and thresholds. Scoring/FPS reuse the existing game constants.
- Full-graph Knip runs before the inherited strict mode. A deliberate unused
  export survived strict-only mode; the combined command catches it. Dead
  type/enum definitions were checked for consumers before removal. Dynamic
  framework defaults carry explicit public tags; external tools are explicitly
  mapped to pinned installers. Existing js-yaml strict-mode false-positive
  treatment remains bounded: dependency traces resolve both loaders and the
  production bundle includes the parser. Configuration hints are reported.
- The canonical trivia loader now rejects failures and empty/invalid datasets,
  clears its request pointer in `finally`, retries, and shares concurrent work.
  The documented arithmetic fallback remains an explicit degraded question
  with warnings, not a successful empty-load result. Production warnings and
  errors survive minification.
- The shared modal contains Tab/Shift+Tab, handles empty/disabled/hidden controls,
  restores focus, and uses fresh dismiss callbacks without resetting focus.
  Existing component tests and real keyboard fixtures were enhanced.
- Enemy frame callbacks now respect activity; delayed spawn reads current
  activity rather than stale captured pause state. Default shallow memoization
  observes actor/collision changes. Destruction particles animate after movement
  stops and update fresh vectors instead of mutating prior React state.
- Laser targeting reads the actual rendered letter's world transform. Stable
  letter names extend the existing ID owner rather than reproducing font,
  spacing, rotation, and spawn-position calculations in a second path.
- Existing GitHub workflows retain full SHA pins and locked installs. Checkout
  credentials, artifact-build caching, concurrency, timeouts, and cooldowns
  were hardened. actionlint and pedantic zizmor are local and CI gates.
- New responsibilities are the native engine adapter (which validates full
  execution and propagates findings), disposable red-drill harness, scene-frame
  fixtures, and production-browser tests. They extend canonical source and
  assertions instead of creating another application implementation.

## Security boundary

The initial redacted history scan covered 109 commits in a non-shallow checkout
and reported 19 matches. Eighteen concerned six old signed GitHub screenshot
URLs. Their decoded JWT expiry is 2025-09-25T20:18:52Z. Twelve unique exact
fingerprints cover those expired image URLs and are documented in
`.gitleaksignore`; future README/JWT findings remain scanned.

One genuine unresolved historical finding remains: a hardcoded Icons8 key in
`scripts/get-achievement-icons.ts:29` at
`11e011461c3e75c69f2c9539799d87eda83ca42a`. No credential value was displayed,
used, or suppressed. Its validity/revocation has not been established. Removing
the old script from HEAD does not remove history. `security:secrets` still exits

1. Provider revocation requires account access; history rewriting needs an
   explicit instruction. No history rewrite, push, or deployment was made.

Npm and OSV scans of the project locks are clean. An attempted Semgrep Python
lock exposed 13 PyJWT advisories and an upstream incompatible dependency pin.
The native Opengrep engine replaces that project execution path; its verified
archives retain the checked-in security rules and eliminate the vulnerable
Python dependency. The user's pre-existing global environments were preserved.

## Verification scope

The current unit baseline is 25 files and 118 tests. Measured coverage is
95.27% statements, 83.54% branches, 97.30% functions, and 95.94% lines. Enforced
floors are 94/82/97/95 respectively, raised from the inherited 80% floors.
Scene tests advance production callbacks through the official React Three test
renderer. Model/font/audio boundaries are mocked; known coordinate examples,
pause/resume, first-spawn, target cleanup, and particle motion are asserted.
The test-only Three.js CJS alias aligns the native renderer's constructor
identity; it does not change the production bundler or claim GPU simulation.

The production browser suite uses isolated muted Chromium at desktop and
390-by-844 sizes. It checks focus containment/restoration, normal/Python modes,
pause/quit cancellation, no overflow, manifest/service worker, and page/console
errors. Headless playback was reported by the owner during an early check;
owned browsers were closed immediately. Browser flags and zero fixture volumes
now prevent audio playback during automation. GPU rendering remains separately
verified by browser evidence; jsdom coverage excludes WebGL render-loop files.
Audible playback, other browser engines, full offline recovery, and hosted CI
have not been certified by these checks.

The maintained `npm run test:red` set records green, intended failing child
exit/diagnostic, exact SHA-256 restoration, and restored green in
`docs/verification/red-summary.json`. Raw logs are ignored; compact receipts
are bound in the canonical plan. CLI source gates require nonempty discovery.
The aggregate propagation drill runs `quality:static` on both green sides and
rejects an ignored promise through that same chain. The isolated repository
includes assets, initializes Git for workflow discovery, and links the existing
node_modules; it never mutates the user's checkout.

## Compliance observations

Final receipts and task status are recorded in `PLAN.md`. A deferred check is
unverified, not green.

| Obligation                                  | Observation                                                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Whole-tree formatter                        | Required and exercised; final aggregate is authoritative.                                                                 |
| Maximum-strictness lint, warnings as errors | Strict typed source/tests, hooks, numeric rules, and correctness canaries.                                                |
| Strict types                                | Application, tooling, and tests checked; dependency skipLibCheck retained.                                                |
| Dead code verified                          | Full graph plus strict mode and live canaries; confirmed unused definitions removed.                                      |
| Unused dependencies                         | Full graph detects a deliberate unused dependency; external tools/public defaults have concrete owners.                   |
| Explained literals                          | Owned constants; basic indexes, percentages, and midpoint arithmetic retained.                                            |
| Commented legacy code                       | No retained alternate implementation was introduced; current changes reviewed.                                            |
| Silent fallback/placeholder behavior        | Retry/empty-load/animation gaps fixed; documented degraded trivia remains observable.                                     |
| Any/ignore/suppressions                     | No new any or correctness ignores; bounded public/tool/false-positive exceptions documented.                              |
| Reachable-history secrets                   | Fail: one historical Icons8 credential remains unresolved.                                                                |
| Dependency audits                           | Npm and both OSV lockfile inventories clean; no vulnerable JWT lock retained.                                             |
| Lockfiles/locked CI install                 | npm ci --ignore-scripts and hash-checked Python requirements.                                                             |
| Pinned/least-privilege CI                   | Full SHAs, read-only permissions, no checkout persistence, pedantic workflow gate.                                        |
| Native sanitizers                           | Not applicable: no owned native-language product source.                                                                  |
| Tests and coverage floor                    | Nonempty discovery; measured raised floors enforced.                                                                      |
| Affected sensitivity                        | Repeatable source/gate mutations, intended diagnostics, restoration.                                                      |
| Maintained drill/green closure              | Required in quality:code and CI; current artifact/receipt governs completion.                                             |
| Canonical reuse/overlap                     | Configs, managers, UI primitive, ID owner, and suite extended; no second application path.                                |
| Build                                       | Production Vite/PWA build required; browser tests consume its artifact.                                                   |
| Pre-commit                                  | Existing installation retained; filename-selector escaping corrected and hooks must run at closeout.                      |
| CI/local parity                             | CI calls the same declared gates; hosted execution remains unverified.                                                    |
| README commands                             | Setup/build/watch/preview/gate commands reconciled with executable scripts; long-running tools need bounded smoke checks. |
| Changelog                                   | Unreleased entry describes actual changes and the remaining incident.                                                     |

## Next steps

Finish the current aggregate, maintained drills, hook run, and ledger
reconciliation; their receipts establish independent code completion. Resolve
the Icons8 credential through the provider and choose a reviewed history
remediation. Run hosted CI before a release claim. Keep browser automation
muted and close its owned processes afterward.
