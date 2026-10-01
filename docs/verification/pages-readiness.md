# Pages and rollout readiness

The authorized delta includes patch 2.0.1, GitHub Actions cleanup, closing PR #4
through a preserving merge, protected main with one remaining branch, and
retiring Vercel deployment records in favor of Actions-based GitHub Pages.
Current source is a static client/PWA with local assets and no server API;
GitHub Pages is suitable once project-path URLs and PWA scope are corrected.

Canonical loaders, preloader, actors, achievement definitions, and menu already
own their assets. A small public URL helper is justified because none currently
applies Vite's base to runtime URLs. Extend these owners, existing browser/unit
fixtures, Vite/PWA config, and quality/parity checks. Do not add a second app,
version source, loader, or deployment branch. Verify root and /ptype/ URL cases,
actual base-mounted production assets, manifest icons/scope, service worker,
keyboard/narrow layouts, and deliberate missing-base/deployment-gate defects.

Deployment must select exact main source with required GitHub Actions checks;
Pages-specific permissions belong only to its deployment job. Main protection
requires all four known checks from GitHub Actions, applies to admins, and
blocks force pushes/deletion. Preserve unmerged work until merging/closing PR
and deleting its branch are safe. Pages is configured, not yet deployed.

Cleanup deleted four obsolete completed legacy runs and thirteen retired
Vercel GitHub deployment records. Current verification runs/artifacts and
published release assets remain. This does not claim deletion of inaccessible
Vercel provider resources. Credentials in temp/creds.md remain ignored and are
excluded from every source transfer/artifact.

The host's Vitest workers failed startup before executing tests, including an
unchanged fixture. No failed startup counts as behavior/red proof. Per the
owner, further tests/hooks run in a new isolated WIN-11-VM workspace; existing
host projects/processes are preserved. The VM is authenticated Windows 11 with
Node 24.21.0, npm 11.19.0, Python 3.14.7, and Git 2.55.0, with ample free memory.
Pinned tools and VM context have been independently observed. The owner confirmed
key revocation/rotation and authorized exact-value history cleanup. Preserve all
release tags/assets, require branch leases and immediate protection restoration,
and observe remote outcomes before merge/Pages/release publication. The key-only
transform leaves current app source unchanged; expired screenshot exceptions need
their rewritten commit identities because their original source is unchanged.

The clearance commit gate actually failed on the App orchestration test during
the coverage drill baseline: its real dismissal waits exceeded five seconds.
Preserve every assertion and the timeout; use independent 499/500 ms clock
boundaries. Canonical Vite/React development HTML injects an inline preamble.
Use Vite nonce placeholders and its complete HTML transform, replacing the
placeholder with fresh random request identity in an owned development-only
response. Keep static production policy unchanged. Extend existing Playwright
projects with a real development journey and add intended missing-nonce and
automatic-browser-opening drills; both servers must preserve the user browser.
