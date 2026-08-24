/**
 * PauseMenu - Overlay displayed when game is paused (ESC key)
 */
import { memo, useState } from "react";
import { useGameStore } from "../store/gameContext";
import { SettingsMenu } from "./SettingsMenu";
import { NeonButton } from "./NeonButton";
import { ModalShell } from "./ModalShell";

interface PauseMenuProperties {
  onResume: () => void;
  onMainMenu: () => void;
}

const PauseMenuComponent = ({ onResume, onMainMenu }: PauseMenuProperties) => {
  const { level, score, wpm, accuracy } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return (
      <SettingsMenu
        onClose={() => {
          setShowSettings(false);
        }}
      />
    );
  }

  return (
    <ModalShell
      dialogTestId="pause-menu-dialog"
      labelledBy="pause-title"
      maxWidth="400px"
      overlayTestId="pause-menu-overlay"
      zIndex={1000}
      onDismiss={onResume}
    >
      {/* Header */}
      <h1
        id="pause-title"
        style={{
          color: "#09ff00",
          fontSize: "2.5rem",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "1.5rem",
          textShadow: "0 0 20px rgba(9, 255, 0, 0.8)",
        }}
      >
        ⏸️ PAUSED
      </h1>

      {/* Current Stats */}
      <div
        style={{
          background: "rgba(10, 14, 27, 0.7)",
          border: "1px solid rgba(100, 116, 139, 0.4)",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              Level
            </p>
            <p
              style={{
                color: "#09ff00",
                fontSize: "1.5rem",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {level}
            </p>
          </div>
          <div>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              Score
            </p>
            <p
              style={{
                color: "#fbbf24",
                fontSize: "1.5rem",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {score.toLocaleString()}
            </p>
          </div>
          <div>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              WPM
            </p>
            <p
              style={{
                color: "#00d4ff",
                fontSize: "1.5rem",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {wpm}
            </p>
          </div>
          <div>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              Accuracy
            </p>
            <p
              style={{
                color: "#a78bfa",
                fontSize: "1.5rem",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {accuracy.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Menu Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <NeonButton onClick={onResume} data-testid="pause-resume-button">
          ▶️ Resume Game
        </NeonButton>

        <NeonButton
          onClick={() => {
            setShowSettings(true);
          }}
          data-testid="pause-settings-button"
          variant="secondary"
        >
          ⚙️ Settings
        </NeonButton>

        <NeonButton
          onClick={onMainMenu}
          data-testid="pause-main-menu-button"
          variant="danger"
        >
          🏠 Main Menu
        </NeonButton>
      </div>

      {/* Hint */}
      <p
        style={{
          textAlign: "center",
          marginTop: "1.5rem",
          color: "#64748b",
          fontSize: "0.85rem",
        }}
      >
        Press ESC to resume
      </p>
    </ModalShell>
  );
};

export const PauseMenu = memo(PauseMenuComponent);
