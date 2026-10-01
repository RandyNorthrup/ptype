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

Security fixes target the current default branch and the current Vercel
deployment. Historical commits and locally modified builds are not maintained
as separate supported release lines.

## Project security boundaries

P-Type is a client-only application. It stores game settings, statistics, high
scores, and achievement progress in browser storage; this data is not a secure
or authoritative record. The application requires no backend credentials.

The repository enforces dependency auditing and secret scanning in its quality
workflow and pre-commit hooks. Browser security headers are defined in
`vercel.json`. Dependency audit results do not certify third-party models,
audio, browser engines, hosting infrastructure, or user-installed extensions.

## Historical credential checkpoint

The 2026-09-30 audit found a historical hardcoded Icons8 key in a discontinued
asset script. Its revocation status has not been established. The required
history gate remains failing; the working source and dependency gates are
separate so independent remediation can continue. Credential rotation requires
provider account access; history rewriting requires an explicit instruction.
No credential values are retained in the audit. Exact fingerprints of expired
signed GitHub screenshot URLs are documented false positives, not a general
README or JWT exclusion. See [the audit](docs/QUALITY-RETROFIT.md).
