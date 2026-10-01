# Quality retrofit plan

Extend the existing strict configuration and tests; do not create a second application path. New responsibilities are the repeatable drill harness, production-browser tests, pinned external security tools, and evidence records. The owner reiterated authorization after the baseline incident finding, so independent work continues while credential clearance remains open. Existing formatting and blame-ignore history are retained because the baseline formatter was already clean.

Canonical source and consumers were inspected in src/components, src/entities, src/store, src/utils, tests/unit, and existing configs. Keep constants beside their domain owners. Keep independent test expectations literal. Plan changes and receipts live only in the ledger below; detailed findings remain in docs/QUALITY-RETROFIT.md.

The semantic review found inactive actors, stale memo/laser data, and frozen destruction particles. The existing actor, game loop, and ID owner now provide those contracts; official scene tests exercise real callbacks with I/O boundaries mocked. This scope amendment is covered by the owner's authorized quality refactors. Browser automation is muted per the owner's steering. Historical credential clearance remains separate and unresolved.

The owner explicitly requested frequent commits, open pull requests, and local gates matching CI before merge. Draft PR #4 carries reviewable commits. Integration of origin/main preserves its Sponsors configuration and removes the dead demo link. The parity guard rejects omitted or conditional CI gates and non-running commit aggregates; this scope amendment extends REQ-GATES and the existing owners.

```quality-ledger
{
  "schema_version": 1,
  "work": {
    "id": "WORK-RETROFIT",
    "title": "Complete P-Type quality retrofit",
    "scope_revision": 3,
    "brief": null,
    "brief_reason": "Quality-only retrofit of the documented existing browser game, explicitly authorized by its owner.",
    "rules": [
      {
        "path": "AGENTS.md",
        "revision": "3"
      }
    ],
    "inputs": [
      "package-lock.json",
      "tsconfig.json",
      "tests/tsconfig.json"
    ],
    "environment": {
      "platform": "windows",
      "tools": {
        "python": "3.14.0",
        "node": "v24.20.0",
        "npm": "11.19.0",
        "typescript": "6.0.3",
        "eslint": "10.9.0",
        "vitest": "4.1.11",
        "playwright": "1.63.0",
        "react-three-test-renderer": "9.1.1",
        "gitleaks": "8.30.1",
        "actionlint": "1.7.12",
        "zizmor": "1.25.2",
        "osv-scanner": "2.6.0",
        "opengrep-core": "1.30.0",
        "pre-commit": "4.5.1"
      }
    }
  },
  "requirements": [
    {
      "id": "REQ-GATES",
      "statement": "Working-source gates, dependency audits, workflow checks, production browser journeys, and maintained drills pass; representative defects fail with exact restoration, and unconditional local/CI/commit aggregates cannot silently diverge.",
      "priority": "critical",
      "acceptance": [
        "AC-GATES"
      ],
      "superseded_by": null
    },
    {
      "id": "REQ-BEHAVIOR",
      "statement": "Trivia failure/retry and invalid content, modal focus, inactive actor frames, live letter targeting, destruction particles, and explicit owned tuning preserve their tested contracts.",
      "priority": "normal",
      "acceptance": [
        "AC-BEHAVIOR"
      ],
      "superseded_by": null
    },
    {
      "id": "REQ-DOCS",
      "statement": "Documentation and evidence describe actual commands, results, exceptions, and remaining risks.",
      "priority": "normal",
      "acceptance": [
        "AC-DOCS"
      ],
      "superseded_by": null
    },
    {
      "id": "REQ-HISTORY",
      "statement": "The historical Icons8 credential is triaged and the history secret gate is cleared.",
      "priority": "critical",
      "acceptance": [
        "AC-HISTORY"
      ],
      "superseded_by": null
    }
  ],
  "acceptance": [
    {
      "id": "AC-GATES",
      "requirement": "REQ-GATES",
      "given": "The updated working source, both locks, verified native tools, and isolated muted browsers",
      "when": "quality:code and its maintained drills execute",
      "then": "Working-source gates, dependency audits, workflow checks, production browser journeys, and maintained drills pass; representative defects fail with exact restoration, and unconditional local/CI/commit aggregates cannot silently diverge.",
      "checks": [
        "behavior",
        "red"
      ],
      "manual_reason": null
    },
    {
      "id": "AC-BEHAVIOR",
      "requirement": "REQ-BEHAVIOR",
      "given": "The checked-out P-Type application and pinned toolchain",
      "when": "The existing suites and scene-frame tests execute against the real source, with affected injected defects",
      "then": "Trivia failure/retry and invalid content, modal focus, inactive actor frames, live letter targeting, destruction particles, and explicit owned tuning preserve their tested contracts.",
      "checks": [
        "behavior",
        "red"
      ],
      "manual_reason": null
    },
    {
      "id": "AC-DOCS",
      "requirement": "REQ-DOCS",
      "given": "The checked-out P-Type application and pinned toolchain",
      "when": "The owning task is implemented and its declared checks run",
      "then": "Documentation and evidence describe actual commands, results, exceptions, and remaining risks.",
      "checks": [
        "manual"
      ],
      "manual_reason": "Documentation accuracy requires a semantic review against the executed commands."
    },
    {
      "id": "AC-HISTORY",
      "requirement": "REQ-HISTORY",
      "given": "The checked-out P-Type application and pinned toolchain",
      "when": "The owning task is implemented and its declared checks run",
      "then": "The historical Icons8 credential is triaged and the history secret gate is cleared.",
      "checks": [
        "manual"
      ],
      "manual_reason": "Only the provider or owner can confirm credential revocation or establish that the key was never valid."
    }
  ],
  "tasks": [
    {
      "id": "TASK-GATES",
      "purpose": "Working-source gates, dependency audits, workflow checks, production browser journeys, and maintained drills pass; representative defects fail with exact restoration, and unconditional local/CI/commit aggregates cannot silently diverge.",
      "acceptance": [
        "AC-GATES"
      ],
      "depends_on": [],
      "changes": [
        {
          "path": "package.json",
          "action": "modify"
        },
        {
          "path": "package-lock.json",
          "action": "modify"
        },
        {
          "path": "eslint.config.mjs",
          "action": "modify"
        },
        {
          "path": "knip.jsonc",
          "action": "modify"
        },
        {
          "path": "tsconfig.node.json",
          "action": "modify"
        },
        {
          "path": "vitest.config.ts",
          "action": "modify"
        },
        {
          "path": "playwright.config.ts",
          "action": "create"
        },
        {
          "path": ".semgrep.yml",
          "action": "create"
        },
        {
          "path": ".pre-commit-config.yaml",
          "action": "modify"
        },
        {
          "path": ".github/workflows/quality.yml",
          "action": "modify"
        },
        {
          "path": ".github/workflows/build-multiplatform.yml",
          "action": "modify"
        },
        {
          "path": ".github/dependabot.yml",
          "action": "modify"
        },
        {
          "path": "requirements-quality.in",
          "action": "create"
        },
        {
          "path": "requirements-quality.txt",
          "action": "create"
        },
        {
          "path": "tests/red-drills.ts",
          "action": "create"
        },
        {
          "path": "tests/e2e/smoke.spec.ts",
          "action": "create"
        },
        {
          "path": ".gitignore",
          "action": "modify"
        },
        {
          "path": "tests/code-scan.ts",
          "action": "create"
        },
        {
          "path": ".gitleaksignore",
          "action": "create"
        },
        {
          "path": "tests/ci-parity.ts",
          "action": "create"
        }
      ],
      "status": "verified",
      "evidence": [
        "EV-READY-AC-GATES",
        "EV-READY2-AC-GATES",
        "EV-READY3-AC-GATES",
        "EV-READY4-AC-GATES",
        "EV-CODE-AC-GATES",
        "EV-RED-AC-GATES"
      ],
      "blocker": null,
      "superseded_by": null
    },
    {
      "id": "TASK-BEHAVIOR",
      "purpose": "Trivia failure/retry and invalid content, modal focus, inactive actor frames, live letter targeting, destruction particles, and explicit owned tuning preserve their tested contracts.",
      "acceptance": [
        "AC-BEHAVIOR"
      ],
      "depends_on": [],
      "changes": [
        {
          "path": "src/components/ModalShell.tsx",
          "action": "modify"
        },
        {
          "path": "src/utils/triviaDatabase.ts",
          "action": "modify"
        },
        {
          "path": "tests/unit/uiPrimitives.test.tsx",
          "action": "modify"
        },
        {
          "path": "tests/unit/triviaDatabase.test.ts",
          "action": "modify"
        },
        {
          "path": "src/App.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/AchievementToast.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/CameraController.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/CanvasHUD.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/GameCanvas.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/GameOverScreen.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/LaserEffect.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/LaserTargetHelper.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/MainMenu.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/PlayerStatsModal.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/SpaceScene.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/TriviaOverlay.tsx",
          "action": "modify"
        },
        {
          "path": "src/components/TypingHandler.tsx",
          "action": "modify"
        },
        {
          "path": "src/entities/EnemyShip.tsx",
          "action": "modify"
        },
        {
          "path": "src/entities/PlayerShip.tsx",
          "action": "modify"
        },
        {
          "path": "src/store/gameContext.tsx",
          "action": "modify"
        },
        {
          "path": "src/types.ts",
          "action": "modify"
        },
        {
          "path": "src/utils/testIds.ts",
          "action": "modify"
        },
        {
          "path": "tests/unit/sceneFrames.test.tsx",
          "action": "create"
        },
        {
          "path": "vite.config.ts",
          "action": "modify"
        }
      ],
      "status": "verified",
      "evidence": [
        "EV-READY-AC-BEHAVIOR",
        "EV-READY2-AC-BEHAVIOR",
        "EV-READY3-AC-BEHAVIOR",
        "EV-READY4-AC-BEHAVIOR",
        "EV-CODE-AC-BEHAVIOR",
        "EV-RED-AC-BEHAVIOR"
      ],
      "blocker": null,
      "superseded_by": null
    },
    {
      "id": "TASK-DOCS",
      "purpose": "Documentation and evidence describe actual commands, results, exceptions, and remaining risks.",
      "acceptance": [
        "AC-DOCS"
      ],
      "depends_on": [],
      "changes": [
        {
          "path": "README.md",
          "action": "modify"
        },
        {
          "path": "CONTRIBUTING.md",
          "action": "modify"
        },
        {
          "path": "docs/DEPLOYMENT.md",
          "action": "modify"
        },
        {
          "path": "docs/QUALITY-RETROFIT.md",
          "action": "create"
        },
        {
          "path": "CHANGELOG.md",
          "action": "create"
        },
        {
          "path": "AGENTS.md",
          "action": "create"
        },
        {
          "path": "docs/CONTENT.md",
          "action": "modify"
        },
        {
          "path": ".github/.copilot-instructions.md",
          "action": "modify"
        },
        {
          "path": ".github/FUNDING.yml",
          "action": "modify"
        }
      ],
      "status": "verified",
      "evidence": [
        "EV-READY-AC-DOCS",
        "EV-READY2-AC-DOCS",
        "EV-READY3-AC-DOCS",
        "EV-READY4-AC-DOCS",
        "EV-DOCS-AC-DOCS",
        "EV-HOSTED-DOCS"
      ],
      "blocker": null,
      "superseded_by": null
    },
    {
      "id": "TASK-HISTORY",
      "purpose": "The historical Icons8 credential is triaged and the history secret gate is cleared.",
      "acceptance": [
        "AC-HISTORY"
      ],
      "depends_on": [],
      "changes": [
        {
          "path": "SECURITY.md",
          "action": "modify"
        }
      ],
      "status": "blocked",
      "evidence": [
        "EV-READY-AC-HISTORY",
        "EV-READY2-AC-HISTORY",
        "EV-READY3-AC-HISTORY",
        "EV-READY4-AC-HISTORY",
        "EV-HISTORY-AC-HISTORY"
      ],
      "blocker": "Historical Icons8 credential status unknown; continue independent remediation under reiterated owner authorization.",
      "superseded_by": null
    }
  ],
  "evidence": [
    {
      "id": "EV-READY-AC-GATES",
      "acceptance": [
        "AC-GATES"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Reviewed requirements, canonical paths, scope, dependency ordering, owner authorization, test strategy, and explicit historical-secret exception boundary.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness.md",
        "sha256": "660305b819b8f09aedd33672333d19060800294bb349fe20d5e3aff5c4830b68"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "13b5dd3ec82566dd4f75b5d4b0bef2affe026c44c30a2ee6962fd526c976bc8d"
        },
        {
          "path": "package-lock.json",
          "sha256": "79de75a095cef966c8ce5945907585c5f00d504b92e71168aae369bdd2474ee7"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "e56bcfed4451e986012c4a389f9f44cce1ed7eeefa7d113e23ecf7dd8d5809b2",
      "red": null,
      "reason": "Rules, tool locks, and scope changed during implementation; repeat readiness review against current inputs."
    },
    {
      "id": "EV-READY-AC-BEHAVIOR",
      "acceptance": [
        "AC-BEHAVIOR"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Reviewed requirements, canonical paths, scope, dependency ordering, owner authorization, test strategy, and explicit historical-secret exception boundary.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness.md",
        "sha256": "660305b819b8f09aedd33672333d19060800294bb349fe20d5e3aff5c4830b68"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "13b5dd3ec82566dd4f75b5d4b0bef2affe026c44c30a2ee6962fd526c976bc8d"
        },
        {
          "path": "package-lock.json",
          "sha256": "79de75a095cef966c8ce5945907585c5f00d504b92e71168aae369bdd2474ee7"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "37cbc710c2ab6296ca952284f33138010ca2e1c7a4485ce8130991ce12eee25e",
      "red": null,
      "reason": "Rules, tool locks, and scope changed during implementation; repeat readiness review against current inputs."
    },
    {
      "id": "EV-READY-AC-DOCS",
      "acceptance": [
        "AC-DOCS"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Reviewed requirements, canonical paths, scope, dependency ordering, owner authorization, test strategy, and explicit historical-secret exception boundary.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness.md",
        "sha256": "660305b819b8f09aedd33672333d19060800294bb349fe20d5e3aff5c4830b68"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "13b5dd3ec82566dd4f75b5d4b0bef2affe026c44c30a2ee6962fd526c976bc8d"
        },
        {
          "path": "package-lock.json",
          "sha256": "79de75a095cef966c8ce5945907585c5f00d504b92e71168aae369bdd2474ee7"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "e3e31b1317328b904567baf932c195f4da4f4ac12507ba28f234ed2ebd1caa33",
      "red": null,
      "reason": "Rules, tool locks, and scope changed during implementation; repeat readiness review against current inputs."
    },
    {
      "id": "EV-READY-AC-HISTORY",
      "acceptance": [
        "AC-HISTORY"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Reviewed requirements, canonical paths, scope, dependency ordering, owner authorization, test strategy, and explicit historical-secret exception boundary.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness.md",
        "sha256": "660305b819b8f09aedd33672333d19060800294bb349fe20d5e3aff5c4830b68"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "13b5dd3ec82566dd4f75b5d4b0bef2affe026c44c30a2ee6962fd526c976bc8d"
        },
        {
          "path": "package-lock.json",
          "sha256": "79de75a095cef966c8ce5945907585c5f00d504b92e71168aae369bdd2474ee7"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "d09455d472e6a87850650dd0da423eb954a0db38464830210e0e8c121ab15666",
      "red": null,
      "reason": "Rules, tool locks, and scope changed during implementation; repeat readiness review against current inputs."
    },
    {
      "id": "EV-READY2-AC-GATES",
      "acceptance": [
        "AC-GATES"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Reconciled current rules, authorization, complete canonical change paths, fresh tool locks, actor/loader/UI contracts, dependency ordering, isolation/restoration, browser muting, documentation, and separate unresolved historical incident.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-current.md",
        "sha256": "d62d05c092075db73ed9ac341ea8b29d9cc57c92ffbacbc967e4e6b50567d0dc"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "f1254989a3c3ea601a299d59aeaf32f31a52fd9bc1645eecba36c6048202577d"
        },
        {
          "path": "package-lock.json",
          "sha256": "3474f2c0621a50a719638938466054e2f61f807741bd669ca9825d3b6f15a95b"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "8e1395d1b2a02bab2488e7ab3fa1b44ab9968b60da1c38fc90d2ed25beb3cdf6",
      "red": null,
      "reason": "Owner requested commit/PR parity and main integration; rules, canonical paths, and source changed. Re-review and rerun current checks."
    },
    {
      "id": "EV-READY2-AC-BEHAVIOR",
      "acceptance": [
        "AC-BEHAVIOR"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Reconciled current rules, authorization, complete canonical change paths, fresh tool locks, actor/loader/UI contracts, dependency ordering, isolation/restoration, browser muting, documentation, and separate unresolved historical incident.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-current.md",
        "sha256": "d62d05c092075db73ed9ac341ea8b29d9cc57c92ffbacbc967e4e6b50567d0dc"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "f1254989a3c3ea601a299d59aeaf32f31a52fd9bc1645eecba36c6048202577d"
        },
        {
          "path": "package-lock.json",
          "sha256": "3474f2c0621a50a719638938466054e2f61f807741bd669ca9825d3b6f15a95b"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "8be1137460393da7c4c6d367293d4b4f1a25855cf0d30c2040ea2b812b44fd92",
      "red": null,
      "reason": "Owner requested commit/PR parity and main integration; rules, canonical paths, and source changed. Re-review and rerun current checks."
    },
    {
      "id": "EV-READY2-AC-DOCS",
      "acceptance": [
        "AC-DOCS"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Reconciled current rules, authorization, complete canonical change paths, fresh tool locks, actor/loader/UI contracts, dependency ordering, isolation/restoration, browser muting, documentation, and separate unresolved historical incident.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-current.md",
        "sha256": "d62d05c092075db73ed9ac341ea8b29d9cc57c92ffbacbc967e4e6b50567d0dc"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "f1254989a3c3ea601a299d59aeaf32f31a52fd9bc1645eecba36c6048202577d"
        },
        {
          "path": "package-lock.json",
          "sha256": "3474f2c0621a50a719638938466054e2f61f807741bd669ca9825d3b6f15a95b"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "726ad03475c3da0f64a6253b339a85db210f30f49187b25872c67b0b6c22c015",
      "red": null,
      "reason": "Owner requested commit/PR parity and main integration; rules, canonical paths, and source changed. Re-review and rerun current checks."
    },
    {
      "id": "EV-READY2-AC-HISTORY",
      "acceptance": [
        "AC-HISTORY"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Reconciled current rules, authorization, complete canonical change paths, fresh tool locks, actor/loader/UI contracts, dependency ordering, isolation/restoration, browser muting, documentation, and separate unresolved historical incident.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-current.md",
        "sha256": "d62d05c092075db73ed9ac341ea8b29d9cc57c92ffbacbc967e4e6b50567d0dc"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "f1254989a3c3ea601a299d59aeaf32f31a52fd9bc1645eecba36c6048202577d"
        },
        {
          "path": "package-lock.json",
          "sha256": "3474f2c0621a50a719638938466054e2f61f807741bd669ca9825d3b6f15a95b"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "c898f90b98e4dfc9f95a125af1981f169a53993cbf1dc14529cdf6de603f5f2e",
      "red": null,
      "reason": "Owner requested commit/PR parity and main integration; rules, canonical paths, and source changed. Re-review and rerun current checks."
    },
    {
      "id": "EV-READY3-AC-GATES",
      "acceptance": [
        "AC-GATES"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Semantic review of current requirements, failure cases, scope, canonical reuse, authorization, rules, main integration, and verification dependencies.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-final.md",
        "sha256": "6d01db145469ab01f47accf26341025bf9780a2b6a7b5b9653376dce08207b7b"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "2bcab7a94fcd0c1e66632a14417d04bc54a0dae01e5d7592183420a6f7bda94e",
      "red": null,
      "reason": "Formatter changed the readiness artifact bytes; repeat the semantic review and bind the formatted artifact."
    },
    {
      "id": "EV-READY3-AC-BEHAVIOR",
      "acceptance": [
        "AC-BEHAVIOR"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Semantic review of current requirements, failure cases, scope, canonical reuse, authorization, rules, main integration, and verification dependencies.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-final.md",
        "sha256": "6d01db145469ab01f47accf26341025bf9780a2b6a7b5b9653376dce08207b7b"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "5cab49f65ee22ef1e8ab6e6471f4aa77cd21ff6f7e385b090a82490e5e9cc22a",
      "red": null,
      "reason": "Formatter changed the readiness artifact bytes; repeat the semantic review and bind the formatted artifact."
    },
    {
      "id": "EV-READY3-AC-DOCS",
      "acceptance": [
        "AC-DOCS"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Semantic review of current requirements, failure cases, scope, canonical reuse, authorization, rules, main integration, and verification dependencies.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-final.md",
        "sha256": "6d01db145469ab01f47accf26341025bf9780a2b6a7b5b9653376dce08207b7b"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "68324f1b18c451d10aa71c2aab9a19cd715541dd567f7ae4980ec9e1b33737af",
      "red": null,
      "reason": "Formatter changed the readiness artifact bytes; repeat the semantic review and bind the formatted artifact."
    },
    {
      "id": "EV-READY3-AC-HISTORY",
      "acceptance": [
        "AC-HISTORY"
      ],
      "kind": "readiness",
      "status": "stale",
      "command": [],
      "method": "Semantic review of current requirements, failure cases, scope, canonical reuse, authorization, rules, main integration, and verification dependencies.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-final.md",
        "sha256": "6d01db145469ab01f47accf26341025bf9780a2b6a7b5b9653376dce08207b7b"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "e261b235545a8aba3c44da047d2b633662e828c360ade9d47e1adecd917d748d",
      "red": null,
      "reason": "Formatter changed the readiness artifact bytes; repeat the semantic review and bind the formatted artifact."
    },
    {
      "id": "EV-READY4-AC-GATES",
      "acceptance": [
        "AC-GATES"
      ],
      "kind": "readiness",
      "status": "pass",
      "command": [],
      "method": "Repeated semantic review against the formatted readiness artifact and corrected parity guard; requirements, canonical reuse, negative cases, and external history boundary remain clear.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-final.md",
        "sha256": "e4f3a50d858ce1bd5f96fd4f2e931e0ab4ef388065810446cc633f1ebfbfaf48"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "2bcab7a94fcd0c1e66632a14417d04bc54a0dae01e5d7592183420a6f7bda94e",
      "red": null,
      "reason": null
    },
    {
      "id": "EV-READY4-AC-BEHAVIOR",
      "acceptance": [
        "AC-BEHAVIOR"
      ],
      "kind": "readiness",
      "status": "pass",
      "command": [],
      "method": "Repeated semantic review against the formatted readiness artifact and corrected parity guard; requirements, canonical reuse, negative cases, and external history boundary remain clear.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-final.md",
        "sha256": "e4f3a50d858ce1bd5f96fd4f2e931e0ab4ef388065810446cc633f1ebfbfaf48"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "5cab49f65ee22ef1e8ab6e6471f4aa77cd21ff6f7e385b090a82490e5e9cc22a",
      "red": null,
      "reason": null
    },
    {
      "id": "EV-READY4-AC-DOCS",
      "acceptance": [
        "AC-DOCS"
      ],
      "kind": "readiness",
      "status": "pass",
      "command": [],
      "method": "Repeated semantic review against the formatted readiness artifact and corrected parity guard; requirements, canonical reuse, negative cases, and external history boundary remain clear.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-final.md",
        "sha256": "e4f3a50d858ce1bd5f96fd4f2e931e0ab4ef388065810446cc633f1ebfbfaf48"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "68324f1b18c451d10aa71c2aab9a19cd715541dd567f7ae4980ec9e1b33737af",
      "red": null,
      "reason": null
    },
    {
      "id": "EV-READY4-AC-HISTORY",
      "acceptance": [
        "AC-HISTORY"
      ],
      "kind": "readiness",
      "status": "pass",
      "command": [],
      "method": "Repeated semantic review against the formatted readiness artifact and corrected parity guard; requirements, canonical reuse, negative cases, and external history boundary remain clear.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/readiness-final.md",
        "sha256": "e4f3a50d858ce1bd5f96fd4f2e931e0ab4ef388065810446cc633f1ebfbfaf48"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "e261b235545a8aba3c44da047d2b633662e828c360ade9d47e1adecd917d748d",
      "red": null,
      "reason": null
    },
    {
      "id": "EV-CODE-AC-GATES",
      "acceptance": [
        "AC-GATES"
      ],
      "kind": "behavior",
      "status": "pass",
      "command": [
        "npm",
        "run",
        "quality:code"
      ],
      "method": "Actual quality:code child of the all-file hook passed, including 118 unit tests, all maintained drills, muted desktop/narrow production browser journeys, and every source/dependency/workflow/build gate. Reviewed the child outcome and drill records. The parent run returned one for automatic PLAN line-ending correction; the affected all-file line-ending hook then passed separately.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": 0,
      "artifact": {
        "path": "docs/verification/code-validation.md",
        "sha256": "30a9d0665438dee5cdf2c9080100cc8d1cae272e810dd225dc92e0b5caadffac"
      },
      "inputs": [
        {
          "path": ".github/dependabot.yml",
          "sha256": "2ac0f4eedc85cd7257690030d69de019cf53af459539657a601605d22d638f23"
        },
        {
          "path": ".github/workflows/build-multiplatform.yml",
          "sha256": "13f2ffc4a37a48358c2c6f7585426757fca2d6b5ba679898f7cafe0401cf1169"
        },
        {
          "path": ".github/workflows/quality.yml",
          "sha256": "4809ec20b17b235c3a81036a7db37c85e7d9e37feb31dc96caab15254c79848a"
        },
        {
          "path": ".gitignore",
          "sha256": "d3a2a3fd6e77609713fe83f38bdcedfbf2d4a90e90f7c3707c045e3224c58e85"
        },
        {
          "path": ".gitleaksignore",
          "sha256": "e3aa21f55812ff2193ae43d8c8cad3dcf4d40eec68137312cb88b4e8d0b50e6e"
        },
        {
          "path": ".pre-commit-config.yaml",
          "sha256": "a739eb6d9ff7c8e3bb02d28923d2bff6828616ad0b756ab9011666ac3f44dd15"
        },
        {
          "path": ".semgrep.yml",
          "sha256": "99e8b7b99911504941680041747174759585e2d359c379b3208fa8a4f66c3e9f"
        },
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "eslint.config.mjs",
          "sha256": "5b4420cca361c45bcd6635d8135fa3d6aa2d0c74af98ed7b1b0dd63ed2f32f1d"
        },
        {
          "path": "knip.jsonc",
          "sha256": "fa8eaa52bb9dba6ae2d774b7095d3e9027dc3fdc530bf14bc16d3787a1962465"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "package.json",
          "sha256": "7f1f7d6c458b3344076e2cce1d69bb945560dd2ad9e45d25a55c7df16bcf259c"
        },
        {
          "path": "playwright.config.ts",
          "sha256": "31a49af40e40a70e0a7c6fc6b76bb89a7046817b0933f6615a5034a64f7158f5"
        },
        {
          "path": "requirements-quality.in",
          "sha256": "0d865bbd734ee4bc2a928bd66f4d2f0d21dd84d5c13781a31f8c7a9bb7f04297"
        },
        {
          "path": "requirements-quality.txt",
          "sha256": "546575b9b4920fb90b69b34e46993ed03387558ae806c73cddf1236da8b8d56e"
        },
        {
          "path": "tests/ci-parity.ts",
          "sha256": "8f3817f015ce00f39ce5b3c7b44e7f900417056594884cb5583239f0572ce3ce"
        },
        {
          "path": "tests/code-scan.ts",
          "sha256": "cee0f261c8f0b030372a2fec78ac1920f59aa13b5b1c5e734c8ceabc300f1032"
        },
        {
          "path": "tests/e2e/smoke.spec.ts",
          "sha256": "545b7514a624f95f68abe4615727e5ed0e5530e98b3466d7e2110672236246e2"
        },
        {
          "path": "tests/red-drills.ts",
          "sha256": "31112b45114e020c0088a85a5978f3e0ed00decdca51e58637ec5f241bfbabd7"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        },
        {
          "path": "tsconfig.node.json",
          "sha256": "eae28b457e36032113b04b86feaedb7be1fb063b2ce26247142976f9bb6016be"
        },
        {
          "path": "vitest.config.ts",
          "sha256": "5eac76ca4a13b7d951d40b3ab71be7dddb516257c50f859d1af337621ef4e710"
        }
      ],
      "scope_sha256": "2bcab7a94fcd0c1e66632a14417d04bc54a0dae01e5d7592183420a6f7bda94e",
      "red": null,
      "reason": null
    },
    {
      "id": "EV-RED-AC-GATES",
      "acceptance": [
        "AC-GATES"
      ],
      "kind": "red",
      "status": "pass",
      "command": [
        "npm",
        "run",
        "test:red"
      ],
      "method": "Reviewed intended semantic failures, positive child exits, exact before/after SHA-256 identity, and restored green from the maintained harness. All maintained cases are summarized in the bound artifact.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": 0,
      "artifact": {
        "path": "docs/verification/red-drills.md",
        "sha256": "d0ecead263bd892905a0fa1a2ce50082c2d42b389939969fecc02f22b944742e"
      },
      "inputs": [
        {
          "path": ".github/dependabot.yml",
          "sha256": "2ac0f4eedc85cd7257690030d69de019cf53af459539657a601605d22d638f23"
        },
        {
          "path": ".github/workflows/build-multiplatform.yml",
          "sha256": "13f2ffc4a37a48358c2c6f7585426757fca2d6b5ba679898f7cafe0401cf1169"
        },
        {
          "path": ".github/workflows/quality.yml",
          "sha256": "4809ec20b17b235c3a81036a7db37c85e7d9e37feb31dc96caab15254c79848a"
        },
        {
          "path": ".gitignore",
          "sha256": "d3a2a3fd6e77609713fe83f38bdcedfbf2d4a90e90f7c3707c045e3224c58e85"
        },
        {
          "path": ".gitleaksignore",
          "sha256": "e3aa21f55812ff2193ae43d8c8cad3dcf4d40eec68137312cb88b4e8d0b50e6e"
        },
        {
          "path": ".pre-commit-config.yaml",
          "sha256": "a739eb6d9ff7c8e3bb02d28923d2bff6828616ad0b756ab9011666ac3f44dd15"
        },
        {
          "path": ".semgrep.yml",
          "sha256": "99e8b7b99911504941680041747174759585e2d359c379b3208fa8a4f66c3e9f"
        },
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "eslint.config.mjs",
          "sha256": "5b4420cca361c45bcd6635d8135fa3d6aa2d0c74af98ed7b1b0dd63ed2f32f1d"
        },
        {
          "path": "knip.jsonc",
          "sha256": "fa8eaa52bb9dba6ae2d774b7095d3e9027dc3fdc530bf14bc16d3787a1962465"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "package.json",
          "sha256": "7f1f7d6c458b3344076e2cce1d69bb945560dd2ad9e45d25a55c7df16bcf259c"
        },
        {
          "path": "playwright.config.ts",
          "sha256": "31a49af40e40a70e0a7c6fc6b76bb89a7046817b0933f6615a5034a64f7158f5"
        },
        {
          "path": "requirements-quality.in",
          "sha256": "0d865bbd734ee4bc2a928bd66f4d2f0d21dd84d5c13781a31f8c7a9bb7f04297"
        },
        {
          "path": "requirements-quality.txt",
          "sha256": "546575b9b4920fb90b69b34e46993ed03387558ae806c73cddf1236da8b8d56e"
        },
        {
          "path": "tests/ci-parity.ts",
          "sha256": "8f3817f015ce00f39ce5b3c7b44e7f900417056594884cb5583239f0572ce3ce"
        },
        {
          "path": "tests/code-scan.ts",
          "sha256": "cee0f261c8f0b030372a2fec78ac1920f59aa13b5b1c5e734c8ceabc300f1032"
        },
        {
          "path": "tests/e2e/smoke.spec.ts",
          "sha256": "545b7514a624f95f68abe4615727e5ed0e5530e98b3466d7e2110672236246e2"
        },
        {
          "path": "tests/red-drills.ts",
          "sha256": "31112b45114e020c0088a85a5978f3e0ed00decdca51e58637ec5f241bfbabd7"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        },
        {
          "path": "tsconfig.node.json",
          "sha256": "eae28b457e36032113b04b86feaedb7be1fb063b2ce26247142976f9bb6016be"
        },
        {
          "path": "vitest.config.ts",
          "sha256": "5eac76ca4a13b7d951d40b3ab71be7dddb516257c50f859d1af337621ef4e710"
        }
      ],
      "scope_sha256": "2bcab7a94fcd0c1e66632a14417d04bc54a0dae01e5d7592183420a6f7bda94e",
      "red": {
        "baseline_exit": 0,
        "mutated_exit": 1,
        "restored_exit": 0,
        "before": [
          {
            "path": ".github/workflows/quality.yml",
            "sha256": "4809ec20b17b235c3a81036a7db37c85e7d9e37feb31dc96caab15254c79848a"
          }
        ],
        "mutated": [
          {
            "path": ".github/workflows/quality.yml",
            "sha256": "e0046a4de84c96f475ed49b392fea2ef835b854afe9deca1572dd8cd5c291e9b"
          }
        ],
        "after": [
          {
            "path": ".github/workflows/quality.yml",
            "sha256": "4809ec20b17b235c3a81036a7db37c85e7d9e37feb31dc96caab15254c79848a"
          }
        ],
        "mutation": "Replace the CI quality aggregate with build-only.",
        "expected_diagnostic": "CI parity: quality workflow",
        "observed_diagnostic": "CI parity: quality workflow"
      },
      "reason": null
    },
    {
      "id": "EV-CODE-AC-BEHAVIOR",
      "acceptance": [
        "AC-BEHAVIOR"
      ],
      "kind": "behavior",
      "status": "pass",
      "command": [
        "npm",
        "run",
        "quality:code"
      ],
      "method": "Actual quality:code child of the all-file hook passed, including 118 unit tests, all maintained drills, muted desktop/narrow production browser journeys, and every source/dependency/workflow/build gate. Reviewed the child outcome and drill records. The parent run returned one for automatic PLAN line-ending correction; the affected all-file line-ending hook then passed separately.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": 0,
      "artifact": {
        "path": "docs/verification/code-validation.md",
        "sha256": "30a9d0665438dee5cdf2c9080100cc8d1cae272e810dd225dc92e0b5caadffac"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "src/App.tsx",
          "sha256": "a2db5229ac04960a471648b5d3eca34d482ed24dd1df36b9159a323ea26e7ce6"
        },
        {
          "path": "src/components/AchievementToast.tsx",
          "sha256": "39560e0016723e8cc81a1f5f7d19ff7b85f879da896bd6fad7ba4de6c50df807"
        },
        {
          "path": "src/components/CameraController.tsx",
          "sha256": "c86ccdd2214ac458cab1d6acab2ed39fd19f65c9c811deaeb7b530d80ddc3efe"
        },
        {
          "path": "src/components/CanvasHUD.tsx",
          "sha256": "a926eddf7c9b4bd5c1ec61858363dd8d2640c9d7e7109140befa5495f892f97d"
        },
        {
          "path": "src/components/GameCanvas.tsx",
          "sha256": "b31e5c4ca5613e84599bc5488e79c5bb99ca3e7833c565feda6096ddb720cfe3"
        },
        {
          "path": "src/components/GameOverScreen.tsx",
          "sha256": "24ce00cb347deeef8e5cf4ba8dafde90809991ec0d2ea0fd78b185d5abe27114"
        },
        {
          "path": "src/components/LaserEffect.tsx",
          "sha256": "d5f74e0f52e1b99db14460393e2acf5ecec7fd4d431311ec3cdbda0e91d86847"
        },
        {
          "path": "src/components/LaserTargetHelper.tsx",
          "sha256": "d18da761f538fa9bc3d1250c037c5a1a469d14273d6e47bee27c3e528f8cc9b3"
        },
        {
          "path": "src/components/MainMenu.tsx",
          "sha256": "3ef58606193abec1e78ca692c10763d5156b52736a483f21c51ef82eb2445730"
        },
        {
          "path": "src/components/ModalShell.tsx",
          "sha256": "47453faf2baee90e4a6b77dc9f5286016aac6bccb4d7b87f2c5be87f31d7bf34"
        },
        {
          "path": "src/components/PlayerStatsModal.tsx",
          "sha256": "a0d3dc71de543d1c51627f5e805c7ba155c90ae747824c145ecc55b6b2f3b6a4"
        },
        {
          "path": "src/components/SpaceScene.tsx",
          "sha256": "da584bf3c0af977979dbdb145918b31c1aeecc0bcae8587f915f5a1d36866517"
        },
        {
          "path": "src/components/TriviaOverlay.tsx",
          "sha256": "2e24da954b161c19785d855f54b4f90a102c1977d372e86fc914c9a0144e362c"
        },
        {
          "path": "src/components/TypingHandler.tsx",
          "sha256": "f90c72ae0a0cf3a7a3b987ad48e1eb23fab88594333bb869301adb8b0d557a51"
        },
        {
          "path": "src/entities/EnemyShip.tsx",
          "sha256": "28f43dc0a72de0dff914764865be4b8a8c4cab7d1d3283eef7d7eef0508a8c48"
        },
        {
          "path": "src/entities/PlayerShip.tsx",
          "sha256": "ba474d2467617401a11f341eaaa652ecf1de9480a656fda7c4e7d085a2f2ec90"
        },
        {
          "path": "src/store/gameContext.tsx",
          "sha256": "f40c4ea10a3f2aa4b4ba7a1ea6a9c7b5778a14adc541b01975882560ce9e263c"
        },
        {
          "path": "src/types.ts",
          "sha256": "2c0af52b1282d7979ad6a1b718b7da82971865e29e1b6bfe45f0b56ff1d8e161"
        },
        {
          "path": "src/utils/testIds.ts",
          "sha256": "8416d50f8928bec7da5fabbff821a1647a15dcb1e4e9b1a2be675f89eb636cea"
        },
        {
          "path": "src/utils/triviaDatabase.ts",
          "sha256": "b0936126943342917ad8f626736bc0492156aa5ea8d0f8a03bebf98f9dc01b17"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tests/unit/sceneFrames.test.tsx",
          "sha256": "e49ddfcf9e838bbaec8d35b9d2eae45775fb60b1e9ae79fcab42171c86eb7103"
        },
        {
          "path": "tests/unit/triviaDatabase.test.ts",
          "sha256": "300fbe4c3928570d2234bb3dedf4f0b2eed6f39b3241a143abfd070a83e88529"
        },
        {
          "path": "tests/unit/uiPrimitives.test.tsx",
          "sha256": "f759885389a54dd5996e40c2228f16d47a54c5410d88d794faadeafdb92ec28c"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        },
        {
          "path": "vite.config.ts",
          "sha256": "fd2029fd6f6a6a916a0317660ba9343438f27b9984c4c7c94a3c2969ad5cf2f0"
        }
      ],
      "scope_sha256": "5cab49f65ee22ef1e8ab6e6471f4aa77cd21ff6f7e385b090a82490e5e9cc22a",
      "red": null,
      "reason": null
    },
    {
      "id": "EV-RED-AC-BEHAVIOR",
      "acceptance": [
        "AC-BEHAVIOR"
      ],
      "kind": "red",
      "status": "pass",
      "command": [
        "npm",
        "run",
        "test:red"
      ],
      "method": "Reviewed intended semantic failures, positive child exits, exact before/after SHA-256 identity, and restored green from the maintained harness. All maintained cases are summarized in the bound artifact.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": 0,
      "artifact": {
        "path": "docs/verification/red-drills.md",
        "sha256": "d0ecead263bd892905a0fa1a2ce50082c2d42b389939969fecc02f22b944742e"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "src/App.tsx",
          "sha256": "a2db5229ac04960a471648b5d3eca34d482ed24dd1df36b9159a323ea26e7ce6"
        },
        {
          "path": "src/components/AchievementToast.tsx",
          "sha256": "39560e0016723e8cc81a1f5f7d19ff7b85f879da896bd6fad7ba4de6c50df807"
        },
        {
          "path": "src/components/CameraController.tsx",
          "sha256": "c86ccdd2214ac458cab1d6acab2ed39fd19f65c9c811deaeb7b530d80ddc3efe"
        },
        {
          "path": "src/components/CanvasHUD.tsx",
          "sha256": "a926eddf7c9b4bd5c1ec61858363dd8d2640c9d7e7109140befa5495f892f97d"
        },
        {
          "path": "src/components/GameCanvas.tsx",
          "sha256": "b31e5c4ca5613e84599bc5488e79c5bb99ca3e7833c565feda6096ddb720cfe3"
        },
        {
          "path": "src/components/GameOverScreen.tsx",
          "sha256": "24ce00cb347deeef8e5cf4ba8dafde90809991ec0d2ea0fd78b185d5abe27114"
        },
        {
          "path": "src/components/LaserEffect.tsx",
          "sha256": "d5f74e0f52e1b99db14460393e2acf5ecec7fd4d431311ec3cdbda0e91d86847"
        },
        {
          "path": "src/components/LaserTargetHelper.tsx",
          "sha256": "d18da761f538fa9bc3d1250c037c5a1a469d14273d6e47bee27c3e528f8cc9b3"
        },
        {
          "path": "src/components/MainMenu.tsx",
          "sha256": "3ef58606193abec1e78ca692c10763d5156b52736a483f21c51ef82eb2445730"
        },
        {
          "path": "src/components/ModalShell.tsx",
          "sha256": "47453faf2baee90e4a6b77dc9f5286016aac6bccb4d7b87f2c5be87f31d7bf34"
        },
        {
          "path": "src/components/PlayerStatsModal.tsx",
          "sha256": "a0d3dc71de543d1c51627f5e805c7ba155c90ae747824c145ecc55b6b2f3b6a4"
        },
        {
          "path": "src/components/SpaceScene.tsx",
          "sha256": "da584bf3c0af977979dbdb145918b31c1aeecc0bcae8587f915f5a1d36866517"
        },
        {
          "path": "src/components/TriviaOverlay.tsx",
          "sha256": "2e24da954b161c19785d855f54b4f90a102c1977d372e86fc914c9a0144e362c"
        },
        {
          "path": "src/components/TypingHandler.tsx",
          "sha256": "f90c72ae0a0cf3a7a3b987ad48e1eb23fab88594333bb869301adb8b0d557a51"
        },
        {
          "path": "src/entities/EnemyShip.tsx",
          "sha256": "28f43dc0a72de0dff914764865be4b8a8c4cab7d1d3283eef7d7eef0508a8c48"
        },
        {
          "path": "src/entities/PlayerShip.tsx",
          "sha256": "ba474d2467617401a11f341eaaa652ecf1de9480a656fda7c4e7d085a2f2ec90"
        },
        {
          "path": "src/store/gameContext.tsx",
          "sha256": "f40c4ea10a3f2aa4b4ba7a1ea6a9c7b5778a14adc541b01975882560ce9e263c"
        },
        {
          "path": "src/types.ts",
          "sha256": "2c0af52b1282d7979ad6a1b718b7da82971865e29e1b6bfe45f0b56ff1d8e161"
        },
        {
          "path": "src/utils/testIds.ts",
          "sha256": "8416d50f8928bec7da5fabbff821a1647a15dcb1e4e9b1a2be675f89eb636cea"
        },
        {
          "path": "src/utils/triviaDatabase.ts",
          "sha256": "b0936126943342917ad8f626736bc0492156aa5ea8d0f8a03bebf98f9dc01b17"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tests/unit/sceneFrames.test.tsx",
          "sha256": "e49ddfcf9e838bbaec8d35b9d2eae45775fb60b1e9ae79fcab42171c86eb7103"
        },
        {
          "path": "tests/unit/triviaDatabase.test.ts",
          "sha256": "300fbe4c3928570d2234bb3dedf4f0b2eed6f39b3241a143abfd070a83e88529"
        },
        {
          "path": "tests/unit/uiPrimitives.test.tsx",
          "sha256": "f759885389a54dd5996e40c2228f16d47a54c5410d88d794faadeafdb92ec28c"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        },
        {
          "path": "vite.config.ts",
          "sha256": "fd2029fd6f6a6a916a0317660ba9343438f27b9984c4c7c94a3c2969ad5cf2f0"
        }
      ],
      "scope_sha256": "5cab49f65ee22ef1e8ab6e6471f4aa77cd21ff6f7e385b090a82490e5e9cc22a",
      "red": {
        "baseline_exit": 0,
        "mutated_exit": 1,
        "restored_exit": 0,
        "before": [
          {
            "path": "src/utils/triviaDatabase.ts",
            "sha256": "b0936126943342917ad8f626736bc0492156aa5ea8d0f8a03bebf98f9dc01b17"
          }
        ],
        "mutated": [
          {
            "path": "src/utils/triviaDatabase.ts",
            "sha256": "ddfa564b14029a479029a7ce860b2588279af7c8b1723ad5bee8e304400249ef"
          }
        ],
        "after": [
          {
            "path": "src/utils/triviaDatabase.ts",
            "sha256": "b0936126943342917ad8f626736bc0492156aa5ea8d0f8a03bebf98f9dc01b17"
          }
        ],
        "mutation": "Cache an empty trivia dataset after failure, preventing a real retry.",
        "expected_diagnostic": "retries failed loads",
        "observed_diagnostic": "retries failed loads"
      },
      "reason": null
    },
    {
      "id": "EV-DOCS-AC-DOCS",
      "acceptance": [
        "AC-DOCS"
      ],
      "kind": "manual",
      "status": "stale",
      "command": [],
      "method": "Reviewed all README commands against actual bounded development/watch/preview startup, locked installs, all-file hooks and executed gates. Reconciled counts, software WebGL scope, open history incident, draft PR/main integration, and explicit pass/fail/deferred audit rows.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/code-validation.md",
        "sha256": "30a9d0665438dee5cdf2c9080100cc8d1cae272e810dd225dc92e0b5caadffac"
      },
      "inputs": [
        {
          "path": ".github/.copilot-instructions.md",
          "sha256": "af7c5e1bf5655378562e52a61da65788015ce260fcce3e349943f90382e79be7"
        },
        {
          "path": ".github/FUNDING.yml",
          "sha256": "bae242d028ca1f0a3a5ca6ad67bf3f612dd24d3abc85c573d12f89816a4e0d75"
        },
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "CHANGELOG.md",
          "sha256": "fa5326e6b3edfb8461c7179bbbe6eec5d964cc09ab4ee7b3f08eaf7112efd13e"
        },
        {
          "path": "CONTRIBUTING.md",
          "sha256": "8b397f1a9bed3d1f4952e9df63f729e39cd1d0a9864f276b3553d9356c855153"
        },
        {
          "path": "README.md",
          "sha256": "e0829e537211a7fde4e68f31011752b41eb97b1fc98eea1c6caf91b588fc1c97"
        },
        {
          "path": "docs/CONTENT.md",
          "sha256": "c12f8c96c7214099c59507162914e64cf270004bba177909d98123d326bbd019"
        },
        {
          "path": "docs/DEPLOYMENT.md",
          "sha256": "cbe111f810777cde002b21680010fa7b13b43135dbe53b3eb41b5b4a5e02326b"
        },
        {
          "path": "docs/QUALITY-RETROFIT.md",
          "sha256": "2920249ce7f077a2affe9caab330d19fdc1ad43bd6046c2f2b6d6089c2226542"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "68324f1b18c451d10aa71c2aab9a19cd715541dd567f7ae4980ec9e1b33737af",
      "red": null,
      "reason": "Hosted CI completed; audit/changelog now record actual results. Re-review the updated documentation."
    },
    {
      "id": "EV-HISTORY-AC-HISTORY",
      "acceptance": [
        "AC-HISTORY"
      ],
      "kind": "manual",
      "status": "fail",
      "command": [],
      "method": "Reviewed the current redacted full reachable-history scan: one historical Icons8 finding remains; no value is used or suppressed.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/code-validation.md",
        "sha256": "30a9d0665438dee5cdf2c9080100cc8d1cae272e810dd225dc92e0b5caadffac"
      },
      "inputs": [
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "SECURITY.md",
          "sha256": "ff3927b9938b7b4f0dd3abfa6cf8485a57f0db8bb3b7e3131f15af526e0c9c1e"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "e261b235545a8aba3c44da047d2b633662e828c360ade9d47e1adecd917d748d",
      "red": null,
      "reason": "Provider revocation remains unverified; revoke/rotate through the Icons8 account, then obtain explicit history-remediation authorization and rerun the full history gate."
    },
    {
      "id": "EV-HOSTED-DOCS",
      "acceptance": [
        "AC-DOCS"
      ],
      "kind": "manual",
      "status": "pass",
      "command": [],
      "method": "Read actual completed hosted logs and exact head/run identities. Reconciled successful platform builds, every passing code gate, 118 tests, 33 red drills, two browser journeys, and the shared failing history gate with updated audit/changelog; preserved prior local command and scope evidence.",
      "environment": {
        "platform": "windows",
        "tools": {
          "python": "3.14.0",
          "node": "v24.20.0",
          "npm": "11.19.0",
          "typescript": "6.0.3",
          "eslint": "10.9.0",
          "vitest": "4.1.11",
          "playwright": "1.63.0",
          "react-three-test-renderer": "9.1.1",
          "gitleaks": "8.30.1",
          "actionlint": "1.7.12",
          "zizmor": "1.25.2",
          "osv-scanner": "2.6.0",
          "opengrep-core": "1.30.0",
          "pre-commit": "4.5.1"
        }
      },
      "exit_code": null,
      "artifact": {
        "path": "docs/verification/ci-validation.md",
        "sha256": "da0f53671fadbd15194d6695359fce8dcf8bc721f38feb5ca1aed7e5861d95bd"
      },
      "inputs": [
        {
          "path": ".github/.copilot-instructions.md",
          "sha256": "af7c5e1bf5655378562e52a61da65788015ce260fcce3e349943f90382e79be7"
        },
        {
          "path": ".github/FUNDING.yml",
          "sha256": "bae242d028ca1f0a3a5ca6ad67bf3f612dd24d3abc85c573d12f89816a4e0d75"
        },
        {
          "path": "AGENTS.md",
          "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
        },
        {
          "path": "CHANGELOG.md",
          "sha256": "3e67a8f051ab0c36dc380cac724d70f70661c7a592cdc057b9bb4c4eacf544bf"
        },
        {
          "path": "CONTRIBUTING.md",
          "sha256": "8b397f1a9bed3d1f4952e9df63f729e39cd1d0a9864f276b3553d9356c855153"
        },
        {
          "path": "README.md",
          "sha256": "e0829e537211a7fde4e68f31011752b41eb97b1fc98eea1c6caf91b588fc1c97"
        },
        {
          "path": "docs/CONTENT.md",
          "sha256": "c12f8c96c7214099c59507162914e64cf270004bba177909d98123d326bbd019"
        },
        {
          "path": "docs/DEPLOYMENT.md",
          "sha256": "cbe111f810777cde002b21680010fa7b13b43135dbe53b3eb41b5b4a5e02326b"
        },
        {
          "path": "docs/QUALITY-RETROFIT.md",
          "sha256": "772c6adfdf8bc47067cd43a2f97878db9c8a80267b7a7813f3c554b8894d3bb2"
        },
        {
          "path": "package-lock.json",
          "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
        },
        {
          "path": "tests/tsconfig.json",
          "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
        },
        {
          "path": "tsconfig.json",
          "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
        }
      ],
      "scope_sha256": "68324f1b18c451d10aa71c2aab9a19cd715541dd567f7ae4980ec9e1b33737af",
      "red": null,
      "reason": null
    }
  ],
  "checkpoint": {
    "scope_sha256": "b89f262a2addae73ecd99d566b21b315100f296cfa703d73233147fd6cb3c45b",
    "inputs": [
      {
        "path": ".github/.copilot-instructions.md",
        "sha256": "af7c5e1bf5655378562e52a61da65788015ce260fcce3e349943f90382e79be7"
      },
      {
        "path": ".github/FUNDING.yml",
        "sha256": "bae242d028ca1f0a3a5ca6ad67bf3f612dd24d3abc85c573d12f89816a4e0d75"
      },
      {
        "path": ".github/dependabot.yml",
        "sha256": "2ac0f4eedc85cd7257690030d69de019cf53af459539657a601605d22d638f23"
      },
      {
        "path": ".github/workflows/build-multiplatform.yml",
        "sha256": "13f2ffc4a37a48358c2c6f7585426757fca2d6b5ba679898f7cafe0401cf1169"
      },
      {
        "path": ".github/workflows/quality.yml",
        "sha256": "4809ec20b17b235c3a81036a7db37c85e7d9e37feb31dc96caab15254c79848a"
      },
      {
        "path": ".gitignore",
        "sha256": "d3a2a3fd6e77609713fe83f38bdcedfbf2d4a90e90f7c3707c045e3224c58e85"
      },
      {
        "path": ".gitleaksignore",
        "sha256": "e3aa21f55812ff2193ae43d8c8cad3dcf4d40eec68137312cb88b4e8d0b50e6e"
      },
      {
        "path": ".pre-commit-config.yaml",
        "sha256": "a739eb6d9ff7c8e3bb02d28923d2bff6828616ad0b756ab9011666ac3f44dd15"
      },
      {
        "path": ".semgrep.yml",
        "sha256": "99e8b7b99911504941680041747174759585e2d359c379b3208fa8a4f66c3e9f"
      },
      {
        "path": "AGENTS.md",
        "sha256": "01a91adc3f559834a0825dbbc6bd6d435b6b2333737db0036fabc44fb6aa822b"
      },
      {
        "path": "CHANGELOG.md",
        "sha256": "3e67a8f051ab0c36dc380cac724d70f70661c7a592cdc057b9bb4c4eacf544bf"
      },
      {
        "path": "CONTRIBUTING.md",
        "sha256": "8b397f1a9bed3d1f4952e9df63f729e39cd1d0a9864f276b3553d9356c855153"
      },
      {
        "path": "README.md",
        "sha256": "e0829e537211a7fde4e68f31011752b41eb97b1fc98eea1c6caf91b588fc1c97"
      },
      {
        "path": "SECURITY.md",
        "sha256": "ff3927b9938b7b4f0dd3abfa6cf8485a57f0db8bb3b7e3131f15af526e0c9c1e"
      },
      {
        "path": "docs/CONTENT.md",
        "sha256": "c12f8c96c7214099c59507162914e64cf270004bba177909d98123d326bbd019"
      },
      {
        "path": "docs/DEPLOYMENT.md",
        "sha256": "cbe111f810777cde002b21680010fa7b13b43135dbe53b3eb41b5b4a5e02326b"
      },
      {
        "path": "docs/QUALITY-RETROFIT.md",
        "sha256": "772c6adfdf8bc47067cd43a2f97878db9c8a80267b7a7813f3c554b8894d3bb2"
      },
      {
        "path": "eslint.config.mjs",
        "sha256": "5b4420cca361c45bcd6635d8135fa3d6aa2d0c74af98ed7b1b0dd63ed2f32f1d"
      },
      {
        "path": "knip.jsonc",
        "sha256": "fa8eaa52bb9dba6ae2d774b7095d3e9027dc3fdc530bf14bc16d3787a1962465"
      },
      {
        "path": "package-lock.json",
        "sha256": "5bf787f9190a6b4688fbed7226fbf7414684d03d9021976c93945bf20ec88ff9"
      },
      {
        "path": "package.json",
        "sha256": "7f1f7d6c458b3344076e2cce1d69bb945560dd2ad9e45d25a55c7df16bcf259c"
      },
      {
        "path": "playwright.config.ts",
        "sha256": "31a49af40e40a70e0a7c6fc6b76bb89a7046817b0933f6615a5034a64f7158f5"
      },
      {
        "path": "requirements-quality.in",
        "sha256": "0d865bbd734ee4bc2a928bd66f4d2f0d21dd84d5c13781a31f8c7a9bb7f04297"
      },
      {
        "path": "requirements-quality.txt",
        "sha256": "546575b9b4920fb90b69b34e46993ed03387558ae806c73cddf1236da8b8d56e"
      },
      {
        "path": "src/App.tsx",
        "sha256": "a2db5229ac04960a471648b5d3eca34d482ed24dd1df36b9159a323ea26e7ce6"
      },
      {
        "path": "src/components/AchievementToast.tsx",
        "sha256": "39560e0016723e8cc81a1f5f7d19ff7b85f879da896bd6fad7ba4de6c50df807"
      },
      {
        "path": "src/components/CameraController.tsx",
        "sha256": "c86ccdd2214ac458cab1d6acab2ed39fd19f65c9c811deaeb7b530d80ddc3efe"
      },
      {
        "path": "src/components/CanvasHUD.tsx",
        "sha256": "a926eddf7c9b4bd5c1ec61858363dd8d2640c9d7e7109140befa5495f892f97d"
      },
      {
        "path": "src/components/GameCanvas.tsx",
        "sha256": "b31e5c4ca5613e84599bc5488e79c5bb99ca3e7833c565feda6096ddb720cfe3"
      },
      {
        "path": "src/components/GameOverScreen.tsx",
        "sha256": "24ce00cb347deeef8e5cf4ba8dafde90809991ec0d2ea0fd78b185d5abe27114"
      },
      {
        "path": "src/components/LaserEffect.tsx",
        "sha256": "d5f74e0f52e1b99db14460393e2acf5ecec7fd4d431311ec3cdbda0e91d86847"
      },
      {
        "path": "src/components/LaserTargetHelper.tsx",
        "sha256": "d18da761f538fa9bc3d1250c037c5a1a469d14273d6e47bee27c3e528f8cc9b3"
      },
      {
        "path": "src/components/MainMenu.tsx",
        "sha256": "3ef58606193abec1e78ca692c10763d5156b52736a483f21c51ef82eb2445730"
      },
      {
        "path": "src/components/ModalShell.tsx",
        "sha256": "47453faf2baee90e4a6b77dc9f5286016aac6bccb4d7b87f2c5be87f31d7bf34"
      },
      {
        "path": "src/components/PlayerStatsModal.tsx",
        "sha256": "a0d3dc71de543d1c51627f5e805c7ba155c90ae747824c145ecc55b6b2f3b6a4"
      },
      {
        "path": "src/components/SpaceScene.tsx",
        "sha256": "da584bf3c0af977979dbdb145918b31c1aeecc0bcae8587f915f5a1d36866517"
      },
      {
        "path": "src/components/TriviaOverlay.tsx",
        "sha256": "2e24da954b161c19785d855f54b4f90a102c1977d372e86fc914c9a0144e362c"
      },
      {
        "path": "src/components/TypingHandler.tsx",
        "sha256": "f90c72ae0a0cf3a7a3b987ad48e1eb23fab88594333bb869301adb8b0d557a51"
      },
      {
        "path": "src/entities/EnemyShip.tsx",
        "sha256": "28f43dc0a72de0dff914764865be4b8a8c4cab7d1d3283eef7d7eef0508a8c48"
      },
      {
        "path": "src/entities/PlayerShip.tsx",
        "sha256": "ba474d2467617401a11f341eaaa652ecf1de9480a656fda7c4e7d085a2f2ec90"
      },
      {
        "path": "src/store/gameContext.tsx",
        "sha256": "f40c4ea10a3f2aa4b4ba7a1ea6a9c7b5778a14adc541b01975882560ce9e263c"
      },
      {
        "path": "src/types.ts",
        "sha256": "2c0af52b1282d7979ad6a1b718b7da82971865e29e1b6bfe45f0b56ff1d8e161"
      },
      {
        "path": "src/utils/testIds.ts",
        "sha256": "8416d50f8928bec7da5fabbff821a1647a15dcb1e4e9b1a2be675f89eb636cea"
      },
      {
        "path": "src/utils/triviaDatabase.ts",
        "sha256": "b0936126943342917ad8f626736bc0492156aa5ea8d0f8a03bebf98f9dc01b17"
      },
      {
        "path": "tests/ci-parity.ts",
        "sha256": "8f3817f015ce00f39ce5b3c7b44e7f900417056594884cb5583239f0572ce3ce"
      },
      {
        "path": "tests/code-scan.ts",
        "sha256": "cee0f261c8f0b030372a2fec78ac1920f59aa13b5b1c5e734c8ceabc300f1032"
      },
      {
        "path": "tests/e2e/smoke.spec.ts",
        "sha256": "545b7514a624f95f68abe4615727e5ed0e5530e98b3466d7e2110672236246e2"
      },
      {
        "path": "tests/red-drills.ts",
        "sha256": "31112b45114e020c0088a85a5978f3e0ed00decdca51e58637ec5f241bfbabd7"
      },
      {
        "path": "tests/tsconfig.json",
        "sha256": "127aeba35e3200543ac2a1f6a4c85f5496d9b14e65e928013111b23ea22309cf"
      },
      {
        "path": "tests/unit/sceneFrames.test.tsx",
        "sha256": "e49ddfcf9e838bbaec8d35b9d2eae45775fb60b1e9ae79fcab42171c86eb7103"
      },
      {
        "path": "tests/unit/triviaDatabase.test.ts",
        "sha256": "300fbe4c3928570d2234bb3dedf4f0b2eed6f39b3241a143abfd070a83e88529"
      },
      {
        "path": "tests/unit/uiPrimitives.test.tsx",
        "sha256": "f759885389a54dd5996e40c2228f16d47a54c5410d88d794faadeafdb92ec28c"
      },
      {
        "path": "tsconfig.json",
        "sha256": "45103522a5fe2bb9b16e1973ba967caf831e3238f87124f3ea569dd4bea35ba7"
      },
      {
        "path": "tsconfig.node.json",
        "sha256": "eae28b457e36032113b04b86feaedb7be1fb063b2ce26247142976f9bb6016be"
      },
      {
        "path": "vite.config.ts",
        "sha256": "fd2029fd6f6a6a916a0317660ba9343438f27b9984c4c7c94a3c2969ad5cf2f0"
      },
      {
        "path": "vitest.config.ts",
        "sha256": "5eac76ca4a13b7d951d40b3ab71be7dddb516257c50f859d1af337621ef4e710"
      }
    ],
    "environment": {
      "platform": "windows",
      "tools": {
        "python": "3.14.0",
        "node": "v24.20.0",
        "npm": "11.19.0",
        "typescript": "6.0.3",
        "eslint": "10.9.0",
        "vitest": "4.1.11",
        "playwright": "1.63.0",
        "react-three-test-renderer": "9.1.1",
        "gitleaks": "8.30.1",
        "actionlint": "1.7.12",
        "zizmor": "1.25.2",
        "osv-scanner": "2.6.0",
        "opengrep-core": "1.30.0",
        "pre-commit": "4.5.1"
      }
    },
    "verified_tasks": [
      "TASK-GATES",
      "TASK-BEHAVIOR",
      "TASK-DOCS"
    ],
    "pending_operations": [],
    "next_action": "Observe the pushed documentation head checks; resolve the Icons8 credential and explicitly authorize reviewed history remediation before merge/release clearance.",
    "source_revision": "89b17a1dc38603228ebeb42502494c6143d0d4ed"
  }
}
```
