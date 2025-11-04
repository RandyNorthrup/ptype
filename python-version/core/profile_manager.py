"""
Profile management utilities for P-Type.
Handles loading, creating, and selecting player profiles.
"""
from typing import Optional, List, Dict, Any
from .profiles import PlayerProfile, PlayerStats, HighScoreEntry


class ProfileManager:
    """Manages player profiles, loading, creation, and selection"""

    def __init__(self, settings):
        self.settings = settings

    def load_profiles(self) -> list:
        """Load profiles from settings"""
        profiles = []
        for name, profile_data in self.settings.profiles.items():
            if isinstance(profile_data, PlayerProfile):
                profiles.append(profile_data)
            else:
                # Load from dict
                profile = PlayerProfile(name)
                if isinstance(profile_data, dict):
                    # Update profile attributes from saved data
                    for key, value in profile_data.items():
                        if hasattr(profile, key):
                            # Special handling for sets (languages_played)
                            if key == 'languages_played' and isinstance(value, list):
                                setattr(profile, key, set(value))
                            else:
                                setattr(profile, key, value)
                profiles.append(profile)
        return profiles

    def create_profile(self, name: str) -> Optional[PlayerProfile]:
        """Create a new profile"""
        if name and name not in self.settings.profiles:
            profile = PlayerProfile(name)
            self.settings.profiles[name] = profile
            self.settings.save_profiles()
            return profile
        return None

    def select_profile(self, profile: PlayerProfile) -> None:
        """Select a profile as the current profile"""
        self.settings.current_profile = profile
        self.settings.current_player_name = profile.name
        self.settings.save_settings()

    def get_profile_by_name(self, name: str) -> Optional[PlayerProfile]:
        """Get a profile by name"""
        for profile in self.load_profiles():
            if profile.name == name:
                return profile
        return None
