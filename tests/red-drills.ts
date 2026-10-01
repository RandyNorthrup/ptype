import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const npmCli = process.env["npm_execpath"];
if (!npmCli) throw new Error("Run red drills through npm run test:red");
const scratch = mkdtempSync(path.join(tmpdir(), "ptype-red-"));
if (
  path.dirname(scratch) !== tmpdir() ||
  !path.basename(scratch).startsWith("ptype-red-")
) {
  throw new Error(
    "Refusing cleanup outside the drill-owned temporary directory",
  );
}
const sourceDirectories = new Set([
  "src",
  "tests",
  "docs",
  ".github",
  "public",
]);
const records: Record<string, unknown>[] = [];
const selectedDrill = process.argv[2];

function digest(bytes: Buffer | null) {
  return bytes === null
    ? null
    : createHash("sha256").update(bytes).digest("hex");
}

function execute(args: string[]) {
  const result = spawnSync(process.execPath, [npmCli ?? "", ...args], {
    cwd: scratch,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  if (result.error || result.signal || result.status === null) {
    throw new Error(`Drill command did not complete: ${args.join(" ")}`, {
      cause: result.error,
    });
  }
  return { exit: result.status, output: result.stdout + result.stderr };
}

function drill(
  name: string,
  files: string[],
  command: string[],
  mutate: () => void,
  expected: RegExp,
  isAggregate = false,
) {
  if (selectedDrill && name !== selectedDrill) return;
  const check = isAggregate ? ["run", "quality:static"] : command;
  const before = files.map((file) => {
    const absolute = path.join(scratch, file);
    return {
      path: file,
      bytes: existsSync(absolute) ? readFileSync(absolute) : null,
    };
  });
  const baseline = execute(check);
  if (baseline.exit !== 0) {
    throw new Error(`${name}: baseline failed\n${baseline.output}`);
  }
  let red: ReturnType<typeof execute> | undefined;
  let mutated: { path: string; sha256: string | null }[] | undefined;
  const failures: unknown[] = [];
  try {
    mutate();
    mutated = files.map((file) => ({
      path: file,
      sha256: digest(readFileSync(path.join(scratch, file))),
    }));
    if (
      mutated.every(
        (file, index) => file.sha256 === digest(before[index]?.bytes ?? null),
      )
    ) {
      throw new Error(`${name}: mutation changed no bytes`);
    }
    red = execute(check);
    if (red.exit === 0 || !expected.test(red.output)) {
      throw new Error(
        `${name}: intended diagnostic missing or mutation survived\n${red.output}`,
      );
    }
  } catch (error: unknown) {
    failures.push(error);
  } finally {
    for (const file of before) {
      try {
        const absolute = path.join(scratch, file.path);
        if (file.bytes === null) rmSync(absolute, { force: true });
        else writeFileSync(absolute, file.bytes);
        const restored = existsSync(absolute) ? readFileSync(absolute) : null;
        if (digest(restored) !== digest(file.bytes)) {
          failures.push(
            new Error(`${name}: exact restoration failed for ${file.path}`),
          );
        }
      } catch (error: unknown) {
        failures.push(error);
      }
    }
    try {
      const restored = execute(check);
      if (restored.exit !== 0)
        failures.push(
          new Error(`${name}: restored gate failed\n${restored.output}`),
        );
    } catch (error: unknown) {
      failures.push(error);
    }
  }
  if (failures.length > 0)
    throw new AggregateError(failures, `${name}: red drill failed`);
  if (!red || !mutated)
    throw new Error(`${name}: missing completed drill evidence`);
  records.push({
    name,
    command: check,
    isAggregate,
    baseline_exit: baseline.exit,
    mutated_exit: red.exit,
    restored_exit: 0,
    expected_diagnostic: expected.source,
    observed_diagnostic: red.output,
    before: before.map((file) => ({
      path: file.path,
      sha256: digest(file.bytes),
    })),
    mutated,
    after: before.map((file) => ({
      path: file.path,
      sha256: digest(file.bytes),
    })),
  });
  process.stdout.write(
    `PASS ${name}: green -> intended red (${String(red.exit)}) -> exact restored green\n`,
  );
}

function append(file: string, content: string) {
  const absolute = path.join(scratch, file);
  const previous = existsSync(absolute) ? readFileSync(absolute, "utf8") : "";
  writeFileSync(absolute, previous + content);
}

function replace(file: string, original: string, replacement: string) {
  const absolute = path.join(scratch, file);
  const text = readFileSync(absolute, "utf8");
  if (text.split(original).length !== 2) {
    throw new Error(`Mutation must apply exactly once: ${file}: ${original}`);
  }
  writeFileSync(
    absolute,
    text.replace(original, () => replacement),
  );
}

try {
  const entries = readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() || sourceDirectories.has(entry.name)) {
      cpSync(path.join(root, entry.name), path.join(scratch, entry.name), {
        recursive: true,
      });
    }
  }
  symlinkSync(
    path.join(root, "node_modules"),
    path.join(scratch, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const gitInit = spawnSync("git", ["init", "--quiet"], {
    cwd: scratch,
    encoding: "utf8",
  });
  if (gitInit.error || gitInit.status !== 0)
    throw new Error("Could not initialize the isolated drill repository", {
      cause: gitInit.error,
    });

  const canary = "src/quality-canary.ts";
  const lint = ["exec", "--", "eslint", "src", "--max-warnings=0"];
  drill(
    "formatting",
    [canary],
    ["run", "format:check"],
    () => {
      append(canary, "export const canary=1;");
    },
    /Code style issues found/,
  );
  drill(
    "ignored promise and aggregate propagation",
    [canary],
    lint,
    () => {
      append(canary, "export function canary() {\n  Promise.resolve();\n}\n");
    },
    /@typescript-eslint\/no-floating-promises/,
    true,
  );
  drill(
    "exhaustive union",
    [canary],
    lint,
    () => {
      append(
        canary,
        'export function canary(value: "a" | "b") {\n  switch (value) {\n    case "a": return;\n  }\n}\n',
      );
    },
    /switch-exhaustiveness-check/,
  );
  drill(
    "self comparison",
    [canary],
    lint,
    () => {
      append(
        canary,
        "export function canary(value: number) { return value === value; }\n",
      );
    },
    /no-self-compare/,
  );
  drill(
    "strict types",
    [canary],
    ["run", "typecheck"],
    () => {
      append(canary, 'export const canary: number = "wrong";\n');
    },
    /TS2322/,
  );
  drill(
    "unused export",
    ["src/types.ts"],
    ["run", "deadcode"],
    () => {
      append("src/types.ts", "\nexport const qualityUnusedCanary = 1;\n");
    },
    /qualityUnusedCanary/,
  );
  drill(
    "unused dependency",
    ["package.json"],
    ["run", "deadcode"],
    () => {
      const file = path.join(scratch, "package.json");
      const data: unknown = JSON.parse(readFileSync(file, "utf8"));
      if (
        typeof data !== "object" ||
        data === null ||
        !("devDependencies" in data) ||
        typeof data.devDependencies !== "object" ||
        data.devDependencies === null
      )
        throw new Error("Invalid package fixture");
      Object.assign(data.devDependencies, { picomatch: "4.0.3" });
      writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    },
    /Unused devDependencies[\s\S]*picomatch/,
  );
  drill(
    "duplication",
    ["src/quality-duplicate.ts"],
    ["run", "duplicates"],
    () => {
      append(
        "src/quality-duplicate.ts",
        readFileSync(path.join(scratch, "src/utils/logger.ts"), "utf8"),
      );
    },
    /Clone found/,
  );
  drill(
    "cycles",
    ["src/main.tsx", "src/quality-cycle-a.ts", "src/quality-cycle-b.ts"],
    ["run", "cycles"],
    () => {
      append("src/main.tsx", '\nimport "./quality-cycle-a";\n');
      append("src/quality-cycle-a.ts", 'import "./quality-cycle-b";\n');
      append("src/quality-cycle-b.ts", 'import "./quality-cycle-a";\n');
    },
    /Circular Dependencies[\s\S]*quality-cycle/,
  );
  drill(
    "CSS",
    ["src/index.css"],
    ["run", "lint:css"],
    () => {
      append("src/index.css", "\n.quality-canary { invalid-property: 1; }\n");
    },
    /property-no-unknown/,
  );
  drill(
    "HTML",
    ["index.html"],
    ["run", "lint:html"],
    () => {
      replace(
        "index.html",
        "</body>",
        '<div id="canary"></div><div id="canary"></div></body>',
      );
    },
    /id-unique/,
  );
  drill(
    "workflow security",
    [".github/workflows/quality.yml"],
    ["run", "lint:workflows"],
    () => {
      replace(
        ".github/workflows/quality.yml",
        "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
        "actions/checkout@main",
      );
    },
    /unpinned-uses/,
  );
  drill(
    "workflow syntax",
    [".github/workflows/quality.yml"],
    ["run", "lint:workflows"],
    () => {
      replace(
        ".github/workflows/quality.yml",
        "timeout-minutes: 45",
        "invalid-job-key: 45",
      );
    },
    /unexpected key/,
  );
  drill(
    "code execution SAST",
    [canary],
    ["run", "security:code"],
    () => {
      append(canary, 'eval("synthetic canary");\n');
    },
    /browser-code-execution/,
  );
  drill(
    "HTML injection SAST",
    [canary],
    ["run", "security:code"],
    () => {
      append(canary, 'document.body.innerHTML = "synthetic canary";\n');
    },
    /browser-unsafe-html/,
  );
  drill(
    "JSX injection SAST",
    ["src/quality-canary.tsx"],
    ["run", "security:code"],
    () => {
      append(
        "src/quality-canary.tsx",
        '<div dangerouslySetInnerHTML={{ __html: "synthetic" }} />;\n',
      );
    },
    /browser-unsafe-html/,
  );
  drill(
    "test discovery",
    ["vitest.config.ts"],
    ["run", "test:unit"],
    () => {
      replace(
        "vitest.config.ts",
        "tests/unit/**/*.test.{ts,tsx}",
        "tests/not-present/**/*.test.ts",
      );
    },
    /No test files found/,
  );
  drill(
    "coverage floor",
    ["vitest.config.ts"],
    ["run", "test"],
    () => {
      replace("vitest.config.ts", "branches: 82", "branches: 100");
    },
    /Coverage for branches[\s\S]*global threshold/,
  );
  for (const gate of ["security:deps", "security:osv"]) {
    drill(
      gate,
      ["package-lock.json"],
      ["run", gate],
      () => {
        const file = path.join(scratch, "package-lock.json");
        const data: unknown = JSON.parse(readFileSync(file, "utf8"));
        if (
          typeof data !== "object" ||
          data === null ||
          !("packages" in data) ||
          typeof data.packages !== "object" ||
          data.packages === null
        )
          throw new Error("Invalid lock fixture");
        Object.assign(data.packages, {
          "node_modules/lodash": { version: "4.17.20" },
        });
        writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
      },
      /lodash/,
    );
  }
  drill(
    "trivia retry",
    ["src/utils/triviaDatabase.ts"],
    ["run", "test:unit", "--", "tests/unit/triviaDatabase.test.ts"],
    () => {
      replace(
        "src/utils/triviaDatabase.ts",
        "this.triviaData = null;",
        "this.triviaData = {};",
      );
    },
    /retries failed loads[\s\S]*AssertionError/,
  );
  drill(
    "trivia answer boundary",
    ["src/utils/triviaDatabase.ts"],
    ["run", "test:unit", "--", "tests/unit/triviaDatabase.test.ts"],
    () => {
      replace(
        "src/utils/triviaDatabase.ts",
        'value["correct"] >= value["options"].length',
        'value["correct"] > value["options"].length',
      );
    },
    /rejects malformed question content[\s\S]*promise resolved/,
  );
  drill(
    "modal focus containment",
    ["src/components/ModalShell.tsx"],
    ["run", "test:unit", "--", "tests/unit/uiPrimitives.test.tsx"],
    () => {
      replace(
        "src/components/ModalShell.tsx",
        "!event.shiftKey && document.activeElement === last",
        "event.shiftKey && document.activeElement === last",
      );
    },
    /contains forward and reverse focus[\s\S]*toHaveFocus/,
  );
  drill(
    "word scoring",
    ["src/types.ts"],
    ["run", "test:unit", "--", "tests/unit/TypingHandler.test.tsx"],
    () => {
      replace(
        "src/types.ts",
        "POINTS_PER_CHARACTER: 10",
        "POINTS_PER_CHARACTER: 11",
      );
    },
    /TypingHandler[\s\S]*AssertionError/,
  );
  drill(
    "secret detection",
    [canary],
    ["run", "security:files"],
    () => {
      const syntheticKey = ["AKIA", "J7K2M4N6P8Q3R5S9"].join("");
      append(canary, `export const syntheticCredential = "${syntheticKey}";\n`);
    },
    /generic-api-key/,
  );
  const frames = ["run", "test:unit", "--", "tests/unit/sceneFrames.test.tsx"];
  drill(
    "Pages project asset base",
    ["src/utils/publicAssetUrl.ts"],
    ["run", "test:unit", "--", "tests/unit/publicAssetUrl.test.ts"],
    () => {
      replace(
        "src/utils/publicAssetUrl.ts",
        "${import.meta.env.BASE_URL}",
        "/",
      );
    },
    /keeps models, data, and icons[\s\S]*AssertionError/,
  );
  drill(
    "development CSP nonce",
    ["vite.config.ts"],
    ["run", "test:browser:dev"],
    () => {
      replace(
        "vite.config.ts",
        "html: isDevelopment ? { cspNonce: DEVELOPMENT_NONCE_PLACEHOLDER } : {},",
        "html: {},",
      );
    },
    /development page loads[\s\S]*Expected: > 0/,
  );
  drill(
    "server browser ownership",
    ["vite.config.ts"],
    ["run", "ci:parity"],
    () => {
      replace("vite.config.ts", "open: false", "open: true");
    },
    /CI parity: development and preview must not open a user browser/,
  );
  drill(
    "trivia dismissal deadline",
    ["src/App.tsx"],
    ["run", "test:unit", "--", "tests/unit/App.test.tsx"],
    () => {
      replace(
        "src/App.tsx",
        "triviaDismissDelayMs: 500",
        "triviaDismissDelayMs: 0",
      );
    },
    /coordinates game, trivia[\s\S]*to not be called/,
  );
  drill(
    "Pages required Quality gate",
    ["tests/deployment-gate.ts"],
    ["run", "test:unit", "--", "tests/unit/deploymentGate.test.ts"],
    () => {
      replace(
        "tests/deployment-gate.ts",
        '  "Quality and production browser checks",',
        '  "Build on Linux",',
      );
    },
    /refuses a failed required Quality check[\s\S]*AssertionError/,
  );
  drill(
    "release tag coverage",
    [".github/workflows/quality.yml"],
    ["run", "ci:parity"],
    () => {
      replace(".github/workflows/quality.yml", '    tags: ["v*"]\n', "");
    },
    /CI parity: release tags must run required gates/,
  );
  drill(
    "About version metadata",
    ["src/components/MainMenu.tsx"],
    ["run", "test:unit", "--", "tests/unit/MainMenu.test.tsx"],
    () => {
      replace(
        "src/components/MainMenu.tsx",
        "Version {version}",
        "Version stale",
      );
    },
    /accessible responsive About dialog[\s\S]*Unable to find an element with the text: Version/,
  );
  drill(
    "CI parity",
    [".github/workflows/quality.yml"],
    ["run", "ci:parity"],
    () => {
      replace(
        ".github/workflows/quality.yml",
        "run: npm run quality",
        "run: npm run build",
      );
    },
    /CI parity: quality workflow/,
  );
  drill(
    "conditional CI gate",
    [".github/workflows/quality.yml"],
    ["run", "ci:parity"],
    () => {
      replace(
        ".github/workflows/quality.yml",
        "run: npm run quality",
        "if: false\n        run: npm run quality",
      );
    },
    /CI parity: quality workflow/,
  );
  drill(
    "conditional commit gate",
    [".pre-commit-config.yaml"],
    ["run", "ci:parity"],
    () => {
      replace(
        ".pre-commit-config.yaml",
        "always_run: true",
        "always_run: false",
      );
    },
    /CI parity: commit hooks must always run/,
  );
  drill(
    "inactive actor frames",
    ["src/entities/EnemyShip.tsx"],
    frames,
    () => {
      replace(
        "src/entities/EnemyShip.tsx",
        "!isActive || !groupReference.current",
        "!groupReference.current",
      );
    },
    /freezes actors[\s\S]*AssertionError/,
  );
  drill(
    "actor memo freshness",
    ["src/entities/EnemyShip.tsx"],
    frames,
    () => {
      replace(
        "src/entities/EnemyShip.tsx",
        "memo(EnemyShipComponent)",
        "memo(EnemyShipComponent, () => true)",
      );
    },
    /freezes actors[\s\S]*AssertionError/,
  );
  drill(
    "delayed spawn state",
    ["src/components/GameCanvas.tsx"],
    frames,
    () => {
      replace(
        "src/components/GameCanvas.tsx",
        "const spawnFirstEnemy = useEffectEvent(() => {\n    if (!isActive) return;",
        "const spawnFirstEnemy = useEffectEvent(() => {\n    if (isActive) return;",
      );
    },
    /freezes actors[\s\S]*to not be called/,
  );
  drill(
    "live letter targeting",
    ["src/components/LaserTargetHelper.tsx"],
    frames,
    () => {
      replace(
        "src/components/LaserTargetHelper.tsx",
        "letter.getWorldPosition(vec3.current).project(camera)",
        "vec3.current.set(0, 0, 0).project(camera)",
      );
    },
    /projects the live letter mesh[\s\S]*AssertionError/,
  );
  drill(
    "destruction animation",
    ["src/entities/EnemyShip.tsx"],
    frames,
    () => {
      replace(
        "src/entities/EnemyShip.tsx",
        "!isActive || !groupReference.current",
        "!isActive || !groupReference.current || isDestroyingReference.current",
      );
    },
    /animates destruction particles[\s\S]*AssertionError/,
  );
  mkdirSync(path.join(root, "docs/verification"), { recursive: true });
  if (records.length === 0) throw new Error("No matching red drills selected");
  writeFileSync(
    path.join(root, "docs/verification/red-summary.json"),
    JSON.stringify(records, null, 2) + "\n",
  );
} finally {
  // This directory was created by this invocation, never the user's checkout.
  rmSync(scratch, { recursive: true, force: true });
}
