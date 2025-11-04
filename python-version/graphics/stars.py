"""Background starfield entities for P-Type."""
from __future__ import annotations

import math
import random
try:
    import pygame
except Exception:  # pragma: no cover
    pygame = None  # type: ignore

from constants import SCREEN_HEIGHT, SCREEN_WIDTH, TWINKLE_MULTIPLIER


class ModernStar:
    """Star used in the animated background."""

    def __init__(self) -> None:
        self.x = random.randint(0, SCREEN_WIDTH)
        self.y = random.randint(0, SCREEN_HEIGHT)
        self.speed = random.uniform(0.3, 2.0)
        self.brightness = random.randint(100, 255)
        self.size = random.choice([1, 1, 1, 2, 2, 3])
        self.twinkle = random.randint(0, 60)

    def update(self) -> None:
        self.y += self.speed
        if self.y > SCREEN_HEIGHT:
            self.y = -10
            self.x = random.randint(0, SCREEN_WIDTH)
        self.twinkle = (self.twinkle + 1) % 120

    def draw(self, screen) -> None:
        if pygame is None:
            return
        twinkle_factor = 0.7 + 0.3 * math.sin(self.twinkle * TWINKLE_MULTIPLIER)
        current_brightness = min(255, int(self.brightness * twinkle_factor))
        color = (current_brightness, current_brightness, min(255, current_brightness + 20))

        if self.size == 1:
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), 1)
        elif self.size == 2:
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), 2)
            glow_color = tuple(component // 3 for component in color)
            pygame.draw.circle(screen, glow_color, (int(self.x), int(self.y)), 3)
        else:
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), 2)
            pygame.draw.line(screen, color, (self.x - 4, self.y), (self.x + 4, self.y), 1)
            pygame.draw.line(screen, color, (self.x, self.y - 4), (self.x, self.y + 4), 1)


__all__ = ["ModernStar"]
