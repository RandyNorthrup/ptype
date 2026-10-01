import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManager, getAudioManager } from "../../src/utils/audioManager";

function createAudioParameter(initialValue = 0) {
  return {
    value: initialValue,
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    setValueAtTime: vi.fn(),
  };
}

function dispatchEndedEvent(
  event: string,
  listener: EventListenerOrEventListenerObject,
): void {
  if (event === "ended" && typeof listener === "function") {
    listener(new Event("ended"));
  }
}

function resolvePlayback(): Promise<void> {
  return Promise.resolve();
}

class FakeAudioNode {
  connect = vi.fn();
  disconnect = vi.fn();
  addEventListener = vi.fn(dispatchEndedEvent);
}

class FakeOscillator extends FakeAudioNode {
  frequency = createAudioParameter();
  start = vi.fn();
  stop = vi.fn();
  type: OscillatorType = "sine";
}

class FakeGain extends FakeAudioNode {
  gain = createAudioParameter();
}

class FakeBufferSource extends FakeAudioNode {
  buffer: unknown = null;
  start = vi.fn();
  stop = vi.fn();
}

class FakeFilter extends FakeAudioNode {
  frequency = createAudioParameter();
  type = "lowpass";
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  currentTime = 1;
  destination = {};
  sampleRate = 8;
  state: AudioContextState = "running";
  oscillators: FakeOscillator[] = [];
  bufferSources: FakeBufferSource[] = [];
  close = vi.fn(() => {
    this.state = "closed";
    return Promise.resolve();
  });
  resume = vi.fn(() => {
    this.state = "running";
    return Promise.resolve();
  });

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  createOscillator() {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createGain() {
    return new FakeGain();
  }

  createBuffer(_channels: number, length: number) {
    return { getChannelData: vi.fn(() => new Float32Array(length)) };
  }

  createBufferSource() {
    const source = new FakeBufferSource();
    this.bufferSources.push(source);
    return source;
  }

  createBiquadFilter() {
    return new FakeFilter();
  }
}

class FakeAudio {
  static instances: FakeAudio[] = [];
  currentTime = 0;
  loop = false;
  volume = 1;
  pause = vi.fn();
  play = vi.fn(resolvePlayback);

  constructor(public readonly source: string) {
    FakeAudio.instances.push(this);
  }
}

describe("audio manager", () => {
  beforeEach(() => {
    FakeAudio.instances = [];
    FakeAudioContext.instances = [];
    vi.stubGlobal("Audio", FakeAudio);
    vi.stubGlobal("AudioContext", FakeAudioContext);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("defers music until interaction and controls playback settings", async () => {
    const manager = new AudioManager();
    const audio = FakeAudio.instances[0]!;
    expect(audio.source).toBe("/assets/sounds/game_music.mp3");
    expect(audio.loop).toBe(true);

    manager.playMusic();
    expect(audio.play).not.toHaveBeenCalled();
    document.dispatchEvent(new MouseEvent("click"));
    await Promise.resolve();
    expect(audio.play).toHaveBeenCalledOnce();

    manager.setMusicVolume(2);
    manager.setSfxVolume(-1);
    expect(manager.getSettings()).toMatchObject({
      musicVolume: 1,
      sfxVolume: 0,
      musicEnabled: true,
      sfxEnabled: true,
    });

    manager.pauseMusic();
    manager.stopMusic();
    expect(audio.pause).toHaveBeenCalledTimes(2);
    expect(audio.currentTime).toBe(0);

    manager.toggleMusic();
    manager.toggleSfx();
    expect(manager.getSettings()).toMatchObject({
      musicEnabled: false,
      sfxEnabled: false,
    });
  });

  it("generates each procedural effect and disconnects completed nodes", () => {
    const manager = new AudioManager();
    manager.playLaser();
    manager.playTypeCorrect();
    manager.playTypeIncorrect();
    manager.playWordComplete();
    manager.playPowerUp();
    manager.playDamage();
    manager.playExplosion();

    const context = FakeAudioContext.instances[0]!;
    expect(context.oscillators).toHaveLength(6);
    expect(context.oscillators.map(({ type }) => type)).toEqual([
      "square",
      "sine",
      "sawtooth",
      "sine",
      "square",
      "sawtooth",
    ]);
    expect(context.bufferSources).toHaveLength(1);
    expect(context.bufferSources[0]?.start).toHaveBeenCalledOnce();
  });

  it("schedules EMP pulses and skips effects while SFX is disabled", () => {
    vi.useFakeTimers();
    const manager = new AudioManager();
    manager.playEMP();
    vi.runAllTimers();
    expect(FakeAudioContext.instances[0]?.oscillators).toHaveLength(5);

    manager.toggleSfx();
    manager.playLaser();
    manager.playExplosion();
    manager.playWordComplete();
    manager.playEMP();
    vi.runAllTimers();
    expect(FakeAudioContext.instances[0]?.oscillators).toHaveLength(5);
  });

  it("resumes suspended contexts and disposes resources", async () => {
    const manager = new AudioManager();
    manager.playTypeCorrect();
    const firstContext = FakeAudioContext.instances[0]!;
    firstContext.state = "suspended";
    manager.playTypeCorrect();
    expect(firstContext.resume).toHaveBeenCalledOnce();

    manager.dispose();
    await Promise.resolve();
    expect(firstContext.close).toHaveBeenCalledOnce();
  });

  it("returns one lazily-created singleton", () => {
    expect(getAudioManager()).toBe(getAudioManager());
  });
});
