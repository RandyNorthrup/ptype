/**
 * CanvasHUD Component
 * HUD elements rendered inside the Canvas using Html from drei
 */
import { memo } from 'react';
import { Html } from '@react-three/drei';
import { useGameStore } from '../store/gameContext';
import { getTargetWPM, getWPMColor } from '../types';
import { TEST_IDS } from '../utils/testIds';
import { getDifficultyColor } from '../utils/difficultyManager';

const CanvasHUDComponent = () => {
  const { 
    score, 
    level, 
    health, 
    maxHealth, 
    shield, 
    maxShield,
    wpm, 
    accuracy,
    bonusItems,
    selectedBonusIndex,
    empCooldown,
    empMaxCooldown,
    mode,
    programmingLanguage,
    currentDifficulty,
  } = useGameStore();

  const healthPercent = (health / maxHealth) * 100;
  const shieldPercent = (shield / maxShield) * 100;
  const empPercent = empCooldown > 0 ? (empCooldown / empMaxCooldown) * 100 : 0;
  const targetWPM = getTargetWPM(level);
  const wpmColor = getWPMColor(targetWPM);
  
  // Format mode display
  let modeText = mode === 'normal' ? 'Normal' : mode === 'programming' ? 'Programming' : '';
  if (mode === 'programming' && programmingLanguage) {
    modeText += ` - ${programmingLanguage}`;
  }
  
  // Get difficulty color
  const difficultyColor = getDifficultyColor(currentDifficulty as any);

  return (
    <Html
      fullscreen
      style={{
        pointerEvents: 'none',
        fontFamily: 'monospace',
      }}
    >
      {/* Top stats bar */}
      <div 
        data-testid={TEST_IDS.HUD_CONTAINER}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start'
        }}
      >
        {/* Left side stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div data-testid={TEST_IDS.HUD_SCORE} style={{ fontSize: '2rem', fontWeight: 'bold', color: '#09ff00' }}>
            SCORE: {score.toLocaleString()}
          </div>
          <div data-testid={TEST_IDS.HUD_LEVEL} style={{ fontSize: '1.25rem', color: '#94a3b8' }}>
            LEVEL {level}/100
          </div>
          <div style={{ fontSize: '1rem', color: '#e2e8f0', marginTop: '4px' }}>
            {modeText}
          </div>
          <div style={{ fontSize: '0.9rem', color: difficultyColor, fontWeight: 'bold', marginTop: '2px' }}>
            Difficulty: {currentDifficulty}
          </div>
          <div style={{ fontSize: '1rem', color: wpmColor, fontWeight: 'bold', textShadow: `0 0 10px ${wpmColor}` }}>
            WPM Goal: {Math.round(targetWPM)}
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', marginTop: '4px' }}>
            <div data-testid={TEST_IDS.HUD_WPM} style={{ color: '#60a5fa' }}>Current: {Math.round(wpm)}</div>
            <div data-testid={TEST_IDS.HUD_ACCURACY} style={{ color: '#fbbf24' }}>ACC: {Math.round(accuracy)}%</div>
          </div>
        </div>

        {/* Right side - health/shield bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
          {/* Health bar */}
          <div>
            <div style={{ fontSize: '0.875rem', color: health > 60 ? '#39ff14' : '#ff9800', marginBottom: '4px' }}>
              HEALTH
            </div>
            <div 
              data-testid={TEST_IDS.HUD_HEALTH_BAR}
              style={{ 
                width: '100%', 
                height: '20px', 
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <div style={{
                width: `${healthPercent}%`,
                height: '100%',
                background: health > 60 
                  ? 'linear-gradient(90deg, #39ff14 0%, #32dd10 100%)' 
                  : 'linear-gradient(90deg, #ff9800 0%, #ff6f00 100%)',
                transition: 'width 0.3s, background 0.3s'
              }} />
            </div>
          </div>

          {/* Shield bar */}
          <div>
            <div style={{ fontSize: '0.875rem', color: '#8a2be2', marginBottom: '4px' }}>
              SHIELD
            </div>
            <div 
              data-testid={TEST_IDS.HUD_SHIELD_BAR}
              style={{ 
                width: '100%', 
                height: '20px', 
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <div style={{
                width: `${shieldPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #8a2be2 0%, #7b1fa2 100%)',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Current word being typed - REMOVED per user request */}

      {/* Bonus items */}
      {bonusItems.length > 0 && (
        <div
          data-testid={TEST_IDS.HUD_BONUS_ITEMS}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px'
          }}
        >
          {bonusItems.map((item, idx) => (
            <div
              key={item.itemId}
              data-testid={`${TEST_IDS.HUD_BONUS_ITEMS}-${idx}`}
              style={{
                padding: '10px 15px',
                background: idx === selectedBonusIndex 
                  ? 'rgba(9, 255, 0, 0.2)' 
                  : 'rgba(0, 0, 0, 0.5)',
                border: idx === selectedBonusIndex
                  ? '2px solid #09ff00'
                  : '2px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '8px',
                textAlign: 'center',
                color: idx === selectedBonusIndex ? '#09ff00' : '#94a3b8'
              }}
            >
              <div style={{ fontSize: '0.875rem' }}>{item.name}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>x{item.uses}</div>
            </div>
          ))}
        </div>
      )}

      {/* EMP indicator */}
      <div
        data-testid={TEST_IDS.HUD_EMP_COOLDOWN}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '100px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '0.875rem', color: '#f59e0b', marginBottom: '4px' }}>
          EMP
        </div>
        <div style={{
          width: '100%',
          height: '60px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '8px',
          border: '2px solid rgba(245, 158, 11, 0.5)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {empCooldown > 0 ? (
            <>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${100 - empPercent}%`,
                background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                transition: 'height 0.1s linear'
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#ffffff'
              }}>
                {Math.ceil(empCooldown / 60)}s
              </div>
            </>
          ) : (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#09ff00',
              textShadow: '0 0 10px #09ff00'
            }}>
              READY
            </div>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
          ENTER
        </div>
      </div>
    </Html>
  );
};

export const CanvasHUD = memo(CanvasHUDComponent);
