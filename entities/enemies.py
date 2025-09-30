"""Enemy entities for P-Type: ModernEnemy and BossEnemy."""
import math
import random
try:
    import pygame
except Exception:  # pragma: no cover
    pygame = None  # type: ignore

from constants import (
    SCREEN_WIDTH, SCREEN_HEIGHT, BASE_WPM, MAX_LEVELS, MAX_WPM,
    NEON_BLUE, NEON_PINK, ACCENT_BLUE, ACCENT_ORANGE, ACCENT_RED, ACCENT_YELLOW, ACCENT_PURPLE,
    MODERN_WHITE, MODERN_GRAY, MODERN_DARK_GRAY
)
from graphics.ships import draw_enemy_ship, draw_boss_ship


class ModernEnemy:
    """Modern enemy with enhanced 3D graphics and animations - moves toward player."""

    def __init__(self, word: str, level: int, player_x: int = SCREEN_WIDTH // 2):
        self.original_word = word
        self.word = word
        self.typed_chars = ""
        self.x = random.randint(60, SCREEN_WIDTH - 60)
        self.y = -60
        self.target_x = player_x
        self.target_y = SCREEN_HEIGHT - 120

        target_wpm = BASE_WPM + ((MAX_WPM - BASE_WPM) * (level - 1) / max(1, MAX_LEVELS - 1))
        chars_per_second = (target_wpm * 4) / 60
        baseline = chars_per_second * max(3, len(word)) / 18
        speed_scale = 0.45 + min(level, 30) * 0.015
        self.speed = max(0.35, min(4.0, baseline * speed_scale))

        self.width = 48
        self.height = 36
        self.active = False
        self.level = level
        self.hover_offset = 0
        self.pulse = 0
        self.calculate_direction()

    def calculate_direction(self):
        dx = self.target_x - self.x
        dy = self.target_y - self.y
        distance = math.hypot(dx, dy) or 1
        self.vx = (dx / distance) * self.speed
        self.vy = (dy / distance) * self.speed

    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.hover_offset += 0.1
        self.pulse += 0.18

    def draw(self, screen, font):
        if pygame is None:
            return

        hover_y = self.y + math.sin(self.hover_offset) * 2
        base_color = ACCENT_ORANGE if self.level > 7 else MODERN_GRAY
        if self.active:
            base_color = NEON_PINK if self.level > 10 else ACCENT_YELLOW

        draw_enemy_ship(screen, int(self.x), int(hover_y), self.width, self.height, base_color, self.active, self.pulse)

        remaining_word = self.original_word[len(self.typed_chars):]
        typed_color = (57, 255, 20)
        remaining_color = MODERN_WHITE if self.active else MODERN_GRAY
        full_word_surface = font.render(self.original_word, True, MODERN_WHITE)
        word_width = full_word_surface.get_width()
        word_height = full_word_surface.get_height()
        word_bg = pygame.Surface((word_width + 8, word_height + 4))
        word_bg.set_alpha(180)
        word_bg.fill((4, 6, 12))
        bg_rect = word_bg.get_rect(center=(self.x, hover_y + self.height + 20))
        screen.blit(word_bg, bg_rect)
        if self.typed_chars:
            typed_surface = font.render(self.typed_chars, True, typed_color)
            typed_rect = typed_surface.get_rect()
            typed_rect.centerx = self.x - word_width // 2 + typed_surface.get_width() // 2
            typed_rect.centery = hover_y + self.height + 20
            screen.blit(typed_surface, typed_rect)
        if remaining_word:
            remaining_surface = font.render(remaining_word, True, remaining_color)
            remaining_rect = remaining_surface.get_rect()
            typed_width = font.render(self.typed_chars, True, typed_color).get_width() if self.typed_chars else 0
            remaining_rect.centerx = self.x - word_width // 2 + typed_width + remaining_surface.get_width() // 2
            remaining_rect.centery = hover_y + self.height + 20
            screen.blit(remaining_surface, remaining_rect)
        if self.active:
            pulse_size = 2 + math.sin(self.pulse) * 1.5
            pygame.draw.circle(screen, NEON_BLUE, (int(self.x), int(hover_y)), int(self.width // 2 + 8 + pulse_size), 2)

    def is_off_screen(self, current_height=SCREEN_HEIGHT) -> bool:
        return self.y > current_height + 50

    def is_word_complete(self) -> bool:
        return len(self.typed_chars) == len(self.word)

    def type_char(self, char: str) -> bool:
        if len(self.typed_chars) < len(self.word) and self.word[len(self.typed_chars)] == char:
            self.typed_chars += char
            return True
        return False

    def get_collision_rect(self) -> 'pygame.Rect':
        return pygame.Rect(self.x - self.width // 2, self.y, self.width, self.height)


class BossEnemy(ModernEnemy):
    """Boss enemy - larger, more challenging ship that appears at level completion."""

    def __init__(self, word: str, level: int, player_x: int = SCREEN_WIDTH // 2, game_mode=None, player_ship=None):
        self.game_mode = game_mode
        self.boss_level = level
        super().__init__(word, level, player_x)
        self.player_ship = player_ship
        self.width = 96
        self.height = 75
        self.is_boss = True
        self.horizontal_speed = 1.1
        self.aggressive_tracking = True

        mode_val = getattr(game_mode, 'value', game_mode)
        is_prog = (mode_val == 'programming')
        length_factor = 0.8 if len(word) > 40 else 1.0
        if is_prog:
            base_scale = 0.22
        else:
            base_scale = 0.28
        level_factor = 0.85 + min(level, 120) / 240
        self.speed = max(0.12, min(1.1, self.speed * base_scale * length_factor * level_factor))
        self.calculate_direction()
        self.boss_glow = 0
        self.shield_pulse = 0

    def draw(self, screen, font):
        if pygame is None:
            return
        hover_y = self.y + math.sin(self.hover_offset) * 2
        base_color = ACCENT_ORANGE
        draw_boss_ship(screen, int(self.x), int(hover_y), self.width, self.height, base_color, self.pulse)
        remaining_word = self.original_word[len(self.typed_chars):]
        typed_color = (57, 255, 20)
        remaining_color = ACCENT_YELLOW if self.active else MODERN_WHITE
        full_word_surface = font.render(self.original_word, True, MODERN_WHITE)
        word_width = full_word_surface.get_width()
        word_height = full_word_surface.get_height()
        word_bg = pygame.Surface((word_width + 20, word_height + 8))
        word_bg.set_alpha(200)
        word_bg.fill((4, 6, 12))
        pygame.draw.rect(word_bg, ACCENT_ORANGE, word_bg.get_rect(), 2)
        bg_rect = word_bg.get_rect(center=(self.x, hover_y + self.height + 32))
        screen.blit(word_bg, bg_rect)
        if self.typed_chars:
            typed_surface = font.render(self.typed_chars, True, typed_color)
            typed_rect = typed_surface.get_rect()
            typed_rect.centerx = self.x - word_width // 2 + typed_surface.get_width() // 2
            typed_rect.centery = hover_y + self.height + 32
            screen.blit(typed_surface, typed_rect)
        if remaining_word:
            remaining_surface = font.render(remaining_word, True, remaining_color)
            remaining_rect = remaining_surface.get_rect()
            typed_width = font.render(self.typed_chars, True, typed_color).get_width() if self.typed_chars else 0
            remaining_rect.centerx = self.x - word_width // 2 + typed_width + remaining_surface.get_width() // 2
            remaining_rect.centery = hover_y + self.height + 32
            screen.blit(remaining_surface, remaining_rect)
