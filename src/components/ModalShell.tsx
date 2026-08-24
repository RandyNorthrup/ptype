import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

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
  zIndex = 3000,
}: ModalShellProperties) {
  const dialogReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    dialogReference.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [onDismiss]);

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
