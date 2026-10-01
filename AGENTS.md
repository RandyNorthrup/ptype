# Project instructions

Rules revision: 3 (2026-09-30).

- Always use the `/caveman` skill for conversation. Write code, comments,
  documentation, and commit messages in normal English.
- End each session with next steps and any real blockers.
- Keep every UI change accessible and responsive. Verify keyboard navigation,
  focus containment/restoration, visible focus, reduced motion, and narrow and
  desktop layouts.
- Launch browser automation with muted audio and isolated profiles. Close only
  owned browsers and test/preview servers when done; preserve the user's browser.
- Keep documentation aligned with actual behavior and evidence. Do not claim
  release, hosted CI, browser, offline, or hardware verification from unit tests.
- Scan canonical source, consumers, tests, and configuration before creating
  another implementation. Extend existing responsibilities; remove stale callers.
- Keep changes in reviewable phases. Preserve existing strict rules, fix root
  causes, and narrowly justify any unavoidable exceptions.
- Commit reviewable increments regularly and open/update pull requests during
  delivery. Run the same local gates as CI before merge; keep unresolved gates
  visible in a draft PR. Do not bypass commit hooks or omit required CI checks.
- Maintain repeatable red drills that require the intended failure, exact
  restoration, and restored green. A skipped check is not passing evidence.
- Keep `PLAN.md` canonical for delivery state and `docs/QUALITY-RETROFIT.md`
  canonical for audit rationale. Update existing entries rather than duplicating
  their status in another plan.
- Redact secret scans. Report historical credentials without displaying their
  values; keep that gate failing until the incident is resolved. Never rewrite
  history without explicit authorization for that operation.

## Authorization amendment

The owner explicitly authorized the 2026-09-30 quality retrofit, installations,
breaking changes, and refactors, then reiterated authorization after the
historical Icons8 finding. Continue independent remediation without requiring
another approval. Credential revocation remains an external verification item;
it does not block code, dependency, tooling, documentation, or CI fixes. This
amendment affects the current retrofit's workflow, not its security acceptance.

Revision 2 follows the owner's report that a headless smoke check played through
their speakers. It adds the muted-browser rule and affects browser verification.

Revision 3 follows the owner's explicit request for frequent commits, pull
requests, and local/CI gate parity. It adds that delivery rule and affects the
retrofit's verification and PR workflow.
