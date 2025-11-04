/**
 * PlayerStatsModal - Unified stats, high scores, and achievements display
 * Matches Python version's draw_stats_popup layout
 */
import { memo } from 'react';
import { useGameStore } from '../store/gameStore';
import { ACHIEVEMENTS_DEFINITIONS } from '../utils/achievementsManager';
import { TEST_IDS } from '../utils/testIds';
import { error as logError } from '../utils/logger';

interface PlayerStatsModalProps {
  onClose: () => void;
}

const PlayerStatsModalComponent = ({ onClose }: PlayerStatsModalProps) => {
  const { achievements, highScores } = useGameStore();
  
  // Sort high scores by score (descending)
  const sortedHighScores = [...highScores].sort((a, b) => b.score - a.score);
  
  // Calculate stats (TODO: implement profile stats tracking)
  const gamesPlayed = highScores.length;
  const bestScore = highScores.length > 0 ? Math.max(...highScores.map(s => s.score)) : 0;
  const bestLevel = highScores.length > 0 ? Math.max(...highScores.map(s => s.level)) : 0;

  const handleClose = () => {
    try {
      onClose();
    } catch (err) {
      logError('Failed to close player stats modal', err, 'PlayerStatsModal');
    }
  };

  return (
    <div 
      data-testid={TEST_IDS.PLAYER_STATS_MODAL}
      style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 3000,
        backdropFilter: 'blur(8px)',
      }} 
      onClick={handleClose}
    >
      <div 
        style={{
          background: 'rgba(10, 14, 27, 0.95)',
          border: '3px solid #09ff00',
          borderRadius: '15px',
          padding: '2rem',
          minWidth: '550px',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 0 50px rgba(9, 255, 0, 0.5), inset 0 0 30px rgba(9, 255, 0, 0.1)',
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 style={{ 
          color: '#09ff00', 
          marginBottom: '1.5rem',
          fontSize: '1.8rem',
          fontWeight: '700',
          textAlign: 'center',
          textShadow: '0 0 20px rgba(9, 255, 0, 0.8)',
        }}>
          📊 PLAYER STATISTICS
        </h2>

        {/* Stats Section */}
        <div style={{
          background: 'rgba(9, 255, 0, 0.05)',
          border: '1px solid rgba(9, 255, 0, 0.2)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '0.8rem',
            color: '#94a3b8',
            fontSize: '0.9rem',
          }}>
            <div>
              <span style={{ color: '#64748b' }}>Games Played:</span>
              <span style={{ color: '#09ff00', fontWeight: '700', marginLeft: '0.5rem' }}>
                {gamesPlayed}
              </span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Best Score:</span>
              <span style={{ color: '#09ff00', fontWeight: '700', marginLeft: '0.5rem' }}>
                {bestScore.toLocaleString()}
              </span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Highest Level:</span>
              <span style={{ color: '#09ff00', fontWeight: '700', marginLeft: '0.5rem' }}>
                {bestLevel}
              </span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Achievements:</span>
              <span style={{ color: '#09ff00', fontWeight: '700', marginLeft: '0.5rem' }}>
                {achievements.filter(a => a.unlocked).length}/{ACHIEVEMENTS_DEFINITIONS.length}
              </span>
            </div>
          </div>
        </div>

        {/* High Scores Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ 
            color: '#09ff00', 
            fontSize: '1.2rem',
            fontWeight: '700',
            marginBottom: '0.8rem',
            textShadow: '0 0 10px rgba(9, 255, 0, 0.5)',
          }}>
            🏆 HIGH SCORES
          </h3>
          <div 
            data-testid={TEST_IDS.HIGH_SCORES_TAB}
            style={{
              background: 'rgba(9, 255, 0, 0.05)',
              border: '1px solid rgba(9, 255, 0, 0.2)',
              borderRadius: '10px',
              padding: '1rem',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {sortedHighScores.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.9rem' }}>
                No high scores yet. Start playing to set records!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sortedHighScores.slice(0, 10).map((score, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                      background: idx < 3 ? 'rgba(9, 255, 0, 0.1)' : 'transparent',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ color: '#64748b', width: '30px' }}>#{idx + 1}</span>
                    <span style={{ color: '#09ff00', fontWeight: '600', flex: 1 }}>
                      {score.score.toLocaleString()}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      Level {score.level}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                      {score.mode}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ 
            color: '#09ff00', 
            fontSize: '1.2rem',
            fontWeight: '700',
            marginBottom: '0.8rem',
            textShadow: '0 0 10px rgba(9, 255, 0, 0.5)',
          }}>
            🏅 ACHIEVEMENTS ({achievements.filter(a => a.unlocked).length}/{ACHIEVEMENTS_DEFINITIONS.length})
          </h3>
          <div 
            data-testid={TEST_IDS.ACHIEVEMENTS_TAB}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.8rem',
            }}
          >
            {achievements.map((achievement) => {
              const isUnlocked = achievement.unlocked;
              const achDef = ACHIEVEMENTS_DEFINITIONS.find(a => a.id === achievement.id);
              
              return (
                <div
                  key={achievement.id}
                  data-testid={`${TEST_IDS.ACHIEVEMENT_ITEM_PREFIX}${achievement.id}`}
                  title={isUnlocked 
                    ? `${achDef?.name}\n${achDef?.description}${achievement.unlockedAt ? `\nUnlocked: ${new Date(achievement.unlockedAt).toLocaleDateString()}` : ''}`
                    : `${achDef?.name}\n${achDef?.description}\n🔒 LOCKED`
                  }
                  style={{
                    width: '55px',
                    height: '55px',
                    background: isUnlocked 
                      ? 'rgba(9, 255, 0, 0.2)' 
                      : 'rgba(45, 45, 50, 0.8)',
                    border: isUnlocked 
                      ? '2px solid #09ff00' 
                      : '2px solid rgba(80, 80, 85, 0.6)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isUnlocked ? '1.5rem' : '1.3rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    opacity: 1,
                    boxShadow: isUnlocked 
                      ? '0 0 15px rgba(9, 255, 0, 0.4)' 
                      : 'none',
                    color: isUnlocked ? 'inherit' : 'rgba(120, 120, 125, 0.8)',
                  }}
                  onMouseEnter={(e) => {
                    if (isUnlocked) {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 0 25px rgba(9, 255, 0, 0.6)';
                    } else {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.background = 'rgba(50, 50, 55, 0.9)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    if (isUnlocked) {
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(9, 255, 0, 0.4)';
                    } else {
                      e.currentTarget.style.background = 'rgba(45, 45, 50, 0.8)';
                    }
                  }}
                >
                  {isUnlocked ? (
                    achDef?.iconName?.endsWith('.svg') ? (
                      <img 
                        src={achDef.iconName} 
                        alt={achDef.name}
                        style={{ 
                          width: '32px', 
                          height: '32px',
                          filter: 'drop-shadow(0 0 8px rgba(9, 255, 0, 0.6))',
                        }} 
                      />
                    ) : (
                      achDef?.iconName || '🏆'
                    )
                  ) : (
                    '🔒'
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginTop: '1.5rem',
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '0.8rem 2.5rem',
              fontSize: '1rem',
              background: 'rgba(9, 255, 0, 0.2)',
              border: '2px solid #09ff00',
              borderRadius: '10px',
              color: '#09ff00',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 0 20px rgba(9, 255, 0, 0.3), inset 0 0 12px rgba(9, 255, 0, 0.1)',
              textShadow: '0 0 10px rgba(9, 255, 0, 0.6)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(9, 255, 0, 0.5), inset 0 0 20px rgba(9, 255, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(9, 255, 0, 0.3), inset 0 0 12px rgba(9, 255, 0, 0.1)';
            }}
          >
            ✖️ Close
          </button>
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
      </div>
    </div>
  );
};

export const PlayerStatsModal = memo(PlayerStatsModalComponent);
