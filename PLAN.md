# Quality retrofit plan

Extend the existing strict configuration and tests; do not create a second application path. New responsibilities are the repeatable drill harness, production-browser tests, pinned external security tools, and evidence records. The owner reiterated authorization after the baseline incident finding, so independent work continues while credential clearance remains open. Existing formatting and blame-ignore history are retained because the baseline formatter was already clean.

Canonical source and consumers were inspected in src/components, src/entities, src/store, src/utils, tests/unit, and existing configs. Keep constants beside their domain owners. Keep independent test expectations literal. Plan changes and receipts live only in the ledger below; detailed findings remain in docs/QUALITY-RETROFIT.md.

The semantic review found inactive actors, stale memo/laser data, and frozen destruction particles. The existing actor, game loop, and ID owner now provide those contracts; official scene tests exercise real callbacks with I/O boundaries mocked. This scope amendment is covered by the owner's authorized quality refactors. Browser automation is muted per the owner's steering. Historical credential clearance remains separate and unresolved.

```quality-ledger
{
  "schema_version": 1,
  "work": {
    "id": "WORK-RETROFIT",
    "title": "Complete P-Type quality retrofit",
    "scope_revision": 2,
    "brief": null,
    "brief_reason": "Quality-only retrofit of the documented existing browser game, explicitly authorized by its owner.",
    "rules": [
      {
        "path": "AGENTS.md",
        "revision": "2"
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
        "opengrep-core": "1.30.0"
      }
    }
  },
  "requirements": [
    {
      "id": "REQ-GATES",
      "statement": "Working-source gates, dependency audits, workflow checks, production browser journeys, and maintained drills pass; representative defects fail with exact restoration.",
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
      "then": "Working-source gates, dependency audits, workflow checks, production browser journeys, and maintained drills pass; representative defects fail with exact restoration.",
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
      "purpose": "Working-source gates, dependency audits, workflow checks, production browser journeys, and maintained drills pass; representative defects fail with exact restoration.",
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
        }
      ],
      "status": "active",
      "evidence": [
        "EV-READY-AC-GATES",
        "EV-READY2-AC-GATES"
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
      "status": "active",
      "evidence": [
        "EV-READY-AC-BEHAVIOR",
        "EV-READY2-AC-BEHAVIOR"
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
        }
      ],
      "status": "active",
      "evidence": [
        "EV-READY-AC-DOCS",
        "EV-READY2-AC-DOCS"
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
        "EV-READY2-AC-HISTORY"
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
      "status": "pass",
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
      "reason": null
    },
    {
      "id": "EV-READY2-AC-BEHAVIOR",
      "acceptance": [
        "AC-BEHAVIOR"
      ],
      "kind": "readiness",
      "status": "pass",
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
      "reason": null
    },
    {
      "id": "EV-READY2-AC-DOCS",
      "acceptance": [
        "AC-DOCS"
      ],
      "kind": "readiness",
      "status": "pass",
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
      "reason": null
    },
    {
      "id": "EV-READY2-AC-HISTORY",
      "acceptance": [
        "AC-HISTORY"
      ],
      "kind": "readiness",
      "status": "pass",
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
      "reason": null
    }
  ],
  "checkpoint": null
}
```
