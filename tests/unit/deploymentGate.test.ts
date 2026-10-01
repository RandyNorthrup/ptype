import { describe, expect, it } from "vitest";
import { verifyDeploymentChecks } from "../deployment-gate";

const SHA = "a".repeat(40);
function inventory() {
  return {
    total_count: 4,
    check_runs: [
      "Quality and production browser checks",
      "Build on Windows",
      "Build on macOS",
      "Build on Linux",
    ].map((name, index) => ({
      id: index,
      name,
      head_sha: SHA,
      status: "completed",
      conclusion: "success",
      app: { id: 15_368 },
    })),
  };
}

describe("Pages deployment gate", () => {
  it("accepts exact current main with all trusted successful checks", () => {
    expect(() => {
      verifyDeploymentChecks(inventory(), SHA, SHA);
    }).not.toThrow();
  });

  it("refuses a failed required Quality check", () => {
    const data = inventory();
    const check = data.check_runs[0];
    if (!check) throw new Error("Missing fixture check");
    check.conclusion = "failure";
    expect(() => {
      verifyDeploymentChecks(data, SHA, SHA);
    }).toThrow("Deployment required check is not verified: Quality");
  });

  it("rejects missing, stale, spoofed, and incomplete check inventories", () => {
    expect(() => {
      verifyDeploymentChecks(inventory(), SHA, "b".repeat(40));
    }).toThrow("not current main");
    expect(() => {
      verifyDeploymentChecks({}, SHA, SHA);
    }).toThrow("incomplete");
    const data = inventory();
    const check = data.check_runs[0];
    if (!check) throw new Error("Missing fixture check");
    check.app.id = 1;
    expect(() => {
      verifyDeploymentChecks(data, SHA, SHA);
    }).toThrow("not verified");
    data.check_runs.shift();
    expect(() => {
      verifyDeploymentChecks(data, SHA, SHA);
    }).toThrow("incomplete");
  });

  it("requires the latest check to pass rather than an older success", () => {
    const data = inventory();
    const check = data.check_runs[0];
    if (!check) throw new Error("Missing fixture check");
    data.check_runs.push({ ...check, id: 10, conclusion: "failure" });
    data.total_count++;
    expect(() => {
      verifyDeploymentChecks(data, SHA, SHA);
    }).toThrow("not verified");
  });
});
