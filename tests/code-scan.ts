import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

// The native engine avoids the vulnerable JWT dependency in Semgrep's Python CLI.
// Findings do not make the engine exit nonzero, so this adapter enforces that contract.
const binary =
  process.env["PTYPE_OPENGREP"] ??
  (process.platform === "win32"
    ? path.join(
        process.env["LOCALAPPDATA"] ?? "",
        "ptype-quality-tools",
        "opengrep",
        "opengrep-core.exe",
      )
    : "opengrep-core");
const files = readdirSync("src", { recursive: true, encoding: "utf8" })
  .filter((file) => /\.tsx?$/.test(file))
  .map((file) => path.join("src", file))
  .toSorted((left, right) => left.localeCompare(right));
if (files.length === 0)
  throw new Error("SAST discovered no TypeScript source files");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

let findings = 0;
for (const file of files) {
  const result = spawnSync(
    binary,
    ["-json_nodots", "-rules", ".semgrep.yml", "-lang", "ts", file],
    {
      encoding: "utf8",
      timeout: 30_000,
      maxBuffer: 4 * 1024 * 1024,
    },
  );
  if (result.error || result.signal || result.status !== 0) {
    throw new Error(
      `Native SAST failed for ${file}; see docs/DEPLOYMENT.md for tool setup.\n${result.stderr}`,
      { cause: result.error },
    );
  }
  const report: unknown = JSON.parse(result.stdout);
  if (
    !isRecord(report) ||
    !Array.isArray(report["results"]) ||
    !Array.isArray(report["errors"]) ||
    report["errors"].length > 0 ||
    !Array.isArray(report["rules_by_engine"]) ||
    report["rules_by_engine"].length === 0 ||
    !Array.isArray(report["skipped_rules"]) ||
    report["skipped_rules"].length > 0 ||
    !isRecord(report["paths"]) ||
    !Array.isArray(report["paths"]["scanned"]) ||
    report["paths"]["scanned"].length !== 1 ||
    report["paths"]["scanned"][0] !== file
  ) {
    throw new Error(`Incomplete or invalid SAST evidence for ${file}`);
  }
  const results = report["results"];
  for (const finding of results) {
    if (!isRecord(finding) || typeof finding["check_id"] !== "string") {
      throw new Error(`Invalid finding from native SAST for ${file}`);
    }
    findings++;
    process.stdout.write(`${file}: ${finding["check_id"]}\n`);
  }
}
process.stdout.write(
  `SAST scanned ${String(files.length)} files; ${String(findings)} findings.\n`,
);
if (findings > 0) process.exitCode = 1;
