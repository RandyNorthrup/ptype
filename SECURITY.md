# Security policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private
vulnerability reporting for `RandyNorthrup/ptype` when it is available. If that
channel is unavailable, contact the repository owner privately through the
contact method on the GitHub profile and include:

- the affected version or commit;
- clear reproduction steps;
- expected impact and required preconditions;
- any proposed mitigation; and
- whether the report may be acknowledged publicly after a fix.

Do not include real credentials or unnecessary personal data in a report. Allow
reasonable time for triage and remediation before disclosure.

## Supported versions

Security fixes target the current default branch and the verified GitHub Pages
deployment when published. Historical commits and locally modified builds are not maintained
as separate supported release lines.

## Project security boundaries

P-Type is a client-only application. It stores game settings, statistics, high
scores, and achievement progress in browser storage; this data is not a secure
or authoritative record. The application requires no backend credentials.

The repository enforces dependency auditing and secret scanning in its quality
workflow and pre-commit hooks. HTML CSP/referrer policies are defined in
`index.html`; Pages does not reproduce retired Vercel custom response headers.
WebAssembly permission supports the font renderer, and blob connections support
embedded GLTF textures. JavaScript string evaluation remains blocked.
Dependency audit results do not certify third-party models,
audio, browser engines, hosting infrastructure, or user-installed extensions.

## Historical credential checkpoint

The 2026-09-30 audit found a historical hardcoded Icons8 key in a discontinued
asset script. On 2026-10-01 the owner confirmed revocation/rotation and explicitly
authorized a key-only scrub of both branch histories, preserving release tags
and assets. Fresh VM audit found no copy of that value in any reachable blob;
the application history gate passed with no findings. External ref publication
and hosted checks still require observation before rollout.

No credential values are retained in the audit. Exact fingerprints of expired
signed GitHub screenshot URLs remain documented false positives, with both
original and rewritten commit identities covered. They are not a general README
or JWT exclusion. Re-synchronize old clones before contributing so superseded
history is not reintroduced. GitHub cached commit pages are separate from
reachable branch/tag history. See [the audit](docs/QUALITY-RETROFIT.md).
