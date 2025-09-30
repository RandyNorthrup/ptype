"""
Initialization utilities for P-Type.
Handles loading assets and initial setup after window creation.
"""
import pygame
import os
import sys
from typing import Optional
from core.profiles import PlayerProfile


def load_background_music(game):
    """Load and start background music"""
    try:
        music_path = resource_path('assets/sounds/game_music.mp3')
        if os.path.exists(music_path):
            pygame.mixer.music.load(music_path)
            pygame.mixer.music.set_volume(game.settings.music_volume)
            pygame.mixer.music.play(-1)  # Loop forever
        else:
            print(f"Music file not found: {music_path}")
    except Exception:
        # Ignore music load errors silently
        pass


def load_logo_image(game) -> Optional[pygame.Surface]:
    """Load the P-TYPE logo PNG image"""
    logo_path = resource_path('assets/images/ptype_logo.png')
    game.logo_image = pygame.image.load(logo_path)
    # Scale the logo to appropriate size if needed
    logo_width = 400  # Adjust this to desired width
    logo_height = int(game.logo_image.get_height() * (logo_width / game.logo_image.get_width()))
    game.logo_image = pygame.transform.smoothscale(game.logo_image, (logo_width, logo_height))
    return game.logo_image


def setup_fonts(game):
    """Initialize font system with fallbacks"""
    # Font(None, size) always works, no need for try/except
    game.small_font = pygame.font.Font(None, 20)
    game.font = pygame.font.Font(None, 26)
    game.medium_font = pygame.font.Font(None, 36)
    game.large_font = pygame.font.Font(None, 48)
    game.title_font = pygame.font.Font(None, 84)


def setup_sound_system(game):
    """Initialize pygame mixer and create sound manager"""
    try:
        pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
    except pygame.error as e:
        print(f"Warning: Could not initialize sound system: {e}")

    from audio.sound_manager import SoundManager
    game.sound_manager = SoundManager(game.settings.sound_volume)


def setup_window_icon(game):
    """Set up window icon from assets"""
    try:
        icon_path = resource_path('assets/images/spaceship_icon_small.png')
        if os.path.exists(icon_path):
            icon = pygame.image.load(icon_path)
            pygame.display.set_icon(icon)
    except Exception as e:
        print(f"Could not set window icon: {e}")


def resource_path(relative_path):
    """Get the correct path for resources, handling PyInstaller and development environments"""
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        if hasattr(sys, '_MEIPASS'):
            base_path = sys._MEIPASS
        else:
            base_path = os.path.abspath(os.path.dirname(__file__))
    except (NameError, AttributeError):
        # Fallback for when sys is not available
        base_path = os.path.abspath(os.path.dirname(__file__))

    # Always use os.path.join for cross-platform compatibility
    full_path = os.path.join(base_path, *relative_path.replace('\\', '/').split('/'))
    return full_path


def initialize_profile_system(game):
    """Initialize profile system and load current profile"""
    # Initialize profile management
    from core.profile_manager import ProfileManager
    game.profile_manager = ProfileManager(game.settings)

    # Profile management
    game.profiles = game.profile_manager.load_profiles()
    game.current_profile_index = 0

    # Load the most recent player profile
    game.current_profile = None
    game.auto_selected_profile = False

    if game.settings.current_player_name:
        for profile in game.profiles:
            if profile.name == game.settings.current_player_name:
                game.current_profile = profile
                game.settings.current_profile = profile
                game.auto_selected_profile = True
                break

    # If there's a current profile (auto-selected), remember this for game flow
    game.has_auto_selected_profile = game.current_profile is not None
