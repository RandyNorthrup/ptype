import {
  useEffect,
  useEffectEvent,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

const TUNING = {
  defaultLayer: 3000,
} as const;

interface ModalShellProperties {
  children: ReactNode;
  labelledBy: string;
  onDismiss: () => void;
  overlayTestId?: string;
  dialogTestId?: string;
  maxWidth?: CSSProperties["maxWidth"];
  zIndex?: number;
}

function stopPropagation(event: ReactMouseEvent<HTMLDivElement>) {
  event.stopPropagation();
}

export function ModalShell({
  children,
  labelledBy,
  onDismiss,
  overlayTestId,
  dialogTestId,
  maxWidth = "600px",
  zIndex = TUNING.defaultLayer,
}: ModalShellProperties) {
  const dialogReference = useRef<HTMLDivElement>(null);
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    dialogReference.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogReference.current;
      const dialogs = document.querySelectorAll(
        '[role="dialog"][aria-modal="true"]',
      );
      if (!dialog || dialogs.item(dialogs.length - 1) !== dialog) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>(
          'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]',
        ),
      ].filter(
        (element) =>
          element.tabIndex >= 0 &&
          !element.matches(":disabled") &&
          !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
          getComputedStyle(element).display !== "none" &&
          getComputedStyle(element).visibility !== "hidden",
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      if (
        !dialog.contains(document.activeElement) ||
        document.activeElement === dialog
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, []);

  return (
    <div
      className="modal-overlay"
      data-testid={overlayTestId}
      style={{ zIndex }}
      onClick={onDismiss}
    >
      <div
        aria-labelledby={labelledBy}
        aria-modal="true"
        className="modal-dialog"
        data-testid={dialogTestId}
        ref={dialogReference}
        role="dialog"
        style={{ maxWidth }}
        tabIndex={-1}
        onClick={stopPropagation}
      >
        {children}
      </div>
    </div>
  );
}
