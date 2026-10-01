/**
 * MainMenu Component - Matches Python desktop app layout
 */
import {
  useState,
  useRef,
  useEffect,
  memo,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useGameStore } from "../store/gameContext";
import { GameMode, ProgrammingLanguage } from "../types";
import { PlayerStatsModal } from "./PlayerStatsModal";
import { SettingsMenu } from "./SettingsMenu";
import { error as logError } from "../utils/logger";
import { ModalShell } from "./ModalShell";
import { NeonButton } from "./NeonButton";

const TUNING = {
  unselectedModeOpacity: 0.85,
} as const;

const SECONDARY_BUTTON_STYLE: CSSProperties = {
  padding: "0.6rem 0.8rem",
  fontSize: "0.8rem",
  background: "rgba(10, 14, 27, 0.7)",
  border: "2px solid rgba(9, 255, 0, 0.3)",
  borderRadius: "8px",
  color: "#09ff00",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s",
  boxShadow: "0 0 10px rgba(9, 255, 0, 0.2)",
  flex: 1,
};

function handleSecondaryButtonEnter(
  event: ReactMouseEvent<HTMLButtonElement>,
): void {
  event.currentTarget.style.borderColor = "#09ff00";
  event.currentTarget.style.boxShadow = "0 0 20px rgba(9, 255, 0, 0.4)";
  event.currentTarget.style.transform = "translateY(-2px)";
}

function handleSecondaryButtonLeave(
  event: ReactMouseEvent<HTMLButtonElement>,
): void {
  event.currentTarget.style.borderColor = "rgba(9, 255, 0, 0.3)";
  event.currentTarget.style.boxShadow = "0 0 10px rgba(9, 255, 0, 0.2)";
  event.currentTarget.style.transform = "translateY(0)";
}

function SecondaryMenuButton({
  children,
  onClick,
  testId,
}: {
  children: ReactNode;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      style={SECONDARY_BUTTON_STYLE}
      onMouseEnter={handleSecondaryButtonEnter}
      onMouseLeave={handleSecondaryButtonLeave}
    >
      {children}
    </button>
  );
}

const MainMenuComponent = () => {
  const { startGame } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<string>("Choose a Mode");
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownReference = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownReference.current &&
        !dropdownReference.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleStartNewGame = () => {
    if (selectedMode === "Choose a Mode") {
      return; // Button is disabled
    }

    try {
      if (selectedMode === "Normal") {
        startGame(GameMode.NORMAL);
      } else {
        // It's a programming language
        const lang = selectedMode as ProgrammingLanguage;
        startGame(GameMode.PROGRAMMING, lang);
      }
    } catch (error) {
      logError(
        `Failed to start game with mode: ${selectedMode}`,
        error,
        "MainMenu",
      );
    }
  };

  const allModes = [
    "Choose a Mode",
    "Normal",
    ...Object.values(ProgrammingLanguage),
  ];

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "1rem",
        }}
      >
        {/* Logo and Title */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          <img
            src="/assets/images/ptype_logo.png"
            alt="P-Type Logo"
            data-testid="main-menu-logo"
            style={{
              width: "min(280px, 80vw)",
              height: "auto",
              marginBottom: "0.2rem",
              filter: "drop-shadow(0 0 30px rgba(9, 255, 0, 0.8))",
            }}
          />
          <p
            style={{
              fontSize: "1.2rem",
              color: "#09ff00",
              fontWeight: "600",
              textShadow: "0 0 20px rgba(9, 255, 0, 0.6)",
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            THE TYPING GAME
          </p>
        </div>

        {/* Main Action Buttons - Stacked */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.7rem",
            marginBottom: "1rem",
            zIndex: 1,
          }}
        >
          {/* New Game Button */}
          <button
            className="main-menu-control"
            onClick={handleStartNewGame}
            disabled={selectedMode === "Choose a Mode"}
            data-testid="new-game-button"
            style={{
              padding: "0.8rem 2.5rem",
              fontSize: "1.1rem",
              background:
                selectedMode === "Choose a Mode"
                  ? "rgba(30, 41, 59, 0.8)"
                  : "rgba(9, 255, 0, 0.15)",
              border:
                selectedMode === "Choose a Mode"
                  ? "2px solid rgba(100, 116, 139, 0.6)"
                  : "2px solid #09ff00",
              borderRadius: "12px",
              color: selectedMode === "Choose a Mode" ? "#94a3b8" : "#09ff00",
              fontWeight: "700",
              cursor:
                selectedMode === "Choose a Mode" ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              opacity:
                selectedMode === "Choose a Mode"
                  ? TUNING.unselectedModeOpacity
                  : 1,
              textAlign: "center",
              boxShadow:
                selectedMode === "Choose a Mode"
                  ? "none"
                  : "0 0 30px rgba(9, 255, 0, 0.4), inset 0 0 15px rgba(9, 255, 0, 0.1)",
              textShadow:
                selectedMode === "Choose a Mode"
                  ? "none"
                  : "0 0 10px rgba(9, 255, 0, 0.8)",
            }}
            onMouseEnter={(e) => {
              if (selectedMode === "Choose a Mode") {
                return;
              }

              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 0 40px rgba(9, 255, 0, 0.6), inset 0 0 20px rgba(9, 255, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              if (selectedMode !== "Choose a Mode") {
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(9, 255, 0, 0.4), inset 0 0 15px rgba(9, 255, 0, 0.1)";
              }
            }}
          >
            NEW GAME
          </button>

          {/* Custom Mode Dropdown */}
          <div
            className="main-menu-control"
            ref={dropdownReference}
            style={{
              position: "relative",
              zIndex: 100,
            }}
          >
            <button
              aria-controls="mode-selector-dropdown"
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
              }}
              data-testid="mode-selector-button"
              style={{
                width: "100%",
                padding: "0.9rem 1.2rem",
                fontSize: "1.1rem",
                background:
                  "linear-gradient(135deg, rgba(10, 14, 27, 0.95) 0%, rgba(15, 20, 35, 0.95) 100%)",
                border: "2px solid rgba(9, 255, 0, 0.4)",
                borderRadius: "12px",
                color: "#09ff00",
                cursor: "pointer",
                outline: "none",
                transition: "all 0.3s ease",
                fontWeight: "600",
                letterSpacing: "0.5px",
                boxShadow:
                  "0 0 20px rgba(9, 255, 0, 0.3), inset 0 0 15px rgba(9, 255, 0, 0.08)",
                textShadow: "0 0 8px rgba(9, 255, 0, 0.6)",
                backdropFilter: "blur(10px)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#09ff00";
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(9, 255, 0, 0.5), inset 0 0 20px rgba(9, 255, 0, 0.15)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(9, 255, 0, 0.4)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(9, 255, 0, 0.3), inset 0 0 15px rgba(9, 255, 0, 0.08)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span>{selectedMode}</span>
              <span style={{ fontSize: "0.8rem", marginLeft: "0.5rem" }}>
                {dropdownOpen ? "▲" : "▼"}
              </span>
            </button>

            {dropdownOpen && (
              <div
                aria-label="Game mode"
                data-testid="mode-selector-dropdown"
                id="mode-selector-dropdown"
                role="listbox"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: "0.5rem",
                  background:
                    "linear-gradient(135deg, rgba(10, 14, 27, 0.98) 0%, rgba(15, 20, 35, 0.98) 100%)",
                  border: "2px solid rgba(9, 255, 0, 0.4)",
                  borderRadius: "12px",
                  boxShadow:
                    "0 0 30px rgba(9, 255, 0, 0.4), inset 0 0 20px rgba(9, 255, 0, 0.08)",
                  backdropFilter: "blur(10px)",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 1000,
                }}
              >
                {allModes.map((m) => (
                  <button
                    aria-selected={selectedMode === m}
                    key={m}
                    data-testid={`mode-option-${m.toLowerCase().replaceAll(/\s+/g, "-")}`}
                    onClick={() => {
                      setSelectedMode(m);
                      setDropdownOpen(false);
                    }}
                    role="option"
                    style={{
                      width: "100%",
                      padding: "0.8rem 1.2rem",
                      fontSize: "1rem",
                      background:
                        selectedMode === m
                          ? "rgba(9, 255, 0, 0.15)"
                          : "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(9, 255, 0, 0.1)",
                      color: selectedMode === m ? "#ffffff" : "#09ff00",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      fontWeight: selectedMode === m ? "700" : "600",
                      letterSpacing: "0.5px",
                      textShadow:
                        selectedMode === m
                          ? "0 0 10px rgba(9, 255, 0, 0.8)"
                          : "0 0 5px rgba(9, 255, 0, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(9, 255, 0, 0.2)";
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.paddingLeft = "1.5rem";
                      e.currentTarget.style.textShadow =
                        "0 0 10px rgba(9, 255, 0, 0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        selectedMode === m
                          ? "rgba(9, 255, 0, 0.15)"
                          : "transparent";
                      e.currentTarget.style.color =
                        selectedMode === m ? "#ffffff" : "#09ff00";
                      e.currentTarget.style.paddingLeft = "1.2rem";
                      e.currentTarget.style.textShadow =
                        selectedMode === m
                          ? "0 0 10px rgba(9, 255, 0, 0.8)"
                          : "0 0 5px rgba(9, 255, 0, 0.4)";
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Buttons - Uniform width spanning mode dropdown */}
        <div
          className="main-menu-control"
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <SecondaryMenuButton
            onClick={() => {
              setShowStats(!showStats);
            }}
            testId="player-stats-button"
          >
            Player Stats
          </SecondaryMenuButton>

          <SecondaryMenuButton
            onClick={() => {
              setShowSettings(!showSettings);
            }}
            testId="settings-button"
          >
            Settings
          </SecondaryMenuButton>

          <SecondaryMenuButton
            onClick={() => {
              setShowAbout(!showAbout);
            }}
            testId="about-button"
          >
            About
          </SecondaryMenuButton>
        </div>

        {/* Help Panel */}
        <div
          style={{
            background: "rgba(10, 14, 27, 0.8)",
            border: "2px solid rgba(9, 255, 0, 0.3)",
            borderRadius: "10px",
            padding: "0.8rem 1.2rem",
            maxWidth: "550px",
            boxShadow:
              "0 0 20px rgba(9, 255, 0, 0.2), inset 0 0 15px rgba(9, 255, 0, 0.05)",
          }}
        >
          <h3
            style={{
              color: "#09ff00",
              fontSize: "0.95rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
              textAlign: "center",
              textShadow: "0 0 10px rgba(9, 255, 0, 0.6)",
            }}
          >
            ⚡ HOW TO PLAY
          </h3>
          <div
            style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: "1.4" }}
          >
            <p style={{ marginBottom: "0.3rem" }}>
              • Type falling words • TAB to switch targets
            </p>
            <p style={{ marginBottom: "0.3rem" }}>
              • Defeat bosses every 3 levels • Answer trivia every 6 levels for
              bonus items
            </p>
            <p style={{ marginBottom: "0.3rem" }}>
              • <span style={{ color: "#09ff00" }}>ENTER:</span>
              {" EMP • "}
              <span style={{ color: "#09ff00" }}>UP:</span>
              {" Cycle items • "}
              <span style={{ color: "#09ff00" }}>DOWN:</span>
              {" Use item • "}
              <span style={{ color: "#09ff00" }}>ESC:</span> Pause
            </p>
          </div>
        </div>
      </div>

      {/* Unified Player Stats Modal (Stats + High Scores + Achievements) */}
      {showStats && (
        <PlayerStatsModal
          onClose={() => {
            setShowStats(false);
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsMenu
          onClose={() => {
            setShowSettings(false);
          }}
        />
      )}

      {/* About Modal */}
      {showAbout && (
        <ModalShell
          labelledBy="about-title"
          maxWidth="420px"
          zIndex={1000}
          onDismiss={() => {
            setShowAbout(false);
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <h1
              id="about-title"
              style={{
                color: "#fbbf24",
                marginBottom: "0.5rem",
                fontSize: "2rem",
              }}
            >
              P-Type
            </h1>
            <p style={{ color: "#00d4ff", marginBottom: "0.25rem" }}>
              Version 2.0.0
            </p>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              Web Edition
            </p>
            <p
              style={{
                color: "#e2e8f0",
                marginBottom: "0.5rem",
                fontSize: "1.1rem",
              }}
            >
              Created by Randy Northrup
            </p>
            <p style={{ color: "#00d4ff", marginBottom: "2rem" }}>
              © {new Date().getFullYear()}
            </p>
            <NeonButton
              onClick={() => {
                setShowAbout(false);
              }}
            >
              Close
            </NeonButton>
          </div>
        </ModalShell>
      )}
    </>
  );
};

export const MainMenu = memo(MainMenuComponent);
