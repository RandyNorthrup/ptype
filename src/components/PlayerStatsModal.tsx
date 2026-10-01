/**
 * PlayerStatsModal - Unified stats, high scores, and achievements display
 * Matches Python version's draw_stats_popup layout
 */
import { memo, type ReactNode } from "react";
import { useGameStore } from "../store/gameContext";
import { ACHIEVEMENTS_DEFINITIONS } from "../utils/achievementsManager";
import { TEST_IDS } from "../utils/testIds";
import { error as logError } from "../utils/logger";
import { ModalShell } from "./ModalShell";
import { NeonButton } from "./NeonButton";

const TUNING = {
  secondsPerHour: 3600,
  secondsPerMinute: 60,
  highScoreLimit: 10,
  podiumSize: 3,
} as const;

interface PlayerStatsModalProperties {
  onClose: () => void;
}

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / TUNING.secondsPerHour);
  const minutes = Math.floor(
    (seconds % TUNING.secondsPerHour) / TUNING.secondsPerMinute,
  );
  if (hours > 0) {
    return `${hours.toString()}h ${minutes.toString()}m`;
  }
  return `${minutes.toString()}m`;
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h3 className="stats-section-heading">{children}</h3>;
}

const PlayerStatsModalComponent = ({ onClose }: PlayerStatsModalProperties) => {
  const { achievements, highScores, stats } = useGameStore();

  // Sort high scores by score (descending)
  const sortedHighScores = highScores.toSorted((a, b) => b.score - a.score);

  const handleClose = () => {
    try {
      onClose();
    } catch (error) {
      logError("Failed to close player stats modal", error, "PlayerStatsModal");
    }
  };

  return (
    <ModalShell
      labelledBy="player-stats-title"
      overlayTestId={TEST_IDS.PLAYER_STATS_MODAL}
      onDismiss={handleClose}
    >
      {/* Header */}
      <h2
        id="player-stats-title"
        style={{
          color: "#09ff00",
          marginBottom: "1.5rem",
          fontSize: "1.8rem",
          fontWeight: "700",
          textAlign: "center",
          textShadow: "0 0 20px rgba(9, 255, 0, 0.8)",
        }}
      >
        📊 PLAYER STATISTICS
      </h2>

      {/* Stats Section */}
      <div
        style={{
          background: "rgba(9, 255, 0, 0.05)",
          border: "1px solid rgba(9, 255, 0, 0.2)",
          borderRadius: "10px",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.8rem",
            color: "#94a3b8",
            fontSize: "0.9rem",
          }}
        >
          <div>
            <span style={{ color: "#64748b" }}>Games Played:</span>
            <span
              style={{
                color: "#09ff00",
                fontWeight: "700",
                marginLeft: "0.5rem",
              }}
            >
              {stats.totalGamesPlayed}
            </span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Total Score:</span>
            <span
              style={{
                color: "#09ff00",
                fontWeight: "700",
                marginLeft: "0.5rem",
              }}
            >
              {stats.totalScore.toLocaleString()}
            </span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Best Score:</span>
            <span
              style={{
                color: "#fbbf24",
                fontWeight: "700",
                marginLeft: "0.5rem",
              }}
            >
              {stats.bestScore.toLocaleString()}
            </span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Best Level:</span>
            <span
              style={{
                color: "#00d4ff",
                fontWeight: "700",
                marginLeft: "0.5rem",
              }}
            >
              {stats.bestLevel}
            </span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Best WPM:</span>
            <span
              style={{
                color: "#a78bfa",
                fontWeight: "700",
                marginLeft: "0.5rem",
              }}
            >
              {stats.bestWPM.toFixed(0)}
            </span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Best Accuracy:</span>
            <span
              style={{
                color: "#09ff00",
                fontWeight: "700",
                marginLeft: "0.5rem",
              }}
            >
              {stats.bestAccuracy.toFixed(1)}%
            </span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Total Time:</span>
            <span
              style={{
                color: "#09ff00",
                fontWeight: "700",
                marginLeft: "0.5rem",
              }}
            >
              {formatPlayTime(stats.totalTimePlayed)}
            </span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Achievements:</span>
            <span
              style={{
                color: "#09ff00",
                fontWeight: "700",
                marginLeft: "0.5rem",
              }}
            >
              {achievements.filter((a) => a.unlocked).length}/
              {ACHIEVEMENTS_DEFINITIONS.length}
            </span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Words Typed:</span>
            <span
              style={{
                color: "#09ff00",
                fontWeight: "700",
                marginLeft: "0.5rem",
              }}
            >
              {stats.totalWordsTyped.toLocaleString()}
            </span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Accuracy:</span>
            <span
              style={{
                color: "#09ff00",
                fontWeight: "700",
                marginLeft: "0.5rem",
              }}
            >
              {stats.totalWordsTyped > 0
                ? (
                    (stats.totalWordsCorrect / stats.totalWordsTyped) *
                    100
                  ).toFixed(1)
                : "0.0"}
              %
            </span>
          </div>
        </div>
      </div>

      {/* High Scores Section */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeading>🏆 HIGH SCORES</SectionHeading>
        <div
          data-testid={TEST_IDS.HIGH_SCORES_TAB}
          style={{
            background: "rgba(9, 255, 0, 0.05)",
            border: "1px solid rgba(9, 255, 0, 0.2)",
            borderRadius: "10px",
            padding: "1rem",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {sortedHighScores.length === 0 ? (
            <p
              style={{
                color: "#64748b",
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              No high scores yet. Start playing to set records!
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {sortedHighScores
                .slice(0, TUNING.highScoreLimit)
                .map((score, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.5rem",
                      background:
                        index < TUNING.podiumSize
                          ? "rgba(9, 255, 0, 0.1)"
                          : "transparent",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ color: "#64748b", width: "30px" }}>
                      #{index + 1}
                    </span>
                    <span
                      style={{ color: "#09ff00", fontWeight: "600", flex: 1 }}
                    >
                      {score.score.toLocaleString()}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      Level {score.level}
                    </span>
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: "0.75rem",
                        marginLeft: "0.5rem",
                      }}
                    >
                      {score.mode}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Achievements Section */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SectionHeading>
          🏅 ACHIEVEMENTS ({achievements.filter((a) => a.unlocked).length}/
          {ACHIEVEMENTS_DEFINITIONS.length})
        </SectionHeading>
        <div
          data-testid={TEST_IDS.ACHIEVEMENTS_TAB}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(55px, 1fr))",
            gap: "0.8rem",
          }}
        >
          {achievements.map((achievement) => {
            const isUnlocked = achievement.unlocked;
            const achDef = ACHIEVEMENTS_DEFINITIONS.find(
              (a) => a.id === achievement.id,
            );
            const achievementName = achDef?.name ?? achievement.name;
            const achievementDescription =
              achDef?.description ?? achievement.description;

            return (
              <div
                key={achievement.id}
                data-testid={`${TEST_IDS.ACHIEVEMENT_ITEM_PREFIX}${achievement.id}`}
                title={
                  isUnlocked
                    ? `${achievementName}\n${achievementDescription}${achievement.unlockedAt ? `\nUnlocked: ${new Date(achievement.unlockedAt).toLocaleDateString()}` : ""}`
                    : `${achievementName}\n${achievementDescription}\n🔒 LOCKED`
                }
                style={{
                  width: "55px",
                  height: "55px",
                  background: isUnlocked
                    ? "rgba(9, 255, 0, 0.2)"
                    : "rgba(45, 45, 50, 0.8)",
                  border: isUnlocked
                    ? "2px solid #09ff00"
                    : "2px solid rgba(80, 80, 85, 0.6)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isUnlocked ? "1.5rem" : "1.3rem",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  opacity: 1,
                  boxShadow: isUnlocked
                    ? "0 0 15px rgba(9, 255, 0, 0.4)"
                    : "none",
                  color: isUnlocked ? "inherit" : "rgba(120, 120, 125, 0.8)",
                }}
                onMouseEnter={(e) => {
                  if (isUnlocked) {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow =
                      "0 0 25px rgba(9, 255, 0, 0.6)";
                  } else {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.background = "rgba(50, 50, 55, 0.9)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  if (isUnlocked) {
                    e.currentTarget.style.boxShadow =
                      "0 0 15px rgba(9, 255, 0, 0.4)";
                  } else {
                    e.currentTarget.style.background = "rgba(45, 45, 50, 0.8)";
                  }
                }}
              >
                {isUnlocked ? (
                  achDef?.iconName.endsWith(".svg") ? (
                    <img
                      src={achDef.iconName}
                      alt={achDef.name}
                      style={{
                        width: "32px",
                        height: "32px",
                        filter: "drop-shadow(0 0 8px rgba(9, 255, 0, 0.6))",
                      }}
                    />
                  ) : (
                    (achDef?.iconName ?? "🏆")
                  )
                ) : (
                  "🔒"
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Close Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "1.5rem",
        }}
      >
        <NeonButton onClick={onClose}>✖️ Close</NeonButton>
      </div>

      {/* Custom scrollbar styling */}
      <style>
        {`
            div::-webkit-scrollbar {
              width: 8px;
            }

            div::-webkit-scrollbar-track {
              background: rgba(30, 41, 59, 0.3);
              border-radius: 4px;
            }

            div::-webkit-scrollbar-thumb {
              background: rgba(9, 255, 0, 0.5);
              border-radius: 4px;
            }

            div::-webkit-scrollbar-thumb:hover {
              background: rgba(9, 255, 0, 0.7);
            }
          `}
      </style>
    </ModalShell>
  );
};

export const PlayerStatsModal = memo(PlayerStatsModalComponent);
