"""Core constants and color palette for P-Type.

This module centralizes configuration constants, colors, and version info so
other modules can import them without circular dependencies.
"""

# Version Information
VERSION = "1.5.3"
VERSION_NAME = "WIP Edition"
RELEASE_DATE = "2025-09-29"

# Modern Constants
SCREEN_WIDTH = 600  # Fixed width for typing game - never changes
SCREEN_HEIGHT = 800  # Default height
MIN_WINDOW_WIDTH = 600  # Same as SCREEN_WIDTH since width is fixed
MIN_WINDOW_HEIGHT = 800  # Minimum height for all UI elements to fit properly
FPS = 60
MAX_LEVELS = 100  # Scaled up from 20 to 100 levels
MAX_WPM = 400  # Increased max WPM for 100 levels
BASE_WPM = 20
MAX_MISSED_SHIPS = 3

# Modern Color Palette
DARK_BG = (8, 12, 20)
DARKER_BG = (4, 6, 12)
ACCENT_BLUE = (45, 156, 255)
ACCENT_CYAN = (0, 255, 255)
ACCENT_PURPLE = (138, 43, 226)
ACCENT_GREEN = (50, 255, 150)
ACCENT_ORANGE = (255, 165, 0)
ACCENT_RED = (255, 69, 69)
ACCENT_YELLOW = (255, 235, 59)

MODERN_WHITE = (240, 248, 255)
MODERN_GRAY = (160, 172, 190)
MODERN_DARK_GRAY = (64, 71, 86)
MODERN_LIGHT = (200, 210, 225)

# Gradients and effects
NEON_BLUE = (0, 191, 255)
NEON_PINK = (255, 20, 147)
NEON_GREEN = (57, 255, 20)

# Performance constants
TWINKLE_MULTIPLIER = 0.1
PARTICLE_DRAG = 0.98
PARTICLE_GRAVITY = 0.1

