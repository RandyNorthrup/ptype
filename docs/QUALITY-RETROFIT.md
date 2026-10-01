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

At the original checkpoint, one genuine historical finding remained in
`scripts/get-achievement-icons.ts:29` at
`11e011461c3e75c69f2c9539799d87eda83ca42a`. On 2026-10-01 the owner confirmed
revocation/rotation and explicitly authorized key-only branch-history cleanup.
Fresh VM audit now finds no revoked value in any reachable blob; the normal
history gate exits zero with no findings. Both original and rewritten identities
for the same expired screenshot URLs are bounded in `.gitleaksignore` (24 exact
entries); no credential exception was added. Current app/main trees and all ten
release tag objects remain unchanged. See
[local cleanup evidence](verification/history-remediation.md). External ref
publication, CI, Pages, and release still require their own observed outcomes.

Npm and OSV scans of the project locks are clean. An attempted Semgrep Python
lock exposed 13 PyJWT advisories and an upstream incompatible dependency pin.
The native Opengrep engine replaces that project execution path; its verified
archives retain the checked-in security rules and eliminate the vulnerable
Python dependency. The user's pre-existing global environments were preserved.

## Verification scope

The verified retrofit baseline at `89b17a1` is 25 files and 118 tests. Measured coverage is
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

The table below records that verified retrofit baseline. The subsequent release
and Pages delta has separate current evidence and pending gates below.

Hosted checks at `89b17a1dc38603228ebeb42502494c6143d0d4ed` match the local code
gate results: all 118 tests, 33 drills, and both browser journeys passed.
Windows/macOS/Linux builds also passed. The complete Quality job failed only
at the required history scan with the same one finding. See
[hosted evidence](verification/ci-validation.md) for exact run links and scope.

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
| Hosted full aggregate                                          | Fail     | Observed at 89b17a1: all code gates and three platform builds pass; Quality fails only on the same historical credential.                  |
| README commands                                                | Pass     | Locked setup/build/test/preview/gates exercised; bounded dev/watch inspected and closed. Full required gate correctly fails on history.    |
| Changelog                                                      | Pass     | Unreleased entry matches fixes, main integration, and open incident.                                                                       |
| Audible playback / hardware / other engines / offline recovery | Deferred | Muted software Chromium and unit evidence do not certify these surfaces.                                                                   |

## Next steps at the original retrofit checkpoint

Review [draft PR #4](https://github.com/RandyNorthrup/ptype/pull/4), observe the
final pushed CI head, and resolve the Icons8 credential through its provider.
Then choose a reviewed history remediation and rerun the complete required gate
before merge/release clearance. Keep browser automation muted and close owned
processes. Current proof is [code validation](verification/code-validation.md)
and [maintained drills](verification/red-drills.md); PLAN.md owns verified tasks
and the real history blocker.

## Release and Pages delta (2026-10-01)

Version 2.0.1 now has one package metadata owner; About consumes it. Runtime
assets and the PWA are mounted at /ptype/. A pinned reusable Pages workflow
requires exact current main and all four trusted GitHub Actions checks before
publishing. Main protection and main-only Pages environment policy are active.
At the initial Pages checkpoint the site was configured but not deployed;
PR #4 stayed draft until required history clearance could be established.

On WIN-11-VM, the initial full code run passed static/build gates, 27 files with
124 tests, coverage 95.28/83.54/97.32/95.95, and 37 maintained drills. Both final
browser journeys rejected the new CSP because it blocked WebAssembly font
rendering and blob model textures. The specific permissions were corrected;
a fresh build and both desktop/narrow browser journeys then passed, including
project-path assets, manifest, service-worker scope, keyboard focus, and gameplay.
Normal VM commit hooks then passed every applicable check, including the full
code aggregate, and created c6c4b08. The authorized history transform leaves its
source tree unchanged (remapped be2d9ad). Rules and exact screenshot identities
now changed; a fresh normal hook run will verify that final delta. Raw VM logs
are ignored; current receipts bind independently reviewed outcomes.

The owner's temporary 20-minute host testing allowance was exercised with the
unchanged types fixture. Its Vitest worker failed startup with zero tests;
this is not counted as behavior verification. Full hooks continue on the VM.
No host project, service, or unrelated process was restarted.

Scoped cleanup removed four obsolete completed legacy Actions runs and thirteen
retired Vercel GitHub deployment records. No self-hosted runner registrations
remain. Current CI artifacts and published releases were preserved. Provider-side
Vercel cleanup is not claimed. Owner-confirmed revocation and authorized key-only history cleanup now clear
the local incident gate. Remote ref publication and current required CI still
precede preserving merge, Pages/release publication, and branch removal.

The subsequent normal clearance commit correctly stopped during the coverage
drill baseline: the App orchestration case exceeded its five-second limit while
waiting on real trivia timers. Its independent 499/500 ms fake-clock assertions
now pass without retiming gameplay or increasing that limit. Focused VM lint,
types, parity, five App tests, build, and the actual development page pass.
Development HTML uses Vite's complete transform and fresh request nonces; static
production CSP remains strict. Both servers disable automatic unowned browser
opening. Three new maintained drills caught immediate trivia dismissal, missing
development script nonces, and re-enabled browser opening, then restored exactly.
The complete set became forty cases; a fresh normal hook run was still required
at that checkpoint. Automatic approval review rejected both proposed remote CDP
agent-browser probes with only "blocked by policy"; that extra CLI inspection
is deferred, separately from the passing real Playwright development journey.

## Current consolidation and hosted results

The final normal VM commit hooks passed at `d9a2bd1`: every applicable hook,
124 tests, all forty green/red/restored drills, and three actual Chromium
journeys. The separate retained history scan passed with zero leaks across
156 scanned commits. No timeout or coverage floor was increased and no hook
was bypassed.

The reviewed exact-value history scrub was published with branch leases and
main protection restored. All ten prior tag identities and current app trees
were preserved. PR #4 merged as `03469c4`; its exact main Quality and all three
platform builds passed. Pages build and deployment also succeeded.

Actual HTTPS desktop/narrow production journeys then passed under the owner's
explicit quiet hosted-check authorization, including focus, version, both modes,
pause/quit, layout, manifest, service-worker scope, asset responses, and zero
page/console errors. This does not imply hardware, audible, other-engine, or
full offline certification. The optional remote CDP probe remains deferred;
the actual hosted browser gate is complete through standard Playwright.

Obsolete bot PRs were closed; only protected main remained locally/remotely.
The README refresh removes the stale unresolved-key claim, uses an actual menu
screenshot, and documents complete setup, controls, browser-local progress,
distribution, operations, and tested limits. The v2.0.1 release is published after successful exact-source main/tag checks;
all three downloaded assets match their local and uploaded SHA-256 digests. See [current rollout evidence](verification/release-rollout.md).

The first README commit attempt stopped when a concurrent tool-context refresh
rewrote ignored JSON during the formatting drill. Context formatting was restored
and the normal complete hook retry passed; no gate or hook was bypassed.
