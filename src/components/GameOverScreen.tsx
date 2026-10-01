/**
 * GameOverScreen - Shows when player dies
 */
import { memo, useMemo } from "react";
import { useGameStore } from "../store/gameContext";
import { TEST_IDS } from "../utils/testIds";
import { NeonButton } from "./NeonButton";

const TUNING = {
  highScoreLimit: 10,
} as const;

const GameOverScreenComponent = () => {
  const {
    score,
    level,
    wpm,
    accuracy,
    resetGame,
    startGame,
    highScores,
    mode,
    programmingLanguage,
    previousMode,
    previousLanguage,
  } = useGameStore();
  const highScorePosition = useMemo(() => {
    // Check if this is a new high score
    // Use previousMode/previousLanguage since mode is now 'game_over'
    const scoreMode = previousMode ?? mode;
    const scoreLang = previousLanguage ?? programmingLanguage;
    const relevantScores = highScores
      .filter((s) => {
        if (s.mode !== scoreMode) return false;
        if (scoreLang && s.language !== scoreLang) return false;
        return true;
      })
      .toSorted((a, b) => b.score - a.score);

    const position =
      relevantScores.findIndex((s) => s.score === score && s.level === level) +
      1;

    return position > 0 && position <= TUNING.highScoreLimit ? position : 0;
  }, [
    highScores,
    score,
    level,
    previousMode,
    previousLanguage,
    mode,
    programmingLanguage,
  ]);
  const isNewHighScore = highScorePosition > 0;

  const handleMainMenu = () => {
    resetGame();
  };

  const handlePlayAgain = () => {
    const restartMode = previousMode;
    const restartLang = previousLanguage;
    resetGame();
    // Restart with same settings after state resets
    if (restartMode) {
      startGame(restartMode, restartLang);
    }
  };

  const summaryStats = [
    {
      label: "Score",
      value: score.toLocaleString(),
      testId: TEST_IDS.FINAL_SCORE,
      color: "#fbbf24",
    },
    {
      label: "Level",
      value: level.toString(),
      testId: TEST_IDS.FINAL_LEVEL,
      color: "#00d4ff",
    },
    {
      label: "WPM",
      value: wpm.toFixed(0),
      testId: TEST_IDS.FINAL_WPM,
      color: "#a78bfa",
    },
    {
      label: "Accuracy",
      value: `${accuracy.toFixed(1)}%`,
      testId: TEST_IDS.FINAL_ACCURACY,
      color: "#09ff00",
    },
  ];

  return (
    <div
      aria-labelledby="game-over-title"
      aria-modal="true"
      data-testid="game-over-screen"
      role="dialog"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(15px)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(1rem, 4vw, 2rem)",
        overflowY: "auto",
      }}
    >
      {/* Game Over Text */}
      <h1
        id="game-over-title"
        style={{
          color: "#ef4444",
          fontSize: "clamp(2.5rem, 12vw, 5rem)",
          fontWeight: "700",
          marginBottom: "1rem",
          textShadow: "0 0 40px rgba(239, 68, 68, 0.8)",
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        GAME OVER
      </h1>

      {/* High Score Badge */}
      {isNewHighScore && (
        <div
          style={{
            color: "#fbbf24",
            fontSize: "1.8rem",
            fontWeight: "700",
            marginBottom: "1.5rem",
            textShadow: "0 0 30px rgba(251, 191, 36, 0.8)",
            animation: "bounce 1s ease-in-out infinite",
          }}
        >
          🏆 NEW HIGH SCORE! #{highScorePosition} 🏆
        </div>
      )}

      {/* Stats Panel */}
      <div
        style={{
          background: "rgba(10, 14, 27, 0.9)",
          border: "3px solid rgba(9, 255, 0, 0.3)",
          borderRadius: "20px",
          padding: "clamp(1.5rem, 6vw, 3rem)",
          maxWidth: "600px",
          width: "100%",
          marginBottom: "3rem",
          boxShadow:
            "0 0 40px rgba(9, 255, 0, 0.2), inset 0 0 30px rgba(9, 255, 0, 0.05)",
        }}
      >
        <h2
          style={{
            color: "#09ff00",
            fontSize: "2rem",
            fontWeight: "600",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          Final Statistics
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {summaryStats.map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "0.5rem",
                }}
              >
                {stat.label}
              </div>
              <div
                data-testid={stat.testId}
                style={{
                  color: stat.color,
                  fontSize: "2.5rem",
                  fontWeight: "700",
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <NeonButton
          className="game-over-action"
          onClick={handlePlayAgain}
          data-testid="play-again-button"
        >
          🔄 Play Again
        </NeonButton>

        <NeonButton
          className="game-over-action"
          onClick={handleMainMenu}
          data-testid="game-over-main-menu-button"
          variant="secondary"
        >
          🏠 Main Menu
        </NeonButton>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </div>
  );
};

export const GameOverScreen = memo(GameOverScreenComponent);
