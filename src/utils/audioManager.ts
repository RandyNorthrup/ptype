/**
 * Audio Manager
 * Handles background music and sound effects using a single shared AudioContext
 */

import { publicAssetUrl } from "./publicAssetUrl";

const AUDIO_CONFIG = {
  defaultMusicVolume: 0.5,
  defaultSfxVolume: 0.7,
  laser: {
    frequency: 800,
    duration: 0.1,
    envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.04 },
  },
  explosion: { duration: 0.5, filterFrequency: 1000, minimumGain: 0.01 },
  correct: { frequency: 600, duration: 0.05 },
  incorrect: { frequency: 200, duration: 0.1 },
  wordComplete: {
    startFrequency: 400,
    endFrequency: 800,
    duration: 0.2,
    minimumGain: 0.01,
  },
  powerUp: {
    frequency: 1000,
    duration: 0.3,
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.6, release: 0.15 },
  },
  damage: {
    frequency: 150,
    duration: 0.2,
    envelope: { attack: 0.01, decay: 0.05, sustain: 0.4, release: 0.14 },
  },
  emp: {
    pulseCount: 5,
    baseFrequency: 200,
    frequencyRange: 400,
    duration: 0.05,
    intervalMilliseconds: 50,
  },
} as const;

async function ignoreRejection(promise: Promise<unknown>): Promise<void> {
  try {
    await promise;
  } catch {
    // Browser audio promises are expected to reject when permission is absent.
  }
}

export class AudioManager {
  private bgMusic: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private musicVolume: number = AUDIO_CONFIG.defaultMusicVolume;
  private sfxVolume: number = AUDIO_CONFIG.defaultSfxVolume;
  private isMusicEnabled = true;
  private isSfxEnabled = true;
  private hasUserInteracted = false;
  private pendingMusicPlay = false;

  constructor() {
    // Initialize background music
    this.bgMusic = new Audio(publicAssetUrl("assets/sounds/game_music.mp3"));
    this.bgMusic.loop = true;
    this.bgMusic.volume = this.musicVolume;

    // Wait for user interaction before playing audio
    this.setupUserInteractionHandler();
  }

  /**
   * Get or create the shared AudioContext (lazy initialization)
   */
  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new AudioContext();
    }
    // Resume if suspended (happens after tab backgrounding)
    if (this.audioContext.state === "suspended") {
      void ignoreRejection(this.audioContext.resume());
    }
    return this.audioContext;
  }

  /**
   * Setup handler to enable audio on first user interaction
   */
  private setupUserInteractionHandler(): void {
    const enableAudio = () => {
      this.hasUserInteracted = true;

      // Play pending music if requested
      if (this.pendingMusicPlay && this.isMusicEnabled && this.bgMusic) {
        void ignoreRejection(this.bgMusic.play());
        this.pendingMusicPlay = false;
      }
    };

    // All use { once: true } so they auto-remove after first trigger
    document.addEventListener("click", enableAudio, { once: true });
    document.addEventListener("keydown", enableAudio, { once: true });
    document.addEventListener("touchstart", enableAudio, { once: true });
  }

  private createOscillator(context: AudioContext, type: OscillatorType) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = type;

    return { gainNode, oscillator };
  }

  /**
   * Play a procedural sound using the shared AudioContext
   */
  private playProceduralSound(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    envelope?: {
      attack: number;
      decay: number;
      sustain: number;
      release: number;
    },
  ): void {
    if (!this.isSfxEnabled) return;

    try {
      const context = this.getAudioContext();
      const { gainNode, oscillator } = this.createOscillator(context, type);
      oscillator.frequency.value = frequency;

      if (envelope) {
        const now = context.currentTime;
        const { attack, decay, sustain, release } = envelope;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume, now + attack);
        gainNode.gain.linearRampToValueAtTime(
          sustain * this.sfxVolume,
          now + attack + decay,
        );
        gainNode.gain.setValueAtTime(
          sustain * this.sfxVolume,
          now + duration - release,
        );
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
      } else {
        gainNode.gain.value = this.sfxVolume;
      }

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);

      oscillator.addEventListener("ended", () => {
        oscillator.disconnect();
        gainNode.disconnect();
      });
    } catch {
      // AudioContext may be unavailable
    }
  }

  playMusic(): void {
    if (!this.isMusicEnabled || !this.bgMusic) return;

    if (!this.hasUserInteracted) {
      this.pendingMusicPlay = true;
      return;
    }

    void ignoreRejection(this.bgMusic.play());
  }

  pauseMusic(): void {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  stopMusic(): void {
    if (!this.bgMusic) {
      return;
    }

    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.musicVolume;
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  toggleMusic(): void {
    this.isMusicEnabled = !this.isMusicEnabled;

    if (this.isMusicEnabled) {
      this.playMusic();
    } else {
      this.pauseMusic();
    }
  }

  toggleSfx(): void {
    this.isSfxEnabled = !this.isSfxEnabled;
  }

  playLaser(): void {
    const { frequency, duration, envelope } = AUDIO_CONFIG.laser;
    this.playProceduralSound(frequency, duration, "square", envelope);
  }

  playExplosion(): void {
    if (!this.isSfxEnabled) return;

    try {
      const context = this.getAudioContext();
      const { duration, filterFrequency, minimumGain } = AUDIO_CONFIG.explosion;
      const bufferSize = context.sampleRate * duration;
      const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const data = buffer.getChannelData(0);

      for (let index = 0; index < bufferSize; index++) {
        data[index] = Math.random() * 2 - 1;
      }

      const source = context.createBufferSource();
      source.buffer = buffer;

      const gainNode = context.createGain();
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = filterFrequency;

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(context.destination);

      const now = context.currentTime;
      gainNode.gain.setValueAtTime(this.sfxVolume, now);
      gainNode.gain.exponentialRampToValueAtTime(minimumGain, now + duration);

      source.start(now);
      source.stop(now + duration);

      source.addEventListener("ended", () => {
        source.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      });
    } catch {
      // AudioContext may be unavailable
    }
  }

  playTypeCorrect(): void {
    const { frequency, duration } = AUDIO_CONFIG.correct;
    this.playProceduralSound(frequency, duration, "sine");
  }

  playTypeIncorrect(): void {
    const { frequency, duration } = AUDIO_CONFIG.incorrect;
    this.playProceduralSound(frequency, duration, "sawtooth");
  }

  playWordComplete(): void {
    if (!this.isSfxEnabled) return;

    try {
      const context = this.getAudioContext();
      const { gainNode, oscillator } = this.createOscillator(context, "sine");

      const now = context.currentTime;
      const { startFrequency, endFrequency, duration, minimumGain } =
        AUDIO_CONFIG.wordComplete;
      oscillator.frequency.setValueAtTime(startFrequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        endFrequency,
        now + duration,
      );

      gainNode.gain.setValueAtTime(this.sfxVolume, now);
      gainNode.gain.exponentialRampToValueAtTime(minimumGain, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);

      oscillator.addEventListener("ended", () => {
        oscillator.disconnect();
        gainNode.disconnect();
      });
    } catch {
      // AudioContext may be unavailable
    }
  }

  playPowerUp(): void {
    const { frequency, duration, envelope } = AUDIO_CONFIG.powerUp;
    this.playProceduralSound(frequency, duration, "square", envelope);
  }

  playDamage(): void {
    const { frequency, duration, envelope } = AUDIO_CONFIG.damage;
    this.playProceduralSound(frequency, duration, "sawtooth", envelope);
  }

  playEMP(): void {
    if (!this.isSfxEnabled) return;

    const {
      pulseCount,
      baseFrequency,
      frequencyRange,
      duration,
      intervalMilliseconds,
    } = AUDIO_CONFIG.emp;
    for (let index = 0; index < pulseCount; index++) {
      setTimeout(() => {
        this.playProceduralSound(
          baseFrequency + Math.random() * frequencyRange,
          duration,
          "square",
        );
      }, index * intervalMilliseconds);
    }
  }

  getSettings(): {
    musicVolume: number;
    sfxVolume: number;
    musicEnabled: boolean;
    sfxEnabled: boolean;
  } {
    return {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      musicEnabled: this.isMusicEnabled,
      sfxEnabled: this.isSfxEnabled,
    };
  }

  dispose(): void {
    this.stopMusic();
    if (this.audioContext && this.audioContext.state !== "closed") {
      void ignoreRejection(this.audioContext.close());
      this.audioContext = null;
    }
  }
}

// Singleton instance
const audioManagerSingleton: { instance: AudioManager | null } = {
  instance: null,
};

export function getAudioManager(): AudioManager {
  audioManagerSingleton.instance ??= new AudioManager();
  return audioManagerSingleton.instance;
}
