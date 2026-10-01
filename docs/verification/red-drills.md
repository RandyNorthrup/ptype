# Maintained red-drill evidence

All 33 cases ran through the complete quality:code hook on 2026-10-01. Each established green, its intended positive-exit failure, exact SHA-256 restoration, and restored green. Actual diagnostics and source mutations were reviewed. The harness used an owned disposable repository; no credential value is included here.

| Case                                      | Command                                                  | Green / red / restored | Expected failure                                            |
| ----------------------------------------- | -------------------------------------------------------- | ---------------------- | ----------------------------------------------------------- |
| formatting                                | `npm run format:check`                                   | 0 / 1 / 0              | `Code style issues found`                                   |
| ignored promise and aggregate propagation | `npm run quality:static`                                 | 0 / 1 / 0              | `@typescript-eslint\/no-floating-promises`                  |
| exhaustive union                          | `npm exec -- eslint src --max-warnings=0`                | 0 / 1 / 0              | `switch-exhaustiveness-check`                               |
| self comparison                           | `npm exec -- eslint src --max-warnings=0`                | 0 / 1 / 0              | `no-self-compare`                                           |
| strict types                              | `npm run typecheck`                                      | 0 / 2 / 0              | `TS2322`                                                    |
| unused export                             | `npm run deadcode`                                       | 0 / 1 / 0              | `qualityUnusedCanary`                                       |
| unused dependency                         | `npm run deadcode`                                       | 0 / 1 / 0              | `Unused devDependencies[\s\S]*picomatch`                    |
| duplication                               | `npm run duplicates`                                     | 0 / 1 / 0              | `Clone found`                                               |
| cycles                                    | `npm run cycles`                                         | 0 / 1 / 0              | `Circular Dependencies[\s\S]*quality-cycle`                 |
| CSS                                       | `npm run lint:css`                                       | 0 / 2 / 0              | `property-no-unknown`                                       |
| HTML                                      | `npm run lint:html`                                      | 0 / 1 / 0              | `id-unique`                                                 |
| workflow security                         | `npm run lint:workflows`                                 | 0 / 14 / 0             | `unpinned-uses`                                             |
| workflow syntax                           | `npm run lint:workflows`                                 | 0 / 1 / 0              | `unexpected key`                                            |
| code execution SAST                       | `npm run security:code`                                  | 0 / 1 / 0              | `browser-code-execution`                                    |
| HTML injection SAST                       | `npm run security:code`                                  | 0 / 1 / 0              | `browser-unsafe-html`                                       |
| JSX injection SAST                        | `npm run security:code`                                  | 0 / 1 / 0              | `browser-unsafe-html`                                       |
| test discovery                            | `npm run test:unit`                                      | 0 / 1 / 0              | `No test files found`                                       |
| coverage floor                            | `npm run test`                                           | 0 / 1 / 0              | `Coverage for branches[\s\S]*global threshold`              |
| security:deps                             | `npm run security:deps`                                  | 0 / 1 / 0              | `lodash`                                                    |
| security:osv                              | `npm run security:osv`                                   | 0 / 1 / 0              | `lodash`                                                    |
| trivia retry                              | `npm run test:unit -- tests/unit/triviaDatabase.test.ts` | 0 / 1 / 0              | `retries failed loads[\s\S]*AssertionError`                 |
| trivia answer boundary                    | `npm run test:unit -- tests/unit/triviaDatabase.test.ts` | 0 / 1 / 0              | `rejects malformed question content[\s\S]*promise resolved` |
| modal focus containment                   | `npm run test:unit -- tests/unit/uiPrimitives.test.tsx`  | 0 / 1 / 0              | `contains forward and reverse focus[\s\S]*toHaveFocus`      |
| word scoring                              | `npm run test:unit -- tests/unit/TypingHandler.test.tsx` | 0 / 1 / 0              | `TypingHandler[\s\S]*AssertionError`                        |
| secret detection                          | `npm run security:files`                                 | 0 / 1 / 0              | `generic-api-key`                                           |
| CI parity                                 | `npm run ci:parity`                                      | 0 / 1 / 0              | `CI parity: quality workflow`                               |
| conditional CI gate                       | `npm run ci:parity`                                      | 0 / 1 / 0              | `CI parity: quality workflow`                               |
| conditional commit gate                   | `npm run ci:parity`                                      | 0 / 1 / 0              | `CI parity: commit hooks must always run`                   |
| inactive actor frames                     | `npm run test:unit -- tests/unit/sceneFrames.test.tsx`   | 0 / 1 / 0              | `freezes actors[\s\S]*AssertionError`                       |
| actor memo freshness                      | `npm run test:unit -- tests/unit/sceneFrames.test.tsx`   | 0 / 1 / 0              | `freezes actors[\s\S]*AssertionError`                       |
| delayed spawn state                       | `npm run test:unit -- tests/unit/sceneFrames.test.tsx`   | 0 / 1 / 0              | `freezes actors[\s\S]*to not be called`                     |
| live letter targeting                     | `npm run test:unit -- tests/unit/sceneFrames.test.tsx`   | 0 / 1 / 0              | `projects the live letter mesh[\s\S]*AssertionError`        |
| destruction animation                     | `npm run test:unit -- tests/unit/sceneFrames.test.tsx`   | 0 / 1 / 0              | `animates destruction particles[\s\S]*AssertionError`       |

Receipt diagnostic identities: `CI parity: quality workflow` and `retries failed loads` occur in the actual child failure output. Detailed before/mutated/after fingerprints and diagnostic excerpts are bound in PLAN.md. Raw reports remain ignored.
