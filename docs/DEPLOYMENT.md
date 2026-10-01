# Deployment and operations

P-Type is a static Vite/PWA app with no backend API or required credentials.
Output is `dist/`. Actions-based GitHub Pages is configured at
https://randynorthrup.github.io/ptype/; content deployment and live proof remain
pending verified source on protected main.

## Validation and release

```bash
npm ci --ignore-scripts
npm run quality
```

The same source/type/style, tests/coverage, dependency/security, workflow,
production-build, red-drill, and muted-browser aggregate runs on VM and CI.
Reachable-history clearance remains required. Removing the current script or
redacting scan logs does not revoke or remove an old credential from commits.
Quality and platform builds also run on version tags.

About consumes canonical package version, synchronized with its lock. Version
2.0.1 is prepared. Publish only with required clearance; its web ZIP must contain
complete output, source/version identity, and verified SHA-256 checksums.
This codebase does not create native desktop installers.

## Pages workflow and branch policy

Vite's base is `/ptype/`. Runtime URLs use `publicAssetUrl`; Vite handles HTML/CSS
URLs. Manifest start/scope/icons are project-relative. No path router or extra
navigation fallback is needed.

The Pages workflow follows successful Quality on main or a manual main dispatch.
Its deployment gate requires exact current main source and latest successful
Quality and Windows/macOS/Linux checks from GitHub Actions. Missing, failed,
stale, spoofed, or incomplete checks reject deployment. Actions are pinned;
checkout credentials are not persisted. Only deploy receives Pages write/OIDC.

The github-pages environment permits only main. Main requires all four trusted
checks, an up-to-date branch, resolved conversations, and enforcement for admins.
Force pushes and deletion are blocked. Preserve PR #4's work through merge before
removing its branch. Actions deployment does not introduce a gh-pages branch.

## Preview and live checks

```bash
npm run build
npm run preview -- --host 127.0.0.1
npm run test:browser
```

Open `/ptype/`. Verify version, keyboard focus/restoration, desktop/narrow layout,
normal/programming gameplay, pause/quit, manifest icons, scoped service worker,
models, fonts, audio, and YAML responses. Isolated test Chromium uses --mute-audio
and zero fixture volumes. This proves software WebGL, not audible/physical GPU
behavior. Repeat key flows on actual HTTPS and match deployment/source/version;
local preview or green CI alone does not prove live hosting.

The browser gate also opens an owned development server on port 4184. Its HTML
reuses Vite's complete transform and supplies a fresh random request nonce with
no-store caching, allowing the React development preamble. Builds retain the
static production policy. This single-page app has no path router; development
uses MPA behavior instead of an extra SPA fallback. Both dev and preview disable
automatic browser opening, and the parity gate rejects re-enabling it.
Use `npm run test:browser:dev` for the focused build/development journey.

HTML supplies CSP/no-referrer. Pages does not reproduce former Vercel framing,
permissions, MIME, or cache response headers; meta CSP is not equivalent to
header-only framing controls. Hashed bundles retain distinct update identity.
The font renderer needs WebAssembly and GLTF textures need blob connections;
the policy permits these while retaining the restriction on JavaScript string
evaluation. Production browser checks reject actual CSP/asset errors.

## Cleanup and rollback

Four obsolete completed legacy Actions runs and thirteen retired Vercel GitHub
deployment records were removed. Current PR evidence and published release
assets remain; inaccessible Vercel provider resources are not claimed deleted.
Build artifacts retain seven days. Roll back through a verified revert PR and
exact main deployment, then repeat live/PWA checks. For stale mixed versions,
close tabs, clear that site's storage/service worker, and reload.

## VM and tools

Per owner request, tests and complete hooks run on WIN-11-VM at
`C:\Users\Randy\Coding\ptype-release-20261001`. Credentials/temp/dependency/tool
directories are excluded from source transfer. Preserve other host workloads.

Python 3.12+ installs hash-locked requirements in an isolated environment:

```powershell
python -m venv .quality-tools/python
.quality-tools/python/Scripts/python.exe -m pip install --require-hashes -r requirements-quality.txt
```

Pinned native tools: actionlint 1.7.12, Gitleaks 8.30.1, OSV-Scanner 2.6.0,
Opengrep 1.30.0. VM/CI check published archive hashes. Windows Opengrep SHA-256:
`d21382af5eb1a99c637af08abc1e45ff0d35f7e749c66f12534207479abc780f`;
OSV: `e0ed7644118b717b028c249ee9d3515024e55e8510747ca08906eb96765354d6`.
PTYPE_OPENGREP selects the verified engine/DLLs. Nonempty complete source/rule
execution is required; findings fail even if the engine returns zero. Native
execution avoids the vulnerable Python JWT lock encountered with Semgrep.

```bash
npm exec -- playwright install chromium
npm run quality:static
npm run test:red
npm run test:browser
npm run security:secrets
```

quality:code combines static/build checks, drills, and browsers; quality adds
history clearance. ci:parity verifies aggregates, locked installs, tags,
always-running commit code gates, and Pages deployment/build commands.
Close only owned browsers/test/preview processes.
