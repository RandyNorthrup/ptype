"""Visual effect classes for P-Type: LaserBeam, TypingEffect, ModernExplosion, Missile.

These are extracted to make rendering/effects modular.
"""
import math
import random
try:
    import pygame
except Exception:  # pragma: no cover
    pygame = None  # type: ignore

try:
    from ..constants import (
        NEON_GREEN, MODERN_WHITE, ACCENT_CYAN, DARKER_BG, ACCENT_ORANGE,
        PARTICLE_DRAG, PARTICLE_GRAVITY
    )
except Exception:  # fallback when run as script
    from constants import (
        NEON_GREEN, MODERN_WHITE, ACCENT_CYAN, DARKER_BG, ACCENT_ORANGE,
        PARTICLE_DRAG, PARTICLE_GRAVITY
    )


class LaserBeam:
    def __init__(self, start_x: int, start_y: int, end_x: int, end_y: int):
        self.start_x = start_x
        self.start_y = start_y
        self.end_x = end_x
        self.end_y = end_y
        self.life = 6
        self.max_life = 6
        self.color = NEON_GREEN
        self.width = 4
    
    def update(self):
        self.life -= 1
    
    def draw(self, screen):
        if pygame is None or self.life <= 0:
            return
        alpha = (self.life / self.max_life) ** 0.5
        for _ in range(3):
            offset_x = random.randint(-2, 2) * (1 - alpha)
            offset_y = random.randint(-2, 2) * (1 - alpha)
            for i in range(4):
                width = max(1, self.width - i)
                intensity = alpha * (1 - i * 0.2)
                if intensity <= 0:
                    continue
                color = MODERN_WHITE if i == 0 and self.life > self.max_life * 0.8 else (
                    int(self.color[0] * intensity),
                    int(self.color[1] * intensity),
                    int(self.color[2] * intensity)
                )
                pygame.draw.line(screen, color,
                                 (self.start_x + offset_x, self.start_y + offset_y),
                                 (self.end_x + offset_x * 2, self.end_y + offset_y * 2),
                                 width)
        if self.life >= self.max_life - 1:
            pygame.draw.circle(screen, MODERN_WHITE, (self.start_x, self.start_y), 8)
        if self.life > self.max_life * 0.5:
            burst_size = int((self.max_life - self.life + 1) * 3)
            pygame.draw.circle(screen, self.color, (self.end_x, self.end_y), burst_size, 1)
            if self.life > self.max_life * 0.8:
                pygame.draw.circle(screen, MODERN_WHITE, (self.end_x, self.end_y), burst_size // 2)
    
    def is_finished(self) -> bool:
        return self.life <= 0


class TypingEffect:
    def __init__(self, x: int, y: int, char: str, correct: bool = True):
        self.x = x
        self.y = y
        self.char = char
        self.correct = correct
        self.life = 30
        self.max_life = 30
        self.particles = []
        if correct:
            for _ in range(8):
                angle = random.uniform(0, 2 * math.pi)
                speed = random.uniform(2, 5)
                self.particles.append({
                    'x': x,
                    'y': y,
                    'vx': math.cos(angle) * speed,
                    'vy': math.sin(angle) * speed - 2,
                    'life': random.randint(15, 25),
                    'size': random.randint(1, 3),
                    'color': random.choice([NEON_GREEN, ACCENT_CYAN, MODERN_WHITE])
                })
    
    def update(self):
        self.life -= 1
        for p in self.particles:
            p['x'] += p['vx']
            p['y'] += p['vy']
            p['life'] -= 1
            p['vx'] *= 0.95
            p['vy'] += 0.2
        self.particles = [p for p in self.particles if p['life'] > 0]
    
    def draw(self, screen, font):
        if pygame is None:
            return
        alpha_ratio = self.life / self.max_life
        if alpha_ratio <= 0:
            return
        color = NEON_GREEN if self.correct else (255, 69, 69)
        char_surf = font.render(self.char, True, color)
        char_surf.set_alpha(int(255 * alpha_ratio))
        char_y = self.y - (self.max_life - self.life) * 2
        screen.blit(char_surf, (self.x, char_y))
        for p in self.particles:
            p_alpha = p['life'] / 25
            p_color = tuple(int(c * p_alpha) for c in p['color'])
            pygame.draw.circle(screen, p_color, (int(p['x']), int(p['y'])), p['size'])
    
    def is_finished(self) -> bool:
        return self.life <= 0 and len(self.particles) == 0


class ModernExplosion:
    def __init__(self, x: int, y: int, size: str = "normal"):
        self.x = x
        self.y = y
        self.particles = []
        if size == "large":
            particle_count = 40
        elif size == "small":
            particle_count = 12
        else:
            particle_count = 25
        for _ in range(particle_count):
            angle = random.uniform(0, 2 * math.pi)
            if size == "large":
                speed = random.uniform(3, 15)
            elif size == "small":
                speed = random.uniform(2, 6)
            else:
                speed = random.uniform(3, 12)
            self.particles.append({
                'x': x,
                'y': y,
                'vx': math.cos(angle) * speed,
                'vy': math.sin(angle) * speed,
                'life': random.randint(50, 70),
                'max_life': 70,
                'size': random.randint(3, 8) if size == "large" else (random.randint(1, 3) if size == "small" else random.randint(2, 6)),
                'color_type': random.choice(['fire', 'spark', 'smoke'])
            })
    
    def update(self):
        for p in self.particles:
            p['x'] += p['vx']
            p['y'] += p['vy']
            p['life'] -= 1
            p['vx'] *= PARTICLE_DRAG
            p['vy'] *= PARTICLE_DRAG
            p['vy'] += PARTICLE_GRAVITY
        self.particles = [p for p in self.particles if p['life'] > 0]
    
    def draw(self, screen):
        if pygame is None:
            return
        for p in self.particles:
            life_ratio = p['life'] / p['max_life']
            size = max(1, int(p['size'] * life_ratio))
            if p['color_type'] == 'fire':
                if life_ratio > 0.7:
                    color = (255, 255, int(255 * life_ratio))
                elif life_ratio > 0.3:
                    color = (255, int(255 * life_ratio), 0)
                else:
                    color = (int(200 * life_ratio), 0, 0)
            elif p['color_type'] == 'spark':
                color = (255, 255, int(255 * life_ratio))
            else:
                gray = int(100 * life_ratio)
                color = (gray, gray, gray)
            pygame.draw.circle(screen, color, (int(p['x']), int(p['y'])), size)
    
    def is_finished(self) -> bool:
        return len(self.particles) == 0


class Missile:
    def __init__(self, start_x: int, start_y: int, target_enemy):
        self.x = float(start_x)
        self.y = float(start_y)
        self.target = target_enemy
        self.speed = 11.5
        self.direction = math.radians(-90)
        self.turn_rate = math.radians(8)
        self.trail = []
        self.max_trail = 14
        self.alive = True
        self.life = 240
        self.color = ACCENT_ORANGE
        self.core_color = MODERN_WHITE
        self.radius = 5
    
    def _angle_to(self, tx: float, ty: float) -> float:
        return math.atan2(ty - self.y, tx - self.x)
    
    def _wrap_angle(self, a: float) -> float:
        while a > math.pi:
            a -= 2 * math.pi
        while a < -math.pi:
            a += 2 * math.pi
        return a
    
    def _acquire_new_target(self, game):
        if not getattr(game, 'enemies', None):
            self.target = None
            return
        candidates = [e for e in game.enemies if not (hasattr(e, 'is_boss') and e.is_boss)]
        if not candidates:
            self.target = None
            return
        self.target = min(candidates, key=lambda e: (e.x - self.x) ** 2 + (e.y - self.y) ** 2)
    
    def update(self, game):
        if not self.alive:
            return
        self.life -= 1
        if self.life <= 0:
            self.alive = False
            return
        if self.target not in game.enemies:
            self._acquire_new_target(game)
            if not self.target:
                self.x += math.cos(self.direction) * self.speed
                self.y += math.sin(self.direction) * self.speed
                self._add_trail()
                return
        tx, ty = float(self.target.x), float(self.target.y)
        desired = self._angle_to(tx, ty)
        diff = self._wrap_angle(desired - self.direction)
        if diff > self.turn_rate:
            diff = self.turn_rate
        elif diff < -self.turn_rate:
            diff = -self.turn_rate
        self.direction += diff
        self.x += math.cos(self.direction) * self.speed
        self.y += math.sin(self.direction) * self.speed
        self._add_trail()
        dx = tx - self.x
        dy = ty - self.y
        if dx * dx + dy * dy < (self.radius + 16) ** 2:
            if self.target in game.enemies:
                if game.active_enemy is self.target:
                    game.active_enemy = None
                    game.current_input = ""
                    game.mistakes_this_word = 0
                game.destroy_enemy(self.target)
            game.explosions.append(ModernExplosion(int(self.x), int(self.y)))
            self.alive = False
    
    def _add_trail(self):
        self.trail.append([self.x, self.y, 14])
        if len(self.trail) > self.max_trail:
            self.trail.pop(0)
        for p in self.trail:
            p[2] -= 1
        self.trail = [p for p in self.trail if p[2] > 0]
    
    def draw(self, screen):
        if pygame is None or not self.alive:
            return
        for tx, ty, life in self.trail:
            alpha = life / 14
            col = (
                int(self.color[0] * alpha + self.core_color[0] * (1 - alpha) * 0.3),
                int(self.color[1] * alpha + self.core_color[1] * (1 - alpha) * 0.3),
                int(self.color[2] * alpha + self.core_color[2] * (1 - alpha) * 0.3),
            )
            pygame.draw.circle(screen, col, (int(tx), int(ty)), max(1, int(self.radius * alpha * 0.8)))
        pygame.draw.circle(screen, self.core_color, (int(self.x), int(self.y)), self.radius)
        flame_x = self.x - math.cos(self.direction) * (self.radius + 2)
        flame_y = self.y - math.sin(self.direction) * (self.radius + 2)
        pygame.draw.circle(screen, self.color, (int(flame_x), int(flame_y)), max(2, self.radius - 2))
    
    def is_finished(self) -> bool:
        return not self.alive

