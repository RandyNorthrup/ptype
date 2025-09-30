"""SoundManager: programmatic sound effects for P-Type.

Separated for modular architecture. Safe to import standalone.
"""
from typing import List
import math
import random
try:
    import pygame
except Exception:  # pragma: no cover - allow import in non-pygame envs
    pygame = None  # type: ignore


class SoundManager:
    """Simple sound effects manager using pygame's built-in sound generation"""
    def __init__(self, volume: float = 0.8):
        self.volume = volume
        self.sounds = {}
        self.generate_sounds()
    
    def generate_sounds(self):
        """Generate simple sound effects programmatically"""
        if pygame is None:
            return
        try:
            # Generate simple beep/click sounds using pygame's sound arrays
            # Type sound - pew-pew laser shooting sound
            self.sounds['type'] = self.create_pew_sound()  # Pew-pew laser sound
            # Correct word - explosion sound when word is destroyed
            self.sounds['correct'] = self.create_word_explosion_sound(180)  # Dramatic 180ms explosion
            # Wrong key - error sound
            self.sounds['wrong'] = self.create_beep(220, 150)  # A3 note, 150ms
            # Ship destroyed - explosion
            self.sounds['destroy'] = self.create_explosion_sound(250)  # 250ms explosion
            # Boss appear - dramatic sound
            self.sounds['boss'] = self.create_boss_sound(500)  # Dramatic boss entrance
            # Level complete - victory sound
            self.sounds['level'] = self.create_arpeggio([523, 659, 784], 100)  # C-E-G chord
            # Collision - impact sound
            self.sounds['collision'] = self.create_impact_sound(150)  # Impact thud
            # Achievement unlocked
            self.sounds['achievement'] = self.create_arpeggio([440, 554, 659, 880], 80)  # Success fanfare
            # Missile launch - whoosh/rocket launch
            self.sounds['missile_launch'] = self.create_whoosh_sound(280)
        except Exception:
            # Create empty sound objects as fallback
            for key in ['type', 'correct', 'wrong', 'destroy', 'boss', 'level', 'collision', 'achievement', 'missile_launch']:
                self.sounds[key] = None

    # --- Sound Generators ---

    def create_explosion_sound(self, duration: int) -> 'pygame.mixer.Sound':
        try:
            import numpy as np
            sample_rate = 22050
            samples = int(sample_rate * duration / 1000)
            waves = []
            for _ in range(samples):
                waves.append([0, 0])
            blast_samples = int(samples * 0.15)
            for i in range(blast_samples):
                import numpy as np
                blast_envelope = 1.0 - (i / blast_samples) * 0.7
                noise = np.random.randint(-20000, 20000)
                waves[i][0] = int(noise * blast_envelope)
                waves[i][1] = int(noise * blast_envelope)
            for i in range(samples):
                t = float(i) / sample_rate
                rumble = 0
                for freq in [25, 35, 45, 55]:
                    import numpy as np
                    phase = np.random.random() * 2 * np.pi
                    rumble += math.sin(2 * math.pi * freq * t + phase) * 5000
                if i < blast_samples:
                    rumble_env = i / blast_samples * 0.5
                else:
                    decay_pos = (i - blast_samples) / (samples - blast_samples)
                    rumble_env = 0.5 * math.exp(-3 * decay_pos)
                waves[i][0] += int(rumble * rumble_env)
                waves[i][1] += int(rumble * rumble_env)
            crack_start = int(samples * 0.05)
            crack_end = int(samples * 0.3)
            for i in range(crack_start, crack_end):
                t = float(i) / sample_rate
                crack_freq = 200 + 100 * math.exp(-(i - crack_start) / (crack_end - crack_start))
                crack = math.sin(2 * math.pi * crack_freq * t) * 8000
                crack_env = 1.0 - ((i - crack_start) / (crack_end - crack_start))
                waves[i][0] += int(crack * crack_env)
                waves[i][1] += int(crack * crack_env)
            import numpy as np
            sound_array = np.array(waves, dtype=np.int16)
            return pygame.sndarray.make_sound(sound_array)
        except ImportError:
            return pygame.mixer.Sound(buffer=bytes(100))

    def create_boss_sound(self, duration: int) -> 'pygame.mixer.Sound':
        try:
            import numpy as np
            sample_rate = 22050
            samples = int(sample_rate * duration / 1000)
            waves: List[List[int]] = []
            for i in range(samples):
                t = float(i) / sample_rate
                base = math.sin(2 * math.pi * 110 * t)
                over = 0.4 * math.sin(2 * math.pi * 220 * t)
                sub = 0.3 * math.sin(2 * math.pi * 55 * t)
                value = int(12000 * (base + over + sub))
                envelope = math.exp(-3 * (i - samples * 0.02) / samples)
                value = int(value * envelope)
                value = max(-32767, min(32767, value))
                waves.append([value, value])
            import numpy as np
            sound_array = np.array(waves, dtype=np.int16)
            return pygame.sndarray.make_sound(sound_array)
        except ImportError:
            return pygame.mixer.Sound(buffer=bytes(100))

    def create_sweep(self, start_freq: int, end_freq: int, duration: int) -> 'pygame.mixer.Sound':
        try:
            import numpy as np
            sample_rate = 22050
            samples = int(sample_rate * duration / 1000)
            waves = []
            for i in range(samples):
                t = float(i) / sample_rate
                progress = i / samples
                freq = start_freq * (1 - progress) + end_freq * progress
                noise = random.uniform(-0.1, 0.1)
                value = int(20000 * (math.sin(2 * math.pi * freq * t) + noise * 0.3))
                envelope = math.exp(-5 * progress)
                value = int(value * envelope)
                if abs(value) > 16000:
                    value = 16000 if value > 0 else -16000
                waves.append([value, value])
            import numpy as np
            sound_array = np.array(waves, dtype=np.int16)
            return pygame.sndarray.make_sound(sound_array)
        except ImportError:
            return self.create_sweep(start_freq, end_freq, duration)

    def set_volume(self, volume: float):
        self.volume = max(0.0, min(1.0, volume))

    def play(self, sound_name: str):
        if pygame is None:
            return
        if self.volume > 0 and sound_name in self.sounds and self.sounds[sound_name]:
            try:
                self.sounds[sound_name].set_volume(self.volume)
                self.sounds[sound_name].play()
            except Exception:
                pass

    def create_pew_sound(self) -> 'pygame.mixer.Sound':
        try:
            import numpy as np
            sample_rate = 22050
            duration = 150
            samples = int(sample_rate * duration / 1000)
            waves = [0.0] * samples
            for i in range(samples):
                t = float(i) / sample_rate
                progress = i / samples
                freq = 1200 * ((1 - progress) ** 3) + 100
                wave = math.sin(2 * math.pi * freq * t)
                wave += 0.3 * math.sin(2 * math.pi * freq * 1.5 * t)
                if progress < 0.01:
                    amplitude = progress / 0.01
                elif progress < 0.3:
                    amplitude = 1.0
                else:
                    amplitude = (1 - progress) / 0.7
                waves[i] = wave * amplitude * 16000
            stereo_waves = [[int(w), int(w)] for w in waves]
            import numpy as np
            stereo = np.array(stereo_waves, dtype=np.int16)
            return pygame.sndarray.make_sound(stereo)
        except ImportError:
            return self.create_sweep(1200, 100, 150)

    def create_laser(self, start_freq: int, end_freq: int, duration: int) -> 'pygame.mixer.Sound':
        return self.create_sweep(start_freq, end_freq, duration)

    def create_arpeggio(self, frequencies: List[int], note_duration: int) -> 'pygame.mixer.Sound':
        try:
            import numpy as np
            sample_rate = 22050
            waves = []
            for freq in frequencies:
                samples = int(sample_rate * note_duration / 1000)
                for i in range(samples):
                    t = float(i) / sample_rate
                    value = int(32767 * math.sin(2 * math.pi * freq * t))
                    envelope = 1.0
                    if i < samples * 0.1:
                        envelope = i / (samples * 0.1)
                    elif i > samples * 0.8:
                        envelope = (samples - i) / (samples * 0.2)
                    value = int(value * envelope * 0.7)
                    waves.append([value, value])
            import numpy as np
            sound_array = np.array(waves, dtype=np.int16)
            return pygame.sndarray.make_sound(sound_array)
        except ImportError:
            return pygame.mixer.Sound(buffer=bytes(100))

    def create_beep(self, frequency: int, duration: int) -> 'pygame.mixer.Sound':
        try:
            import numpy as np
            sample_rate = 22050
            samples = int(sample_rate * duration / 1000)
            waves = []
            for i in range(samples):
                t = float(i) / sample_rate
                value = int(12000 * math.sin(2 * math.pi * frequency * t))
                envelope = math.exp(-3 * (i / samples))
                waves.append([int(value * envelope), int(value * envelope)])
            import numpy as np
            sound_array = np.array(waves, dtype=np.int16)
            return pygame.sndarray.make_sound(sound_array)
        except ImportError:
            return pygame.mixer.Sound(buffer=bytes(100))

    def create_impact_sound(self, duration: int) -> 'pygame.mixer.Sound':
        try:
            import numpy as np
            sample_rate = 22050
            samples = int(sample_rate * duration / 1000)
            waves = []
            for i in range(samples):
                t = float(i) / sample_rate
                value = int(20000 * (random.uniform(-1, 1)))
                envelope = math.exp(-6 * (i / samples))
                waves.append([int(value * envelope), int(value * envelope)])
            import numpy as np
            sound_array = np.array(waves, dtype=np.int16)
            return pygame.sndarray.make_sound(sound_array)
        except ImportError:
            return pygame.mixer.Sound(buffer=bytes(100))

    def create_word_explosion_sound(self, duration: int) -> 'pygame.mixer.Sound':
        return self.create_explosion_sound(duration)

    def create_whoosh_sound(self, duration: int = 300) -> 'pygame.mixer.Sound':
        try:
            import numpy as np
            sample_rate = 22050
            samples = int(sample_rate * duration / 1000)
            waves = np.zeros((samples, 2), dtype=np.int16)
            for i in range(samples):
                t = i / sample_rate
                p = i / samples
                noise = (random.random() * 2 - 1) * (0.6 + 0.4 * p)
                rumble = 0.5 * math.sin(2 * math.pi * (40 + 20 * p) * t)
                whistle = 0.3 * math.sin(2 * math.pi * (300 + 500 * p) * t)
                if p < 0.1:
                    env = p / 0.1
                elif p > 0.85:
                    env = max(0.0, (1 - (p - 0.85) / 0.15))
                else:
                    env = 1.0
                val = (noise + rumble + whistle) * env
                v = int(max(-1.0, min(1.0, val)) * 14000)
                waves[i, 0] = v
                waves[i, 1] = v
            return pygame.sndarray.make_sound(waves)
        except ImportError:
            return self.create_sweep(120, 500, duration)

