"""Ship rendering utilities for P-Type."""

from __future__ import annotations

import math

try:
    import pygame
except Exception:  # pragma: no cover
    pygame = None  # type: ignore

from constants import ACCENT_YELLOW, MODERN_WHITE


def _shift(color, delta):
    """Lighten or darken an RGB color by delta."""

    return tuple(max(0, min(255, c + delta)) for c in color)


def _draw_soft_glow(surface, center, base_color, radius, layers=4, pulse=0.0):
    """Draw a radial glow composed of translucent circles."""

    if pygame is None:
        return

    for i in range(layers):
        fade = (layers - i) / layers
        glow_radius = int(radius * (0.6 + i * 0.25))
        alpha = int(160 * fade * (0.6 + 0.4 * pulse))
        color = (*base_color[:3], max(12, alpha))
        pygame.draw.circle(surface, color, center, glow_radius)


def draw_player_ship(screen, x, y, width, height, base_color, pulse=0.0):
    """Render the player's ship with layered wings and neon thrusters."""

    if pygame is None:
        return

    surf = pygame.Surface((int(width * 2.2), int(height * 2.4)), pygame.SRCALPHA)
    cx = surf.get_width() // 2
    nose_y = int(height * 0.1)
    tail_y = int(height * 1.9)

    hull = [
        (cx, nose_y),
        (int(cx - width * 0.32), int(height * 0.65)),
        (int(cx - width * 0.18), tail_y),
        (int(cx + width * 0.18), tail_y),
        (int(cx + width * 0.32), int(height * 0.65)),
    ]

    left_wing = [
        (int(cx - width * 0.28), int(height * 0.7)),
        (int(cx - width * 1.05), int(height * 1.0)),
        (int(cx - width * 0.35), int(height * 1.55)),
        (int(cx - width * 0.18), int(height * 1.35)),
    ]
    right_wing = [(cx + (cx - px), py) for px, py in left_wing]

    shadow = pygame.Surface(surf.get_size(), pygame.SRCALPHA)
    pygame.draw.polygon(shadow, (*_shift(base_color, -110), 90), [(px + 6, py + 12) for px, py in hull])
    surf.blit(shadow, (0, 0))

    pygame.draw.polygon(surf, _shift(base_color, -30), hull)
    pygame.draw.polygon(surf, _shift(base_color, 25), left_wing)
    pygame.draw.polygon(surf, _shift(base_color, 25), right_wing)

    highlight = [
        (cx, nose_y + 4),
        (int(cx - width * 0.18), int(height * 0.65)),
        (cx, int(height * 0.95)),
        (int(cx + width * 0.18), int(height * 0.65)),
    ]
    pygame.draw.polygon(surf, _shift(base_color, 70), highlight)

    cockpit_rect = pygame.Rect(0, 0, int(width * 0.38), int(height * 0.55))
    cockpit_rect.center = (cx, int(height * 0.75))
    pygame.draw.ellipse(surf, (60, 200, 255, 220), cockpit_rect)
    pygame.draw.ellipse(surf, (255, 255, 255, 90), cockpit_rect.inflate(-6, -10))

    pygame.draw.polygon(surf, _shift(base_color, 85), hull, 2)
    pygame.draw.polygon(surf, _shift(base_color, 55), left_wing, 2)
    pygame.draw.polygon(surf, _shift(base_color, 55), right_wing, 2)

    glow = pygame.Surface(surf.get_size(), pygame.SRCALPHA)
    thruster_center = (cx, int(height * 1.85))
    _draw_soft_glow(glow, thruster_center, _shift(base_color, 40), int(width * 0.35), pulse=pulse)
    surf.blit(glow, (0, 0))

    screen.blit(surf, (int(x - surf.get_width() // 2), int(y - height * 0.4)))


def draw_enemy_ship(screen, x, y, width, height, base_color, active=False, pulse=0.0):
    """Render enemy ships with angular silhouettes and pulsating cores."""

    if pygame is None:
        return

    surf = pygame.Surface((int(width * 2.0), int(height * 2.2)), pygame.SRCALPHA)
    cx = surf.get_width() // 2
    top = int(height * 0.08)
    bottom = int(height * 1.7)

    hull = [
        (cx, top),
        (int(cx - width * 0.45), int(height * 0.7)),
        (int(cx - width * 0.28), bottom),
        (int(cx + width * 0.28), bottom),
        (int(cx + width * 0.45), int(height * 0.7)),
    ]

    inner = [
        (cx, top + 6),
        (int(cx - width * 0.22), int(height * 0.72)),
        (cx, int(height * 1.4)),
        (int(cx + width * 0.22), int(height * 0.72)),
    ]

    pygame.draw.polygon(surf, _shift(base_color, -55), hull)
    pygame.draw.polygon(surf, _shift(base_color, 15), inner)
    pygame.draw.polygon(surf, _shift(base_color, 60), hull, 2)

    core_radius = int(width * 0.18)
    core_center = (cx, int(height * 1.05))
    core_surface = pygame.Surface(surf.get_size(), pygame.SRCALPHA)
    intensity = 0.5 + 0.5 * math.sin(pulse * 0.3)
    _draw_soft_glow(core_surface, core_center, _shift(base_color, 85), core_radius, pulse=intensity)
    pygame.draw.circle(core_surface, (*MODERN_WHITE[:3], 170), core_center, max(4, core_radius // 2))
    surf.blit(core_surface, (0, 0))

    if active:
        pygame.draw.polygon(surf, ACCENT_YELLOW, hull, 3)

    screen.blit(surf, (int(x - surf.get_width() // 2), int(y - height * 0.3)))


def draw_boss_ship(screen, x, y, width, height, base_color, pulse=0.0):
    """Render boss ships with multi-layer hulls and twin energy cores."""

    if pygame is None:
        return

    surf = pygame.Surface((int(width * 1.9), int(height * 2.4)), pygame.SRCALPHA)
    cx = surf.get_width() // 2
    top = int(height * 0.05)
    mid = int(height * 0.95)
    bottom = int(height * 1.9)

    primary = [
        (cx, top),
        (int(cx - width * 0.55), int(height * 0.6)),
        (int(cx - width * 0.35), bottom),
        (cx, int(height * 1.75)),
        (int(cx + width * 0.35), bottom),
        (int(cx + width * 0.55), int(height * 0.6)),
    ]

    secondary = [
        (cx, int(height * 0.2)),
        (int(cx - width * 0.32), mid),
        (cx, int(height * 1.55)),
        (int(cx + width * 0.32), mid),
    ]

    wing_span = int(width * 0.85)
    left_wing = [
        (int(cx - width * 0.4), int(height * 0.6)),
        (cx - wing_span, int(height * 1.0)),
        (int(cx - width * 0.25), int(height * 1.45)),
    ]
    right_wing = [(cx + (cx - px), py) for px, py in left_wing]

    pygame.draw.polygon(surf, _shift(base_color, -70), primary)
    pygame.draw.polygon(surf, _shift(base_color, 8), secondary)
    pygame.draw.polygon(surf, _shift(base_color, -25), left_wing)
    pygame.draw.polygon(surf, _shift(base_color, -25), right_wing)

    pygame.draw.polygon(surf, _shift(base_color, 65), primary, 3)
    pygame.draw.polygon(surf, _shift(base_color, 80), secondary, 2)

    glow_layer = pygame.Surface(surf.get_size(), pygame.SRCALPHA)
    core_left = (int(cx - width * 0.22), mid)
    core_right = (int(cx + width * 0.22), mid)
    core_color = _shift(base_color, 90)
    phase = pulse * 0.2
    _draw_soft_glow(glow_layer, core_left, core_color, int(width * 0.22), pulse=0.8 + 0.2 * math.sin(phase))
    _draw_soft_glow(glow_layer, core_right, core_color, int(width * 0.22), pulse=0.8 + 0.2 * math.sin(phase + math.pi))
    surf.blit(glow_layer, (0, 0))

    screen.blit(surf, (int(x - surf.get_width() // 2), int(y - height * 0.35)))


def draw_3d_ship(screen, x, y, width, height, color, is_player=False, active=False, pulse=0):
    """Backward compatible wrapper for legacy calls."""

    if is_player:
        draw_player_ship(screen, x, y, width, height, color, float(pulse))
    elif width >= 100:
        draw_boss_ship(screen, x, y, width, height, color, float(pulse))
    else:
        draw_enemy_ship(screen, x, y, width, height, color, active, float(pulse))


__all__ = [
    "draw_player_ship",
    "draw_enemy_ship",
    "draw_boss_ship",
    "draw_3d_ship",
]

