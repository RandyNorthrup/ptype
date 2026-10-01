# Quality retrofit audit

Started 2026-09-30; current local evidence 2026-10-01 (America/Los_Angeles). Independent source, dependency, tooling,
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
   explicit instruction. No history rewrite or deployment was made. Topic
   commits are pushed to [draft PR #4](https://github.com/RandyNorthrup/ptype/pull/4).

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
now prevent audio playback during automation. Browser checks use SwiftShader
software WebGL; they do not certify physical GPU hardware. jsdom coverage
excludes WebGL render-loop files.
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

| Obligation                                                     | Status   | Evidence / reason                                                                                                                          |
| -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Whole-tree formatter                                           | Pass     | Complete current code aggregate and all-file formatter hooks pass.                                                                         |
| Maximum-strictness lint, warnings as errors                    | Pass     | Typed source/tests, hooks, numeric rules, correctness canaries; optional-chain finding corrected.                                          |
| Strict types                                                   | Pass     | Application, tooling, and tests checked; dependency skipLibCheck retained.                                                                 |
| Dead code verified                                             | Pass     | Full graph plus strict mode and live canaries; consumer searches precede removals.                                                         |
| Unused dependencies                                            | Pass     | Unused dependency fails; external tools/public defaults have owners; vacuous analyzer and cross-env removed.                               |
| Explained literals                                             | Pass     | Owned constants and 13 literal-equivalence comparisons; indexes, percentages, midpoint arithmetic retained.                                |
| Commented legacy code                                          | Pass     | Changed canonical modules reviewed; no alternate implementation introduced.                                                                |
| Silent fallback/placeholder behavior                           | Pass     | Retry/empty-load/animation gaps fixed; explicit degraded trivia emits production warnings.                                                 |
| Any/ignore/suppressions                                        | Pass     | No new any/correctness ignores; public/tool/false-positive exceptions bounded and documented.                                              |
| Reachable-history secrets                                      | Fail     | One historical Icons8 key unresolved; scan exits 1 over 112 commits at recorded checkpoint.                                                |
| Dependency audits                                              | Pass     | Npm and both OSV locks clean; vulnerable JWT Python lock removed.                                                                          |
| Lockfiles/locked CI install                                    | Pass     | Locked npm and actual hash-locked Python installation succeed.                                                                             |
| Pinned/least-privilege CI                                      | Pass     | Full SHAs, read-only permissions, no persisted checkout credentials; actionlint/pedantic zizmor clean.                                     |
| Native sanitizers                                              | Pass     | Not applicable: no owned native product code. Third-party scanner archives checksum verified.                                              |
| Tests and coverage floor                                       | Pass     | 25 files / 118 tests; 95.27/83.54/97.30/95.94 exceeds enforced 94/82/97/95.                                                                |
| Affected sensitivity                                           | Pass     | All 33 intended defects fail; diagnostics and before/restored SHA-256 reviewed.                                                            |
| Maintained drill/green closure                                 | Pass     | All 33 green/red/restored triples pass; required in quality:code and CI.                                                                   |
| Canonical reuse/overlap                                        | Pass     | Existing configs, managers, modal, ID owner, and suites enhanced; new gate adapters/harnesses justified.                                   |
| Build                                                          | Pass     | Production Vite/PWA build passes; browser journeys consume its artifact.                                                                   |
| Pre-commit                                                     | Pass     | Installed; complete code aggregate and other all-file hooks pass. Automatic ledger line-ending correction passes focused all-file recheck. |
| CI/local parity                                                | Pass     | Unconditional local aggregate, locked install, build, and always-running commit code gates enforced and drilled.                           |
| Hosted full aggregate                                          | Deferred | Final pushed runner results require observation; history failure cannot establish full CI/release clearance.                               |
| README commands                                                | Pass     | Locked setup/build/test/preview/gates exercised; bounded dev/watch inspected and closed. Full required gate correctly fails on history.    |
| Changelog                                                      | Pass     | Unreleased entry matches fixes, main integration, and open incident.                                                                       |
| Audible playback / hardware / other engines / offline recovery | Deferred | Muted software Chromium and unit evidence do not certify these surfaces.                                                                   |

## Next steps

Review [draft PR #4](https://github.com/RandyNorthrup/ptype/pull/4), observe the
final pushed CI head, and resolve the Icons8 credential through its provider.
Then choose a reviewed history remediation and rerun the complete required gate
before merge/release clearance. Keep browser automation muted and close owned
processes. Current proof is [code validation](verification/code-validation.md)
and [maintained drills](verification/red-drills.md); PLAN.md owns verified tasks
and the real history blocker.
