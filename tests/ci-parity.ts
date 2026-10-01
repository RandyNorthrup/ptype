import { readFileSync } from "node:fs";
import { load } from "js-yaml";

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("Invalid CI parity input");
  return value as Record<string, unknown>;
}

function workflow(file: string) {
  const yaml: unknown = load(readFileSync(file, "utf8"));
  return record(yaml);
}

function workflowJob(file: string, name: string) {
  return record(record(workflow(file)["jobs"])[name]);
}

function steps(job: Record<string, unknown>) {
  const value = job["steps"];
  if (!Array.isArray(value) || value.length === 0)
    throw new Error("CI job has no steps");
  return value.map((step: unknown) => record(step));
}

function requireCommand(
  job: Record<string, unknown>,
  command: string,
  diagnostic: string,
) {
  const step = steps(job).find((candidate) => candidate["run"] === command);
  if (
    !step ||
    step["if"] !== undefined ||
    step["continue-on-error"] !== undefined ||
    job["if"] !== undefined ||
    job["continue-on-error"] !== undefined
  ) {
    throw new Error(diagnostic);
  }
}
requireCommand(
  workflowJob(".github/workflows/quality.yml", "quality"),
  "npm run quality",
  "CI parity: quality workflow must run the unconditional local quality aggregate",
);
for (const file of [
  ".github/workflows/quality.yml",
  ".github/workflows/build-multiplatform.yml",
]) {
  const tags = record(record(workflow(file)["on"])["push"])["tags"];
  if (!Array.isArray(tags) || !tags.includes("v*")) {
    throw new Error(
      `CI parity: release tags must run required gates in ${file}`,
    );
  }
  requireCommand(
    workflowJob(file, file.includes("multiplatform") ? "build" : "quality"),
    "npm ci --ignore-scripts",
    `CI parity: required locked install in ${file}`,
  );
}
requireCommand(
  workflowJob(".github/workflows/build-multiplatform.yml", "build"),
  "npm run build",
  "CI parity: platform matrix must use the unconditional local build gate",
);
const pagesBuild = workflowJob(".github/workflows/pages.yml", "build");
if (
  steps(pagesBuild).every((step) => step["run"] !== "npm run build") ||
  steps(pagesBuild).every(
    (step) =>
      typeof step["run"] !== "string" ||
      !step["run"].includes("node tests/deployment-gate.ts"),
  )
) {
  throw new Error(
    "CI parity: Pages must verify required checks and use the local build",
  );
}

const packageData: unknown = JSON.parse(readFileSync("package.json", "utf8"));
const scripts = record(record(packageData)["scripts"]);
if (
  scripts["quality"] !== "npm run quality:code && npm run security:secrets" ||
  scripts["quality:code"] !==
    "npm run quality:static && npm run test:red && npm run test:browser"
) {
  throw new Error(
    "CI parity: required code, drills, browser, or history aggregate changed",
  );
}
const staticScript = scripts["quality:static"];
if (typeof staticScript !== "string")
  throw new Error("CI parity: missing static aggregate");
const commands = new Set(staticScript.split(" && "));
for (const command of [
  "format:check",
  "lint",
  "lint:css",
  "lint:html",
  "typecheck",
  "test",
  "deadcode",
  "cycles",
  "duplicates",
  "security:deps",
  "lint:workflows",
  "security:files",
  "security:code",
  "security:osv",
  "build",
  "ci:parity",
]) {
  if (!commands.has(`npm run ${command}`))
    throw new Error(`CI parity: required local gate missing: ${command}`);
}

const hooksYaml: unknown = load(
  readFileSync(".pre-commit-config.yaml", "utf8"),
);
const repositories = record(hooksYaml)["repos"];
if (!Array.isArray(repositories))
  throw new Error("CI parity: missing commit hooks");
const local = repositories
  .map((repo: unknown) => record(repo))
  .find((repo) => repo["repo"] === "local");
const hooks = local?.["hooks"];
const gateHook = Array.isArray(hooks)
  ? hooks
      .map((hook: unknown) => record(hook))
      .find((hook) => hook["entry"] === "npm run quality:code")
  : undefined;
if (
  gateHook?.["always_run"] !== true ||
  gateHook["pass_filenames"] !== false ||
  gateHook["language"] !== "system" ||
  gateHook["stages"] !== undefined ||
  gateHook["files"] !== undefined ||
  gateHook["exclude"] !== undefined
) {
  throw new Error(
    "CI parity: commit hooks must always run the complete code gate aggregate",
  );
}
process.stdout.write(
  "CI parity passed: local aggregates, CI workflows, locked installs, and commit code gates match.\n",
);
