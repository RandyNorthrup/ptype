# Hosted gate validation

Observed 2026-10-01 at source head `89b17a1dc38603228ebeb42502494c6143d0d4ed`.
This report records that run; later documentation commits do not change its
historical identity.

| Run                                                                                | Result | Evidence                                                                              |
| ---------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| [Quality](https://github.com/RandyNorthrup/ptype/actions/runs/36830047641)         | Fail   | Every code gate passed; the final reachable-history scan found one Icons8 credential. |
| [Platform builds](https://github.com/RandyNorthrup/ptype/actions/runs/36830047502) | Pass   | Windows, macOS, Linux builds and Linux artifact upload succeeded.                     |

The Linux Quality runner used Node v24.21.0, npm 11.19.0, and Python 3.12.14.
Local evidence used Windows, Node v24.20.0, npm 11.19.0, and Python 3.14.0.
Both executed the same npm aggregates and committed dependency locks; portable
Python hashes and native scanner downloads succeeded on the hosted runner.
This proves the observed configurations, not identical operating systems or
unobserved future tool releases.

The actual Quality log reports 25 test files / 118 tests, coverage
95.27/83.54/97.30/95.94, all 33 intended red drills with restored green, and both
muted desktop/narrow browser journeys passing. Source formatting, lint, CSS,
HTML, types, dead code, cycles, duplicates, npm/OSV, working-source secrets,
native SAST, workflow security, and the production build completed before the
drill/browser stages. No required code leaf was skipped.

The final history scan covered 112 commits, reported one finding, and exited 1.
It matches the local blocker. Neither that credential nor history was suppressed
to make CI pass. PR #4 stays draft until credential/history remediation clears
the full required gate; this evidence does not establish release readiness.

Documentation review reconciled the audit's hosted result with these exact run
links and retained the distinct local software-WebGL, audio, hardware, other
engine, and offline limitations. All README commands and implementation
contracts retain their previously bound local evidence.
