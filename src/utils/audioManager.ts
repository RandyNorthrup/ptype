/**
 * Audio Manager
 * Handles background music and sound effects
 */

export class AudioManager {
  private bgMusic: HTMLAudioElement | null = null;
  private soundEffects: Map<string, HTMLAudioElement> = new Map();
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
   * Setup handler to enable audio on first user interaction
   */
  private setupUserInteractionHandler(): void {
    const enableAudio = () => {
      this.hasUserInteracted = true;
      
      // Play pending music if requested
      if (this.pendingMusicPlay && this.isMusicEnabled && this.bgMusic) {
        // Let audio errors surface naturally
        this.bgMusic.play();
        this.pendingMusicPlay = false;
      }
      
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };
    
    // Listen for various user interactions
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
  }

  /**
   * Play background music
   */
  playMusic(): void {
    if (!this.isMusicEnabled || !this.bgMusic) return;

    // If user hasn't interacted yet, queue the music to play later
    if (!this.hasUserInteracted) {
      this.pendingMusicPlay = true;
      console.info('🎵 Music queued - will start after user interaction');
      return;
    }

    // Let audio errors surface naturally
    this.bgMusic.play();
  }

  /**
   * Pause background music
   */
  pauseMusic(): void {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  /**
   * Stop background music
   */
  stopMusic(): void {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  }

  /**
   * Set music volume (0-1)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.musicVolume;
    }
  }

  /**
   * Set sound effects volume (0-1)
   */
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Toggle music on/off
   */
  toggleMusic(): void {
    this.isMusicEnabled = !this.isMusicEnabled;
    
    if (this.isMusicEnabled) {
      this.playMusic();
    } else {
      this.pauseMusic();
    }
  }

  /**
   * Toggle sound effects on/off
   */
  toggleSfx(): void {
    this.isSfxEnabled = !this.isSfxEnabled;
  }

  /**
   * Play a sound effect using Web Audio API for procedural sounds
   * (Matching Python's numpy-based sound generation)
   */
  private playProceduralSound(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    envelope?: { attack: number; decay: number; sustain: number; release: number }
  ): void {
    if (!this.isSfxEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Apply envelope if provided
    if (envelope) {
      const now = audioContext.currentTime;
      const { attack, decay, sustain, release } = envelope;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.sfxVolume, now + attack);
      gainNode.gain.linearRampToValueAtTime(sustain * this.sfxVolume, now + attack + decay);
      gainNode.gain.setValueAtTime(sustain * this.sfxVolume, now + duration - release);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
    } else {
      gainNode.gain.value = this.sfxVolume;
    }

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  /**
   * Play laser sound
   */
  playLaser(): void {
    this.playProceduralSound(800, 0.1, 'square', {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.3,
      release: 0.04
    });
  }

  /**
   * Play explosion sound
   */
  playExplosion(): void {
    // Create explosion sound with noise
    if (!this.isSfxEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 0.5; // 0.5 seconds
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Envelope
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(this.sfxVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    source.start(now);
    source.stop(now + 0.5);
  }

  /**
   * Play typing sound (correct)
   */
  playTypeCorrect(): void {
    this.playProceduralSound(600, 0.05, 'sine');
  }

  /**
   * Play typing sound (incorrect)
   */
  playTypeIncorrect(): void {
    this.playProceduralSound(200, 0.1, 'sawtooth');
  }

  /**
   * Play word complete sound
   */
  playWordComplete(): void {
    // Ascending tone
    if (!this.isSfxEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    
    const now = audioContext.currentTime;
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);

    gainNode.gain.setValueAtTime(this.sfxVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }

  /**
   * Play power-up sound
   */
  playPowerUp(): void {
    this.playProceduralSound(1000, 0.3, 'square', {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.6,
      release: 0.15
    });
  }

  /**
   * Play damage sound
   */
  playDamage(): void {
    this.playProceduralSound(150, 0.2, 'sawtooth', {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.4,
      release: 0.14
    });
  }

  /**
   * Play EMP sound
   */
  playEMP(): void {
    // Electric zap sound
    if (!this.isSfxEnabled) return;

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playProceduralSound(200 + Math.random() * 400, 0.05, 'square');
      }, i * 50);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): { musicVolume: number; sfxVolume: number; musicEnabled: boolean; sfxEnabled: boolean } {
    return {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      musicEnabled: this.isMusicEnabled,
      sfxEnabled: this.isSfxEnabled,
    };
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stopMusic();
    this.soundEffects.clear();
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
