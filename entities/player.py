"""Player entity for P-Type."""
import math
try:
    import pygame
except Exception:  # pragma: no cover
    pygame = None  # type: ignore

from constants import SCREEN_WIDTH, SCREEN_HEIGHT, ACCENT_CYAN, NEON_BLUE
from graphics.ships import draw_player_ship


class ModernPlayerShip:
    """Enhanced player ship with 3D graphics and responsive positioning."""
    def __init__(self, window_height=SCREEN_HEIGHT):
        self.x = SCREEN_WIDTH // 2
        self.y = window_height - 120
        self.width = 56
        self.height = 48
        self.pulse = 0
        self.window_height = window_height
        self.window_width = SCREEN_WIDTH

    def update(self):
        self.pulse += 0.1

    def draw(self, screen):
        pulse_value = math.sin(self.pulse) * 0.5 + 0.5
        draw_player_ship(screen, self.x, self.y, self.width, self.height, ACCENT_CYAN, pulse_value)
        if pygame is None:
            return
        shield_alpha = int(50 + 30 * math.sin(self.pulse))
        shield_surface = pygame.Surface((self.width + 36, self.height + 36), pygame.SRCALPHA)
        for i in range(3):
            ring_alpha = shield_alpha // (i + 1)
            ring_color = (*NEON_BLUE[:3], ring_alpha)
            pygame.draw.ellipse(shield_surface, ring_color,
                                (i * 5, i * 5, self.width + 36 - i * 10, self.height + 36 - i * 10), 2)
        shield_rect = shield_surface.get_rect(center=(self.x, self.y + self.height//2))
        screen.blit(shield_surface, shield_rect)

    def update_position_for_window_dimensions(self, new_width, new_height):
        self.window_height = new_height
        self.window_width = SCREEN_WIDTH
        self.x = SCREEN_WIDTH // 2
        self.y = new_height - 120

    def get_collision_rect(self) -> 'pygame.Rect':
        return pygame.Rect(self.x - self.width//2, self.y, self.width, self.height)
