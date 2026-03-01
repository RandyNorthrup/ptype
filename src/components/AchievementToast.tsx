/**
 * AchievementToast - Notification when achievement is unlocked
 */
import { useState, useEffect, useRef, memo } from 'react';
import { Achievement } from '../types';
import { TEST_IDS } from '../utils/testIds';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

const AchievementToastComponent = ({ achievement, onDismiss }: AchievementToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  // Use a ref so the effect never re-runs when onDismiss identity changes
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    // Trigger slide-in animation
    setIsVisible(true);

    let innerTimer: ReturnType<typeof setTimeout>;

    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation before calling onDismiss
      innerTimer = setTimeout(() => onDismissRef.current(), 300);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(innerTimer);
    };
  }, []); // Run once on mount only

  return (
    <div
      data-testid={TEST_IDS.ACHIEVEMENT_TOAST}
      style={{
        position: 'relative',
        width: '280px',
        background: 'rgba(10, 14, 27, 0.95)',
        border: '2px solid #09ff00',
        borderRadius: '12px',
        padding: '0.8rem',
        boxShadow: '0 4px 20px rgba(9, 255, 0, 0.5), inset 0 0 15px rgba(9, 255, 0, 0.1)',
        transform: isVisible ? 'translateX(0)' : 'translateX(320px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.6rem',
        }}
      >
        <div style={{ fontSize: '1.2rem' }}>🏆</div>
        <div
          style={{
            color: '#09ff00',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textShadow: '0 0 10px rgba(9, 255, 0, 0.6)',
          }}
        >
          Achievement!
        </div>
      </div>

      {/* Achievement Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}
      >
        <div
          data-testid={TEST_IDS.ACHIEVEMENT_ICON}
          style={{
            width: '36px',
            height: '36px',
            background: 'rgba(9, 255, 0, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: '700',
            color: '#09ff00',
            border: '1px solid rgba(9, 255, 0, 0.3)',
            flexShrink: 0,
          }}
        >
          {achievement.iconName?.endsWith('.svg') ? (
            <img 
              src={achievement.iconName} 
              alt={achievement.name}
              style={{ 
                width: '24px', 
                height: '24px',
                filter: 'drop-shadow(0 0 6px rgba(9, 255, 0, 0.6))',
              }} 
            />
          ) : (
            achievement.iconName
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: '#09ff00',
              fontSize: '0.9rem',
              fontWeight: '700',
              marginBottom: '0.15rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {achievement.name}
          </div>
          <div
            style={{
              color: '#94a3b8',
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {achievement.description}
          </div>
        </div>
      </div>

    </div>
  );
};

export const AchievementToast = memo(AchievementToastComponent);
