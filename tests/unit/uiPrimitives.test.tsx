import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ModalShell } from "../../src/components/ModalShell";
import { NeonButton } from "../../src/components/NeonButton";

describe("shared UI primitives", () => {
  it("contains forward and reverse focus and excludes unavailable controls", async () => {
    const user = userEvent.setup();
    const dismiss = vi.fn();
    render(
      <ModalShell labelledBy="focus-title" onDismiss={dismiss}>
        <h2 id="focus-title">Focus test</h2>
        <button type="button">First</button>
        <button type="button" disabled>
          Disabled
        </button>
        <button type="button" hidden>
          Hidden
        </button>
        <button type="button" tabIndex={-1}>
          Skipped
        </button>
        <button type="button">Last</button>
      </ModalShell>,
    );
    const first = screen.getByRole("button", { name: "First" });
    const last = screen.getByRole("button", { name: "Last" });
    await user.tab();
    expect(first).toHaveFocus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
    await user.tab();
    expect(first).toHaveFocus();
  });

  it("keeps focus inside an empty modal and preserves it on callback changes", () => {
    const { rerender } = render(
      <ModalShell labelledBy="empty-title" onDismiss={vi.fn()}>
        <h2 id="empty-title">Empty</h2>
      </ModalShell>,
    );
    const dialog = screen.getByRole("dialog");
    const tab = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    fireEvent(dialog, tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(dialog).toHaveFocus();
    const focusedDialog = () => (
      <ModalShell labelledBy="empty-title" onDismiss={vi.fn()}>
        <h2 id="empty-title">Empty</h2>
        <button type="button">Keep focus</button>
      </ModalShell>
    );
    rerender(focusedDialog());
    const button = screen.getByRole("button", { name: "Keep focus" });
    button.focus();
    rerender(focusedDialog());
    expect(button).toHaveFocus();
  });

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
