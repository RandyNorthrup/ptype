# Deployment and operations

P-Type is a static Vite application. It has no server-side API, database,
secrets, or required environment variables. The production artifact is `dist/`.

## Release validation

Use the locked toolchain declared in `package.json`:

```bash
npm ci --ignore-scripts
npm run quality
```

This must complete before a release. The quality workflow uses Node.js 24 and
repeats formatting, lint, strict types, measured coverage, full-graph and strict
dead-code checks, cycles, duplication, dependency/lockfile audits, native SAST,
workflow security, builds, red drills, and muted browser journeys. The history
secret scan remains a required final gate; its open incident is recorded in
[the audit](QUALITY-RETROFIT.md).

## Vercel

Import `RandyNorthrup/ptype` as a Vercel project. The checked-in
`vercel.json` selects the static build, uses `dist` as the output, applies
long-lived caching to immutable assets, and adds Content Security Policy,
permissions, referrer, framing, and MIME-sniffing protections.

Expected project settings:

| Setting          | Value                     |
| ---------------- | ------------------------- |
| Framework preset | Vite                      |
| Install command  | `npm ci --ignore-scripts` |
| Build command    | `npm run build`           |
| Output directory | `dist`                    |
| Node.js runtime  | 24.x                      |

No redirects or API rewrites are required. The PWA configuration deliberately
does not install a navigation fallback; static hosting must serve `/` as the
application entry point.

## Local production smoke test

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Verify at minimum:

1. The loading status advances to the main menu without console errors.
2. Normal and programming modes enter the WebGL game.
3. Settings, statistics, About, pause, quit confirmation, and game-over dialogs
   work by keyboard; cancelling quit returns to the paused game.
4. Layout remains usable at desktop and narrow sizes; Tab stays inside dialogs.
   Browser automation must launch with `--mute-audio` and isolated profiles.
5. The manifest and service worker load from the same origin.

Audio playback may wait for the first user gesture because of browser autoplay
policies. On the first visit, large GLB models are fetched from the same origin
and added to the runtime cache.

## PWA update recovery

The service worker uses automatic updates and immediate activation. If a user
reports a stale mixed-version client after a release, close all P-Type tabs,
clear the site's storage/service worker, and reload. Do not work around stale
clients by weakening immutable-asset caching; hashed bundle filenames make that
cache safe.

## Rollback

Use Vercel's deployment history to promote the last verified deployment. After
rollback, repeat the production smoke test and confirm the service worker has
activated the expected release.

## Quality tool setup

Use Python 3.12+ for the portable quality tools. Install the exact hash-locked
requirements in an isolated environment; the CI job repeats the hash check:

```powershell
python -m venv .quality-tools/python
. .quality-tools/python/Scripts/Activate.ps1
python -m pip install --require-hashes -r requirements-quality.txt
```

Native tools must be available on PATH: actionlint 1.7.12, Gitleaks 8.30.1,
and OSV-Scanner 2.6.0. Their CI downloads are checked against pinned SHA-256
values in `.github/workflows/quality.yml`. Download Windows builds from their
respective release pages and verify published checksums before running them:
[actionlint](https://github.com/rhysd/actionlint/releases/tag/v1.7.12),
[Gitleaks](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1), and
[OSV-Scanner](https://github.com/google/osv-scanner/releases/tag/v2.6.0).

The source gate uses the native Opengrep 1.30.0 engine with checked-in rules,
not an authenticated Python CLI. Semgrep 1.177/1.178 pin vulnerable PyJWT 2.13;
the native engine avoids adding that dependency to the project toolchain while
retaining and drilling the same rules. Install its Windows archive together
with its DLLs in `%LOCALAPPDATA%/ptype-quality-tools/opengrep/`:

| Artifact                                                                                                                 | SHA-256                                                            |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [Opengrep Windows archive](https://github.com/opengrep/opengrep/releases/download/v1.30.0/opengrep-core_windows_x86.zip) | `d21382af5eb1a99c637af08abc1e45ff0d35f7e749c66f12534207479abc780f` |
| [OSV Windows executable](https://github.com/google/osv-scanner/releases/download/v2.6.0/osv-scanner_windows_amd64.exe)   | `e0ed7644118b717b028c249ee9d3515024e55e8510747ca08906eb96765354d6` |

On Linux the CI job installs `opengrep-core` on PATH. `PTYPE_OPENGREP` can
explicitly select a different verified engine location. The native adapter
requires a nonempty source inventory, complete rule/file execution, valid
machine output, no parse errors or skipped rules, and no findings. A finding
fails the gate even when the underlying engine itself returns zero.

Install the pinned browser once before production verification:

```bash
npm exec -- playwright install chromium
npm run quality:static
npm run test:red
npm run test:browser
npm run security:secrets
```

`quality:static` runs the source/dependency/workflow/build gates.
`quality:code` adds maintained red drills and desktop/narrow Chromium journeys.
`quality` adds the required history scan. Never treat a failing history scan as
release clearance. Browser tests mute the browser and seed zero test volumes;
they verify rendering and interaction, not audible playback. Close owned
manual browser sessions and preview servers after verification.

`npm run ci:parity` checks that workflows use the unconditional local aggregate,
locked installs, and build command, and that every commit runs the complete code
aggregate. The parity drills deliberately skip CI and commit gates and require
rejection. Keep unresolved release gates visible in a draft PR.
