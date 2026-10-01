import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const ACTIONS_APP_ID = 15_368;
const REQUIRED_CHECKS = [
  "Quality and production browser checks",
  "Build on Windows",
  "Build on macOS",
  "Build on Linux",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Verify exact current main source and its latest trusted required checks.
 */
export function verifyDeploymentChecks(
  report: unknown,
  sourceSha: string,
  currentMainSha: string,
): void {
  if (sourceSha !== currentMainSha || !/^[a-f\d]{40}$/iu.test(sourceSha)) {
    throw new Error("Deployment source is not current main");
  }
  if (
    !isRecord(report) ||
    !Array.isArray(report["check_runs"]) ||
    report["total_count"] !== report["check_runs"].length
  ) {
    throw new Error("Deployment check inventory is incomplete");
  }
  const checks = report["check_runs"].filter(isRecord);
  if (checks.length !== report["check_runs"].length) {
    throw new Error("Deployment check inventory is invalid");
  }
  if (checks.some((check) => !Number.isSafeInteger(check["id"]))) {
    throw new Error("Deployment check identities are invalid");
  }
  for (const name of REQUIRED_CHECKS) {
    const check = checks
      .filter((candidate) => candidate["name"] === name)
      .toSorted((left, right) => Number(right["id"]) - Number(left["id"]))[0];
    if (
      check?.["head_sha"] !== sourceSha ||
      check["status"] !== "completed" ||
      check["conclusion"] !== "success" ||
      !isRecord(check["app"]) ||
      check["app"]["id"] !== ACTIONS_APP_ID
    ) {
      throw new Error(`Deployment required check is not verified: ${name}`);
    }
  }
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  const [file, sourceSha, mainSha] = process.argv.slice(2);
  if (!file || !sourceSha || !mainSha) {
    throw new Error(
      "Provide check inventory, source SHA, and current main SHA",
    );
  }
  const report: unknown = JSON.parse(readFileSync(file, "utf8"));
  verifyDeploymentChecks(report, sourceSha, mainSha);
  process.stdout.write(
    "Deployment gate passed for exact verified main source.\n",
  );
}
