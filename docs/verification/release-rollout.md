# Release rollout evidence

Observed 2026-10-01; this record distinguishes completed checks from publication.

## Source and required checks

PR [#4](https://github.com/RandyNorthrup/ptype/pull/4) merged as
`03469c49658e2583a82cf0448d86602ee459623a`, retaining final feature source
`d9a2bd14e389ddfa03dbbd02fd8bcc2c3036ae61`. Normal complete VM commit hooks
passed, including 124 tests, forty green/red/restored drills, three real browser
journeys, and every applicable hook. Postcommit history scan passed with no leaks.

Exact merged-main [Quality and Pages](https://github.com/RandyNorthrup/ptype/actions/runs/36928179869)
and [Windows/macOS/Linux builds](https://github.com/RandyNorthrup/ptype/actions/runs/36928179423)
all succeeded. No required check or hook was bypassed.

## Actual hosted browser check

The owner explicitly allowed a quiet hosted-site browser check after the general
host testing allowance expired. The in-app browser had no available surface.
Existing Playwright production journeys ran against
`https://randynorthrup.github.io/ptype/` with an ignored configuration that reuses
the canonical launch flags, isolates browser contexts, excludes the development
project, and starts no local server. Audio was muted.

Both desktop and 390-by-844 journeys passed (2.5 minutes). Assertions covered:

- Strict production script CSP, visible canvas and menu, no horizontal overflow.
- Settings focus containment/restoration and About version 2.0.1.
- Normal/Python gameplay, pause, quit cancellation, and confirmed return to menu.
- Manifest name/start/scope, icons, font/model/YAML HTTP responses.
- Registered service worker scoped beneath `/ptype/` and zero page/console errors.

This is direct HTTPS behavior evidence, separate from local preview or CI.
It does not certify other engines, audible playback, physical GPUs, or full
offline recovery. The README image is an actual production menu screenshot.

## History and repository cleanup

Owner confirmed key revocation/rotation and authorized exact-value scrub.
Current source trees and all ten prior release-tag identities were preserved;
95 commit identities and twelve historical trees changed only for that value.
Fresh reachable-blob audit found zero matches; retained Gitleaks history scan
passed. Cached provider pages and unsynchronized old clones remain separate.

Main protection requires all four GitHub Actions checks (app 15368), strict
up-to-date state, resolved conversations, and admin enforcement; force pushes
and deletion are disabled. Main-only Pages environment policy is active.
PRs #5, #6, and #7 were closed as obsolete; no open PRs remained at inspection.
Host and VM branch consolidation retained main and removed the merged feature.
GitHub reported only main remotely and zero self-hosted runner registrations.
Thirteen retired Vercel GitHub deployments and four obsolete legacy runs were
removed; published assets and current verification evidence were retained.

## Publication status

2.0.1 package/lock/About metadata agree. The release tag, verified web ZIP,
checksums, and GitHub release still require final publication checks. README
refresh will land through a checked PR before choosing the release source.
