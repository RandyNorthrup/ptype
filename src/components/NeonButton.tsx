import type { ButtonHTMLAttributes } from "react";

interface NeonButtonProperties extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "muted";
}

export function NeonButton({
  className = "",
  type = "button",
  variant = "primary",
  ...properties
}: NeonButtonProperties) {
  return (
    <button
      className={`neon-button neon-button-${variant} ${className}`.trim()}
      type={type}
      {...properties}
    />
  );
}
