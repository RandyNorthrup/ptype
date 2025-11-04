"""Runtime environment helpers for P-Type."""

from __future__ import annotations

import os
import sys


def configure_environment() -> None:
    """Configure import paths and SDL drivers before initializing pygame."""

    # Ensure the package root is importable when running as a script.
    package_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    if package_root not in sys.path:
        sys.path.insert(0, package_root)

    # Configure SDL for the current platform so pygame picks the right drivers.
    if sys.platform == "darwin":  # macOS
        os.environ.setdefault("SDL_VIDEODRIVER", "cocoa")
        os.environ.setdefault("SDL_AUDIODRIVER", "coreaudio")
    elif sys.platform.startswith("linux"):
        if not os.environ.get("DISPLAY"):
            # Headless Linux environments should fall back to dummy drivers.
            os.environ.setdefault("SDL_VIDEODRIVER", "dummy")
            os.environ.setdefault("SDL_AUDIODRIVER", "dummy")
        else:
            os.environ.setdefault("SDL_VIDEODRIVER", "x11")
            os.environ.setdefault("SDL_AUDIODRIVER", "pulseaudio")
    elif sys.platform.startswith("win"):
        os.environ.setdefault("SDL_VIDEO_WINDOW_POS", "centered")
        os.environ.setdefault("SDL_VIDEO_CENTERED", "1")
        os.environ.setdefault("SDL_VIDEODRIVER", "windows")
        os.environ.setdefault("SDL_VIDEO_ALLOW_SCREENSAVER", "1")
        os.environ.setdefault("SDL_AUDIODRIVER", "directsound")


__all__ = ["configure_environment"]

