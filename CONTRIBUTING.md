# Contributing

Thank you for improving P-Type. Keep changes focused, accessible, responsive,
and supported by executable evidence.

## Setup

Use Node.js 24.4+ and npm 11.4.2+:

```bash
npm ci
python -m pip install pre-commit
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
6. Run `npm run quality` and `pre-commit run --all-files`.
7. Open a pull request that explains the outcome, risk, and verification.

Formatting-only changes should remain separate from behavioral refactors when
possible so review history stays useful. Do not commit generated `dist/`,
`coverage/`, local environment files, editor state, logs, or user save data.

## Tests and coverage

Vitest enforces 80% global thresholds for statements, branches, functions, and
lines. jsdom covers application orchestration, UI, state, content loaders, and
domain logic. WebGL render loops require a production-browser smoke test because
jsdom does not provide a graphics context.

An accessibility regression is a functional regression. Component tests use
axe-core where a meaningful rendered surface exists, but automated checks do not
replace keyboard and responsive browser verification.

## Commit and pull-request expectations

- Use an imperative, scoped commit subject such as
  `fix: preserve the selected trivia answer`.
- Keep the lockfile synchronized with `package.json`.
- Never commit credentials, private keys, tokens, or production user data.
- Report any release or browser verification limitation explicitly.
