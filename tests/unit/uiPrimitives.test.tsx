import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModalShell } from "../../src/components/ModalShell";
import { NeonButton } from "../../src/components/NeonButton";

describe("shared UI primitives", () => {
  it("renders an accessible, dismissible, focus-managed modal", async () => {
    const dismiss = vi.fn();
    const escapedModal = vi.fn();
    window.addEventListener("keydown", escapedModal);
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const { container, unmount } = render(
      <ModalShell labelledBy="title" onDismiss={dismiss}>
        <h2 id="title">Settings</h2>
        <button type="button">Inside</button>
      </ModalShell>,
    );

    const dialog = screen.getByRole("dialog", { name: "Settings" });
    expect(dialog).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Inside" }));
    expect(dismiss).not.toHaveBeenCalled();
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(dismiss).toHaveBeenCalledOnce();
    expect(escapedModal).not.toHaveBeenCalled();
    fireEvent.click(dialog.parentElement!);
    expect(dismiss).toHaveBeenCalledTimes(2);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);

    unmount();
    window.removeEventListener("keydown", escapedModal);
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("renders semantic buttons with defaults and variants", () => {
    const click = vi.fn();
    render(
      <>
        <NeonButton onClick={click}>Primary</NeonButton>
        <NeonButton className="extra" variant="danger">
          Danger
        </NeonButton>
      </>,
    );

    const primary = screen.getByRole("button", { name: "Primary" });
    expect(primary).toHaveAttribute("type", "button");
    fireEvent.click(primary);
    expect(click).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Danger" })).toHaveClass(
      "neon-button-danger",
      "extra",
    );
  });
});
