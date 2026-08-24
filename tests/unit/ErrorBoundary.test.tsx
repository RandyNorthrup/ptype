import axe from "axe-core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";

vi.mock("../../src/utils/logger", () => ({ error: vi.fn() }));

function BrokenChild(): never {
  throw new Error("Test failure");
}

describe("error boundary", () => {
  it("renders an accessible recovery screen after a child failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { container } = render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload game/i })).toBeEnabled();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  it("uses a caller-provided fallback", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <ErrorBoundary fallback={<p>Custom recovery</p>}>
        <BrokenChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Custom recovery")).toBeInTheDocument();
  });
});
