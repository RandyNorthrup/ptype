/**
 * PauseMenu - Overlay displayed when game is paused (ESC key)
 */
import { memo } from 'react';
import { useGameStore } from '../store/gameStore';

interface PauseMenuProps {
  onResume: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

const PauseMenuComponent = ({ onResume, onSettings, onMainMenu }: PauseMenuProps) => {
  const { level, score, wpm, accuracy } = useGameStore();

  return (
    <div
      data-testid="pause-menu-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        data-testid="pause-menu-dialog"
        style={{
          background: 'rgba(10, 14, 27, 0.95)',
          border: '3px solid rgba(9, 255, 0, 0.5)',
          borderRadius: '20px',
          padding: '3rem 2.5rem',
          minWidth: '400px',
          boxShadow: '0 0 40px rgba(9, 255, 0, 0.3), inset 0 0 30px rgba(9, 255, 0, 0.05)',
        }}
      >
        {/* Header */}
        <h1
          style={{
            color: '#09ff00',
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '1.5rem',
            textShadow: '0 0 20px rgba(9, 255, 0, 0.8)',
          }}
        >
          ⏸️ PAUSED
        </h1>

        {/* Current Stats */}
        <div
          style={{
            background: 'rgba(10, 14, 27, 0.7)',
            border: '1px solid rgba(100, 116, 139, 0.4)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                Level
              </p>
              <p style={{ color: '#09ff00', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {level}
              </p>
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                Score
              </p>
              <p style={{ color: '#fbbf24', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {score.toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                WPM
              </p>
              <p style={{ color: '#00d4ff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {wpm}
              </p>
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                Accuracy
              </p>
              <p style={{ color: '#a78bfa', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {accuracy.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Menu Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <button
            onClick={onResume}
            data-testid="pause-resume-button"
            style={{
              padding: '1rem 2rem',
              background: 'rgba(9, 255, 0, 0.15)',
              border: '2px solid #09ff00',
              borderRadius: '12px',
              color: '#09ff00',
              fontSize: '1.2rem',
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
            ▶️ Resume Game
          </button>

          <button
            onClick={onSettings}
            data-testid="pause-settings-button"
            style={{
              padding: '1rem 2rem',
              background: 'rgba(10, 14, 27, 0.7)',
              border: '2px solid rgba(9, 255, 0, 0.3)',
              borderRadius: '12px',
              color: '#09ff00',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 0 10px rgba(9, 255, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#09ff00';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(9, 255, 0, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(9, 255, 0, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(9, 255, 0, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ⚙️ Settings
          </button>

          <button
            onClick={onMainMenu}
            data-testid="pause-main-menu-button"
            style={{
              padding: '1rem 2rem',
              background: 'rgba(10, 14, 27, 0.7)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              color: '#ef4444',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🏠 Main Menu
          </button>
        </div>

        {/* Hint */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            color: '#64748b',
            fontSize: '0.85rem',
          }}
        >
          Press ESC to resume
        </p>
      </div>
    </div>
  );
};

export const PauseMenu = memo(PauseMenuComponent);
