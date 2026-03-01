/**
 * Audio Manager
 * Handles background music and sound effects using a single shared AudioContext
 */

export class AudioManager {
  private bgMusic: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private isMusicEnabled = true;
  private isSfxEnabled = true;
  private hasUserInteracted = false;
  private pendingMusicPlay = false;

  constructor() {
    // Initialize background music
    this.bgMusic = new Audio('/assets/sounds/game_music.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = this.musicVolume;
    
    // Wait for user interaction before playing audio
    this.setupUserInteractionHandler();
  }

  /**
   * Get or create the shared AudioContext (lazy initialization)
   */
  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new AudioContext();
    }
    // Resume if suspended (happens after tab backgrounding)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
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
        this.bgMusic.play().catch(() => { /* User gesture may still be insufficient */ });
        this.pendingMusicPlay = false;
      }
    };
    
    // All use { once: true } so they auto-remove after first trigger
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
  }

  playMusic(): void {
    if (!this.isMusicEnabled || !this.bgMusic) return;

    if (!this.hasUserInteracted) {
      this.pendingMusicPlay = true;
      return;
    }

    this.bgMusic.play().catch(() => { /* Autoplay may be blocked */ });
  }

  pauseMusic(): void {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  stopMusic(): void {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
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

  /**
   * Play a procedural sound using the shared AudioContext
   */
  private playProceduralSound(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    envelope?: { attack: number; decay: number; sustain: number; release: number }
  ): void {
    if (!this.isSfxEnabled) return;

    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      if (envelope) {
        const now = ctx.currentTime;
        const { attack, decay, sustain, release } = envelope;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume, now + attack);
        gainNode.gain.linearRampToValueAtTime(sustain * this.sfxVolume, now + attack + decay);
        gainNode.gain.setValueAtTime(sustain * this.sfxVolume, now + duration - release);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
      } else {
        gainNode.gain.value = this.sfxVolume;
      }

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
      
      // Auto-disconnect after sound completes
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch {
      // AudioContext may be unavailable
    }
  }

  playLaser(): void {
    this.playProceduralSound(800, 0.1, 'square', {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.3,
      release: 0.04
    });
  }

  playExplosion(): void {
    if (!this.isSfxEnabled) return;

    try {
      const ctx = this.getAudioContext();
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(this.sfxVolume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      source.start(now);
      source.stop(now + 0.5);
      
      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      };
    } catch {
      // AudioContext may be unavailable
    }
  }

  playTypeCorrect(): void {
    this.playProceduralSound(600, 0.05, 'sine');
  }

  playTypeIncorrect(): void {
    this.playProceduralSound(200, 0.1, 'sawtooth');
  }

  playWordComplete(): void {
    if (!this.isSfxEnabled) return;

    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      
      const now = ctx.currentTime;
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);

      gainNode.gain.setValueAtTime(this.sfxVolume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      oscillator.start(now);
      oscillator.stop(now + 0.2);
      
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch {
      // AudioContext may be unavailable
    }
  }

  playPowerUp(): void {
    this.playProceduralSound(1000, 0.3, 'square', {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.6,
      release: 0.15
    });
  }

  playDamage(): void {
    this.playProceduralSound(150, 0.2, 'sawtooth', {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.4,
      release: 0.14
    });
  }

  playEMP(): void {
    if (!this.isSfxEnabled) return;

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playProceduralSound(200 + Math.random() * 400, 0.05, 'square');
      }, i * 50);
    }
  }

  getSettings(): { musicVolume: number; sfxVolume: number; musicEnabled: boolean; sfxEnabled: boolean } {
    return {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      musicEnabled: this.isMusicEnabled,
      sfxEnabled: this.isSfxEnabled,
    };
  }

  dispose(): void {
    this.stopMusic();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
let audioManager: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManager) {
    audioManager = new AudioManager();
  }
  return audioManager;
}
