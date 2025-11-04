/**
 * SettingsMenu Component - Functional settings with volume controls
 */
import { useState, useEffect, memo } from 'react';
import { getAudioManager } from '../utils/audioManager';

interface SettingsMenuProps {
  onClose: () => void;
}

const SettingsMenuComponent = ({ onClose }: SettingsMenuProps) => {
  const audioManager = getAudioManager();
  const [musicVolume, setMusicVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(50);
  const [difficulty, setDifficulty] = useState('Normal');

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('game-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setMusicVolume(settings.musicVolume ?? 50);
      setSfxVolume(settings.sfxVolume ?? 50);
      setDifficulty(settings.difficulty ?? 'Normal');
      
      // Apply volumes to audio manager
      audioManager.setMusicVolume(settings.musicVolume ?? 50);
      audioManager.setSfxVolume(settings.sfxVolume ?? 50);
    }
  }, [audioManager]);

  const handleSave = () => {
    // Save to localStorage
    const settings = {
      musicVolume,
      sfxVolume,
      difficulty,
    };
    localStorage.setItem('game-settings', JSON.stringify(settings));
    
    // Apply volumes
    audioManager.setMusicVolume(musicVolume);
    audioManager.setSfxVolume(sfxVolume);
    
    onClose();
  };

  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);
    audioManager.setMusicVolume(value);
  };

  const handleSFXVolumeChange = (value: number) => {
    setSfxVolume(value);
    audioManager.setSfxVolume(value);
    // Play a test sound
    audioManager.playLaser();
  };

  return (
    <div 
      data-testid="settings-menu-overlay"
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
      onClick={onClose}
    >
      <div 
        data-testid="settings-menu-dialog"
        style={{
          background: 'rgba(10, 14, 27, 0.95)',
          border: '3px solid #09ff00',
          borderRadius: '15px',
          padding: '2rem',
          minWidth: '400px',
          maxWidth: '500px',
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
          ⚙️ SETTINGS
        </h2>

        {/* Music Volume */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            color: '#09ff00', 
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            textShadow: '0 0 10px rgba(9, 255, 0, 0.5)',
          }}>
            🎵 Music Volume: {musicVolume}%
          </label>
          <input 
            type="range"
            min="0"
            max="100"
            value={musicVolume}
            onChange={(e) => handleMusicVolumeChange(Number(e.target.value))}
            data-testid="music-volume-slider"
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: `linear-gradient(to right, #09ff00 0%, #09ff00 ${musicVolume}%, rgba(100, 116, 139, 0.3) ${musicVolume}%, rgba(100, 116, 139, 0.3) 100%)`,
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
            }}
          />
        </div>

        {/* SFX Volume */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            color: '#09ff00', 
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            textShadow: '0 0 10px rgba(9, 255, 0, 0.5)',
          }}>
            🔊 SFX Volume: {sfxVolume}%
          </label>
          <input 
            type="range"
            min="0"
            max="100"
            value={sfxVolume}
            onChange={(e) => handleSFXVolumeChange(Number(e.target.value))}
            data-testid="sfx-volume-slider"
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: `linear-gradient(to right, #09ff00 0%, #09ff00 ${sfxVolume}%, rgba(100, 116, 139, 0.3) ${sfxVolume}%, rgba(100, 116, 139, 0.3) 100%)`,
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
            }}
          />
        </div>

        {/* Difficulty */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'block', 
            color: '#09ff00', 
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            textShadow: '0 0 10px rgba(9, 255, 0, 0.5)',
          }}>
            💪 Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            data-testid="difficulty-selector"
            style={{
              width: '100%',
              padding: '0.8rem',
              fontSize: '1rem',
              background: 'rgba(10, 14, 27, 0.8)',
              border: '2px solid rgba(9, 255, 0, 0.3)',
              borderRadius: '8px',
              color: '#09ff00',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: '600',
              boxShadow: '0 0 15px rgba(9, 255, 0, 0.2), inset 0 0 10px rgba(9, 255, 0, 0.05)',
            }}
          >
            <option value="Easy" style={{ background: '#0a0e27', color: '#09ff00' }}>Easy</option>
            <option value="Normal" style={{ background: '#0a0e27', color: '#09ff00' }}>Normal</option>
            <option value="Hard" style={{ background: '#0a0e27', color: '#09ff00' }}>Hard</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          justifyContent: 'center',
        }}>
          <button 
            onClick={handleSave}
            data-testid="settings-save-button"
            style={{
              padding: '0.8rem 2rem',
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
            💾 Save
          </button>
          <button 
            onClick={onClose}
            data-testid="settings-cancel-button"
            style={{
              padding: '0.8rem 2rem',
              fontSize: '1rem',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '2px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '10px',
              color: '#64748b',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ✖️ Cancel
          </button>
        </div>

        {/* Custom range slider styling */}
        <style>
          {`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #09ff00;
              cursor: pointer;
              box-shadow: 0 0 10px rgba(9, 255, 0, 0.8), 0 0 20px rgba(9, 255, 0, 0.4);
              border: 2px solid rgba(0, 0, 0, 0.3);
            }
            
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #09ff00;
              cursor: pointer;
              box-shadow: 0 0 10px rgba(9, 255, 0, 0.8), 0 0 20px rgba(9, 255, 0, 0.4);
              border: 2px solid rgba(0, 0, 0, 0.3);
            }
            
            input[type="range"]:hover::-webkit-slider-thumb {
              box-shadow: 0 0 15px rgba(9, 255, 0, 1), 0 0 30px rgba(9, 255, 0, 0.6);
            }
            
            input[type="range"]:hover::-moz-range-thumb {
              box-shadow: 0 0 15px rgba(9, 255, 0, 1), 0 0 30px rgba(9, 255, 0, 0.6);
            }
          `}
        </style>
      </div>
    </div>
  );
};

export const SettingsMenu = memo(SettingsMenuComponent);
