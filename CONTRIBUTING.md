# Contributing

Thank you for improving P-Type. Keep changes focused, accessible, responsive,
and supported by executable evidence.

## Setup

Use Node.js 24.4+ and npm 11.4.2+:

```bash
npm ci --ignore-scripts
python -m pip install --require-hashes -r requirements-quality.txt
pre-commit install
pre-commit run --all-files
```

## Change workflow

1. Create a topic branch from the current default branch.
2. Add or update tests with the behavior change.
3. Preserve strict TypeScript: do not add `any`, non-null assertions, or
   suppression comments to bypass a defect.
4. For UI work, verify keyboard operation, meaningful accessible names, focus
   visibility, reduced motion, and narrow as well as desktop layouts.
5. Update README or `docs/` whenever behavior, configuration, controls,
   dependencies, deployment, or content changes.
6. Follow [AGENTS.md](AGENTS.md), update the canonical [PLAN.md](PLAN.md), and
   run `npm run quality` and `pre-commit run --all-files`. Do not suppress an
   unresolved historical credential to manufacture a passing release gate.
7. Open a pull request that explains the outcome, risk, and verification.

Formatting-only changes should remain separate from behavioral refactors when
possible so review history stays useful. Do not commit generated `dist/`,
`coverage/`, local environment files, editor state, logs, or user save data.

## Tests and coverage

Vitest enforces measured global floors: 94% statements, 82% branches, 97%
functions, and 95% lines. jsdom covers application orchestration, UI, state, content loaders, and
domain logic. Scene tests exercise real frame callbacks with the React Three test renderer;
Production WebGL integration still requires the browser gate. Browser automation
must use isolated profiles, `--mute-audio`, and zero test audio volumes.

An accessibility regression is a functional regression. Component tests use
axe-core where a meaningful rendered surface exists, but automated checks do not
replace keyboard and responsive browser verification.

## Commit and pull-request expectations

- Use an imperative, scoped commit subject such as
  `fix: preserve the selected trivia answer`.
- Keep the lockfile synchronized with `package.json`.
- Never commit credentials, private keys, tokens, or production user data.
- Report any release or browser verification limitation explicitly.
- Commit reviewable increments regularly and open/update a PR during delivery.
- Every commit runs the complete `quality:code` aggregate. CI runs `quality`,
  adding the required reachable-history scan. `ci:parity` rejects missing or
  conditional gates. Run the full local aggregate before merge and report any
  remaining history blocker in a draft PR; never bypass hooks.

Run `npm run test:red` after gate, behavior, fixture, or tool changes. The harness
uses a disposable repository, verifies intended diagnostics and nonzero exits,
restores exact bytes in all outcomes, and proves restored green. A focused drill
can be selected by name, for example `npm run test:red -- "trivia retry"`.
