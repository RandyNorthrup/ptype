/**
 * SettingsMenu Component - Functional settings with volume controls
 */
import { useState, useEffect, memo } from "react";
import { getAudioManager } from "../utils/audioManager";
import {
  invalidateDifficultyCache,
  type DifficultyLevel,
} from "../utils/difficultyManager";
import { error as logError } from "../utils/logger";
import { ModalShell } from "./ModalShell";
import { NeonButton } from "./NeonButton";

interface SettingsMenuProperties {
  onClose: () => void;
}

interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  difficulty: DifficultyLevel;
}

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 50,
  sfxVolume: 50,
  difficulty: "Normal",
};

const DIFFICULTIES = new Set<string>([
  "Easy",
  "Normal",
  "Hard",
  "Expert",
  "Master",
]);

function isDifficulty(value: unknown): value is DifficultyLevel {
  return typeof value === "string" && DIFFICULTIES.has(value);
}

function normalizeVolume(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(100, value));
}

function loadSettings(): GameSettings {
  try {
    const savedSettings = localStorage.getItem("game-settings");
    if (!savedSettings) return DEFAULT_SETTINGS;
    const settings: unknown = JSON.parse(savedSettings);
    if (typeof settings !== "object" || settings === null) {
      return DEFAULT_SETTINGS;
    }
    const musicVolume = normalizeVolume(
      "musicVolume" in settings ? settings.musicVolume : undefined,
      DEFAULT_SETTINGS.musicVolume,
    );
    const sfxVolume = normalizeVolume(
      "sfxVolume" in settings ? settings.sfxVolume : undefined,
      DEFAULT_SETTINGS.sfxVolume,
    );
    const difficulty =
      "difficulty" in settings && isDifficulty(settings.difficulty)
        ? settings.difficulty
        : DEFAULT_SETTINGS.difficulty;
    return { musicVolume, sfxVolume, difficulty };
  } catch (error) {
    logError(
      "Failed to load settings from localStorage",
      error,
      "SettingsMenu",
    );
    return DEFAULT_SETTINGS;
  }
}

interface VolumeControlProperties {
  emoji: string;
  id: string;
  label: string;
  onChange: (value: number) => void;
  testId: string;
  value: number;
}

function VolumeControl({
  emoji,
  id,
  label,
  onChange,
  testId,
  value,
}: VolumeControlProperties) {
  const progress = value.toString();

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          color: "#09ff00",
          fontSize: "1rem",
          fontWeight: "600",
          marginBottom: "0.5rem",
          textShadow: "0 0 10px rgba(9, 255, 0, 0.5)",
        }}
      >
        {emoji} {label}: {progress}%
      </label>
      <input
        data-testid={testId}
        id={id}
        max="100"
        min="0"
        style={{
          width: "100%",
          height: "8px",
          borderRadius: "4px",
          background: `linear-gradient(to right, #09ff00 0%, #09ff00 ${progress}%, rgba(100, 116, 139, 0.3) ${progress}%, rgba(100, 116, 139, 0.3) 100%)`,
          outline: "none",
          cursor: "pointer",
          WebkitAppearance: "none",
        }}
        type="range"
        value={value}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
      />
    </div>
  );
}

const SettingsMenuComponent = ({ onClose }: SettingsMenuProperties) => {
  const audioManager = getAudioManager();
  const [initialSettings] = useState(loadSettings);
  const [musicVolume, setMusicVolume] = useState(initialSettings.musicVolume);
  const [sfxVolume, setSfxVolume] = useState(initialSettings.sfxVolume);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    initialSettings.difficulty,
  );

  useEffect(() => {
    audioManager.setMusicVolume(musicVolume / 100);
    audioManager.setSfxVolume(sfxVolume / 100);
  }, [audioManager, musicVolume, sfxVolume]);

  const handleSave = () => {
    try {
      // Save to localStorage
      const settings = {
        musicVolume,
        sfxVolume,
        difficulty,
      };
      localStorage.setItem("game-settings", JSON.stringify(settings));

      // Invalidate cached difficulty so new setting takes effect
      invalidateDifficultyCache();

      // Apply volumes (slider values are 0-100, audioManager expects 0-1)
      audioManager.setMusicVolume(musicVolume / 100);
      audioManager.setSfxVolume(sfxVolume / 100);

      onClose();
    } catch (error) {
      logError(
        "Failed to save settings to localStorage",
        error,
        "SettingsMenu",
      );
      // Still close the menu even if save failed
      onClose();
    }
  };

  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);
    audioManager.setMusicVolume(value / 100);
  };

  const handleSFXVolumeChange = (value: number) => {
    setSfxVolume(value);
    audioManager.setSfxVolume(value / 100);
    // Play a test sound
    audioManager.playLaser();
  };

  return (
    <ModalShell
      dialogTestId="settings-menu-dialog"
      labelledBy="settings-title"
      maxWidth="500px"
      overlayTestId="settings-menu-overlay"
      onDismiss={onClose}
    >
      {/* Header */}
      <h2
        id="settings-title"
        style={{
          color: "#09ff00",
          marginBottom: "1.5rem",
          fontSize: "1.8rem",
          fontWeight: "700",
          textAlign: "center",
          textShadow: "0 0 20px rgba(9, 255, 0, 0.8)",
        }}
      >
        ⚙️ SETTINGS
      </h2>

      <VolumeControl
        emoji="🎵"
        id="music-volume"
        label="Music Volume"
        testId="music-volume-slider"
        value={musicVolume}
        onChange={handleMusicVolumeChange}
      />
      <VolumeControl
        emoji="🔊"
        id="sfx-volume"
        label="SFX Volume"
        testId="sfx-volume-slider"
        value={sfxVolume}
        onChange={handleSFXVolumeChange}
      />

      {/* Difficulty */}
      <div style={{ marginBottom: "2rem" }}>
        <label
          htmlFor="difficulty"
          style={{
            display: "block",
            color: "#09ff00",
            fontSize: "1rem",
            fontWeight: "600",
            marginBottom: "0.5rem",
            textShadow: "0 0 10px rgba(9, 255, 0, 0.5)",
          }}
        >
          💪 Difficulty
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => {
            if (isDifficulty(e.target.value)) {
              setDifficulty(e.target.value);
            }
          }}
          data-testid="difficulty-selector"
          style={{
            width: "100%",
            padding: "0.8rem",
            fontSize: "1rem",
            background: "rgba(10, 14, 27, 0.8)",
            border: "2px solid rgba(9, 255, 0, 0.3)",
            borderRadius: "8px",
            color: "#09ff00",
            cursor: "pointer",
            outline: "none",
            fontWeight: "600",
            boxShadow:
              "0 0 15px rgba(9, 255, 0, 0.2), inset 0 0 10px rgba(9, 255, 0, 0.05)",
          }}
        >
          {[...DIFFICULTIES].map((level) => (
            <option
              key={level}
              value={level}
              style={{ background: "#0a0e27", color: "#09ff00" }}
            >
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
        }}
      >
        <NeonButton onClick={handleSave} data-testid="settings-save-button">
          💾 Save
        </NeonButton>
        <NeonButton
          onClick={onClose}
          data-testid="settings-cancel-button"
          variant="muted"
        >
          ✖️ Cancel
        </NeonButton>
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
    </ModalShell>
  );
};

export const SettingsMenu = memo(SettingsMenuComponent);
