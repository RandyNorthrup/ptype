# Deployment and operations

P-Type is a static Vite application. It has no server-side API, database,
secrets, or required environment variables. The production artifact is `dist/`.

## Release validation

Use the locked toolchain declared in `package.json`:

```bash
npm ci
npm run quality
```

This must complete before a release. The quality workflow uses Node.js 24 and
repeats formatting, lint, strict type checks, tests and coverage, dead-code,
cycle, duplication, vulnerability, and production-build checks.

## Vercel

Import `RandyNorthrup/ptype` as a Vercel project. The checked-in
`vercel.json` selects the static build, uses `dist` as the output, applies
long-lived caching to immutable assets, and adds Content Security Policy,
permissions, referrer, framing, and MIME-sniffing protections.

Expected project settings:

| Setting          | Value           |
| ---------------- | --------------- |
| Framework preset | Vite            |
| Install command  | `npm ci`        |
| Build command    | `npm run build` |
| Output directory | `dist`          |
| Node.js runtime  | 24.x            |

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
4. Layout remains usable at desktop and narrow viewport sizes.
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
