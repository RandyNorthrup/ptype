/**
 * MainMenu Component - Matches Python desktop app layout
 */
import { useState, useRef, useEffect, memo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameMode, ProgrammingLanguage } from '../types';
import { PlayerStatsModal } from './PlayerStatsModal';
import { SettingsMenu } from './SettingsMenu';

const MainMenuComponent = () => {
  const { startGame } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<string>('Choose a Mode');
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Continue functionality disabled for now - reserved for future use
  const canContinue = false;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Continue handler disabled - reserved for future implementation
  // const handleStartContinue = () => {
  //   // Future: Load saved game state
  // };

  const handleStartNewGame = () => {
    if (selectedMode === 'Choose a Mode') {
      return; // Button is disabled
    }
    
    if (selectedMode === 'Normal') {
      startGame(GameMode.NORMAL);
    } else {
      // It's a programming language
      const lang = selectedMode as ProgrammingLanguage;
      startGame(GameMode.PROGRAMMING, lang);
    }
  };

  const allModes = [
    'Choose a Mode',
    'Normal',
    ...Object.values(ProgrammingLanguage)
  ];

  return (
    <>
      <div 
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '1rem',
        }}
      >
        {/* Logo and Title */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          <img 
            src="/assets/images/ptype_logo.png" 
            alt="P-Type Logo"
            data-testid="main-menu-logo"
            style={{ 
              width: '280px', 
              height: 'auto',
              marginBottom: '0.2rem',
              filter: 'drop-shadow(0 0 30px rgba(9, 255, 0, 0.8))',
            }} 
          />
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#09ff00', 
            fontWeight: '600',
            textShadow: '0 0 20px rgba(9, 255, 0, 0.6)',
            letterSpacing: '0.1em',
            margin: 0,
          }}>
            THE TYPING GAME
          </p>
        </div>

        {/* Main Action Buttons - Stacked */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.7rem',
          marginBottom: '1rem',
          zIndex: 1,
        }}>
          {/* Continue Button - Disabled for now, reserved for future use */}
          <button
            onClick={() => {/* Future: Implement continue functionality */}}
            disabled={true}
            data-testid="continue-game-button"
            style={{
              padding: '0.8rem 2.5rem',
              fontSize: '1.1rem',
              background: canContinue 
                ? 'rgba(9, 255, 0, 0.15)'
                : 'rgba(30, 41, 59, 0.8)',
              border: canContinue
                ? '2px solid #09ff00'
                : '2px solid rgba(100, 116, 139, 0.6)',
              borderRadius: '12px',
              color: canContinue ? '#09ff00' : '#94a3b8',
              fontWeight: '700',
              cursor: canContinue ? 'pointer' : 'not-allowed',
              opacity: canContinue ? 1 : 0.85,
              width: '300px',
              textAlign: 'center',
              transition: 'all 0.3s',
              boxShadow: canContinue ? '0 0 30px #00ff2267, inset 0 0 15px rgba(9, 255, 0, 0.1)' : 'none',
              textShadow: canContinue ? '0 0 10px rgba(9, 255, 0, 0.8)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (canContinue) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(9, 255, 0, 0.6), inset 0 0 20px rgba(9, 255, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              if (canContinue) {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(9, 255, 0, 0.4), inset 0 0 15px rgba(9, 255, 0, 0.1)';
              }
            }}
          >
            CONTINUE
          </button>

          {/* New Game Button */}
          <button
            onClick={handleStartNewGame}
            disabled={selectedMode === 'Choose a Mode'}
            data-testid="new-game-button"
            style={{
              padding: '0.8rem 2.5rem',
              fontSize: '1.1rem',
              background: selectedMode === 'Choose a Mode' 
                ? 'rgba(30, 41, 59, 0.8)' 
                : 'rgba(9, 255, 0, 0.15)',
              border: selectedMode === 'Choose a Mode'
                ? '2px solid rgba(100, 116, 139, 0.6)'
                : '2px solid #09ff00',
              borderRadius: '12px',
              color: selectedMode === 'Choose a Mode' ? '#94a3b8' : '#09ff00',
              fontWeight: '700',
              cursor: selectedMode === 'Choose a Mode' ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: selectedMode === 'Choose a Mode' ? 0.85 : 1,
              width: '300px',
              textAlign: 'center',
              boxShadow: selectedMode !== 'Choose a Mode' ? '0 0 30px rgba(9, 255, 0, 0.4), inset 0 0 15px rgba(9, 255, 0, 0.1)' : 'none',
              textShadow: selectedMode !== 'Choose a Mode' ? '0 0 10px rgba(9, 255, 0, 0.8)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (selectedMode !== 'Choose a Mode') {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(9, 255, 0, 0.6), inset 0 0 20px rgba(9, 255, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              if (selectedMode !== 'Choose a Mode') {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(9, 255, 0, 0.4), inset 0 0 15px rgba(9, 255, 0, 0.1)';
              }
            }}
          >
            NEW GAME
          </button>

          {/* Custom Mode Dropdown */}
          <div 
            ref={dropdownRef}
            style={{ 
              position: 'relative', 
              width: '300px',
              zIndex: 100,
            }}
          >
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              data-testid="mode-selector-button"
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, rgba(10, 14, 27, 0.95) 0%, rgba(15, 20, 35, 0.95) 100%)',
                border: '2px solid rgba(9, 255, 0, 0.4)',
                borderRadius: '12px',
                color: '#09ff00',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.3s ease',
                fontWeight: '600',
                letterSpacing: '0.5px',
                boxShadow: '0 0 20px rgba(9, 255, 0, 0.3), inset 0 0 15px rgba(9, 255, 0, 0.08)',
                textShadow: '0 0 8px rgba(9, 255, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#09ff00';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(9, 255, 0, 0.5), inset 0 0 20px rgba(9, 255, 0, 0.15)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(9, 255, 0, 0.4)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(9, 255, 0, 0.3), inset 0 0 15px rgba(9, 255, 0, 0.08)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>{selectedMode}</span>
              <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                {dropdownOpen ? '▲' : '▼'}
              </span>
            </button>
            
            {dropdownOpen && (
              <div
                data-testid="mode-selector-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'linear-gradient(135deg, rgba(10, 14, 27, 0.98) 0%, rgba(15, 20, 35, 0.98) 100%)',
                  border: '2px solid rgba(9, 255, 0, 0.4)',
                  borderRadius: '12px',
                  boxShadow: '0 0 30px rgba(9, 255, 0, 0.4), inset 0 0 20px rgba(9, 255, 0, 0.08)',
                  backdropFilter: 'blur(10px)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000,
                }}
              >
                {allModes.map((m) => (
                  <button
                    key={m}
                    data-testid={`mode-option-${m.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => {
                      setSelectedMode(m);
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1.2rem',
                      fontSize: '1rem',
                      background: selectedMode === m ? 'rgba(9, 255, 0, 0.15)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(9, 255, 0, 0.1)',
                      color: selectedMode === m ? '#ffffff' : '#09ff00',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      fontWeight: selectedMode === m ? '700' : '600',
                      letterSpacing: '0.5px',
                      textShadow: selectedMode === m ? '0 0 10px rgba(9, 255, 0, 0.8)' : '0 0 5px rgba(9, 255, 0, 0.4)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(9, 255, 0, 0.2)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.paddingLeft = '1.5rem';
                      e.currentTarget.style.textShadow = '0 0 10px rgba(9, 255, 0, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = selectedMode === m ? 'rgba(9, 255, 0, 0.15)' : 'transparent';
                      e.currentTarget.style.color = selectedMode === m ? '#ffffff' : '#09ff00';
                      e.currentTarget.style.paddingLeft = '1.2rem';
                      e.currentTarget.style.textShadow = selectedMode === m ? '0 0 10px rgba(9, 255, 0, 0.8)' : '0 0 5px rgba(9, 255, 0, 0.4)';
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
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'space-between',
          width: '300px',
          marginBottom: '1rem',
        }}>
          <button
            onClick={() => setShowStats(!showStats)}
            data-testid="player-stats-button"
            style={{
              padding: '0.6rem 0.8rem',
              fontSize: '0.8rem',
              background: 'rgba(10, 14, 27, 0.7)',
              border: '2px solid rgba(9, 255, 0, 0.3)',
              borderRadius: '8px',
              color: '#09ff00',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 0 10px rgba(9, 255, 0, 0.2)',
              flex: 1,
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
            Player Stats
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            data-testid="settings-button"
            style={{
              padding: '0.6rem 0.8rem',
              fontSize: '0.8rem',
              background: 'rgba(10, 14, 27, 0.7)',
              border: '2px solid rgba(9, 255, 0, 0.3)',
              borderRadius: '8px',
              color: '#09ff00',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 0 10px rgba(9, 255, 0, 0.2)',
              flex: 1,
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
            Settings
          </button>

          <button
            onClick={() => setShowAbout(!showAbout)}
            data-testid="about-button"
            style={{
              padding: '0.6rem 0.8rem',
              fontSize: '0.8rem',
              background: 'rgba(10, 14, 27, 0.7)',
              border: '2px solid rgba(9, 255, 0, 0.3)',
              borderRadius: '8px',
              color: '#09ff00',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 0 10px rgba(9, 255, 0, 0.2)',
              flex: 1,
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
            About
          </button>
        </div>

        {/* Help Panel */}
        <div style={{
          background: 'rgba(10, 14, 27, 0.8)',
          border: '2px solid rgba(9, 255, 0, 0.3)',
          borderRadius: '10px',
          padding: '0.8rem 1.2rem',
          maxWidth: '550px',
          boxShadow: '0 0 20px rgba(9, 255, 0, 0.2), inset 0 0 15px rgba(9, 255, 0, 0.05)',
        }}>
          <h3 style={{ 
            color: '#09ff00', 
            fontSize: '0.95rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem', 
            textAlign: 'center',
            textShadow: '0 0 10px rgba(9, 255, 0, 0.6)',
          }}>
            ⚡ HOW TO PLAY
          </h3>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>
            <p style={{ marginBottom: '0.3rem' }}>• Type falling words • TAB to switch targets</p>
            <p style={{ marginBottom: '0.3rem' }}>• Defeat bosses every level • Answer trivia every 5 levels for bonus items</p>
            <p style={{ marginBottom: '0.3rem' }}>• <span style={{ color: '#09ff00' }}>ENTER:</span> EMP • <span style={{ color: '#09ff00' }}>UP/DOWN:</span> Select item • <span style={{ color: '#09ff00' }}>BACKSPACE:</span> Use item • <span style={{ color: '#09ff00' }}>ESC:</span> Pause</p>
          </div>
        </div>
      </div>

      {/* Unified Player Stats Modal (Stats + High Scores + Achievements) */}
      {showStats && (
        <PlayerStatsModal onClose={() => setShowStats(false)} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsMenu onClose={() => setShowSettings(false)} />
      )}

      {/* About Modal */}
      {showAbout && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowAbout(false)}>
          <div style={{
            background: '#0f172a', border: '3px solid #00d4ff', borderRadius: '15px',
            padding: '2rem', maxWidth: '420px', textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            <h1 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '2rem' }}>P-Type</h1>
            <p style={{ color: '#00d4ff', marginBottom: '0.25rem' }}>Version 2.0.0</p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Web Edition</p>
            <p style={{ color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Created by Randy Northrup</p>
            <p style={{ color: '#00d4ff', marginBottom: '2rem' }}>© 2025</p>
            <button onClick={() => setShowAbout(false)} style={{
              padding: '0.5rem 1rem', background: '#09ff00',
              border: 'none', borderRadius: '6px', color: '#0a0a1a',
              fontWeight: '600', cursor: 'pointer'
            }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export const MainMenu = memo(MainMenuComponent);
