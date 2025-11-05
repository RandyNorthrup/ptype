/**
 * GameOverScreen - Shows when player dies
 */
import { memo } from 'react';
import { useGameStore } from '../store/gameContext';

const GameOverScreenComponent = () => {
  const { score, level, wpm, accuracy, resetGame } = useGameStore();

  const handleMainMenu = () => {
    resetGame();
  };

  const handlePlayAgain = () => {
    resetGame();
  };

  return (
    <div
      data-testid="game-over-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(15px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      {/* Game Over Text */}
      <h1
        style={{
          color: '#ef4444',
          fontSize: '5rem',
          fontWeight: '700',
          marginBottom: '2rem',
          textShadow: '0 0 40px rgba(239, 68, 68, 0.8)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        GAME OVER
      </h1>

      {/* Stats Panel */}
      <div
        style={{
          background: 'rgba(10, 14, 27, 0.9)',
          border: '3px solid rgba(9, 255, 0, 0.3)',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '600px',
          width: '100%',
          marginBottom: '3rem',
          boxShadow: '0 0 40px rgba(9, 255, 0, 0.2), inset 0 0 30px rgba(9, 255, 0, 0.05)',
        }}
      >
        <h2
          style={{
            color: '#09ff00',
            fontSize: '2rem',
            fontWeight: '600',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          Final Statistics
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                color: '#94a3b8',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '0.5rem',
              }}
            >
              Score
            </div>
            <div
              style={{
                color: '#fbbf24',
                fontSize: '2.5rem',
                fontWeight: '700',
              }}
            >
              {score.toLocaleString()}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                color: '#94a3b8',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '0.5rem',
              }}
            >
              Level
            </div>
            <div
              style={{
                color: '#00d4ff',
                fontSize: '2.5rem',
                fontWeight: '700',
              }}
            >
              {level}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                color: '#94a3b8',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '0.5rem',
              }}
            >
              WPM
            </div>
            <div
              style={{
                color: '#a78bfa',
                fontSize: '2.5rem',
                fontWeight: '700',
              }}
            >
              {wpm.toFixed(0)}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                color: '#94a3b8',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '0.5rem',
              }}
            >
              Accuracy
            </div>
            <div
              style={{
                color: '#09ff00',
                fontSize: '2.5rem',
                fontWeight: '700',
              }}
            >
              {accuracy.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
        }}
      >
        <button
          onClick={handlePlayAgain}
          data-testid="play-again-button"
          style={{
            padding: '1rem 3rem',
            fontSize: '1.3rem',
            background: 'rgba(9, 255, 0, 0.15)',
            border: '2px solid #09ff00',
            borderRadius: '12px',
            color: '#09ff00',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(9, 255, 0, 0.4), inset 0 0 15px rgba(9, 255, 0, 0.1)',
            textShadow: '0 0 10px rgba(9, 255, 0, 0.8)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 40px rgba(9, 255, 0, 0.6), inset 0 0 20px rgba(9, 255, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(9, 255, 0, 0.4), inset 0 0 15px rgba(9, 255, 0, 0.1)';
          }}
        >
          🔄 Play Again
        </button>

        <button
          onClick={handleMainMenu}
          data-testid="game-over-main-menu-button"
          style={{
            padding: '1rem 3rem',
            fontSize: '1.3rem',
            background: 'rgba(10, 14, 27, 0.7)',
            border: '2px solid rgba(9, 255, 0, 0.3)',
            borderRadius: '12px',
            color: '#09ff00',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 0 10px rgba(9, 255, 0, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#09ff00';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(9, 255, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(9, 255, 0, 0.3)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(9, 255, 0, 0.2)';
          }}
        >
          🏠 Main Menu
        </button>
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
        `}
      </style>
    </div>
  );
};

export const GameOverScreen = memo(GameOverScreenComponent);
