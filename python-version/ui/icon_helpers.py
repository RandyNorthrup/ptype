"""Shared icon utilities for the UI layer."""

from __future__ import annotations

import pygame

from pytablericons import TablerIcons


tabler_icons = TablerIcons()


def pil_to_pygame(pil_image):
    """Convert a PIL image to a pygame surface."""

    raw_str = pil_image.tobytes("raw", "RGBA")
    surface = pygame.image.fromstring(raw_str, pil_image.size, "RGBA")
    return surface


__all__ = ["pil_to_pygame", "tabler_icons"]

