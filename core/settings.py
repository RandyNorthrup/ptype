"""Settings and persistence layer for P-Type."""
from __future__ import annotations

import datetime
import json
import os
from pathlib import Path
from typing import Dict, List, Optional

from .profiles import HighScoreEntry, PlayerProfile
from .types import GameMode


class GameSettings:
    """Manage persistent settings, profiles, and high scores."""

    def __init__(self) -> None:
        self.save_dir = Path.home() / ".ptype"
        self.save_dir.mkdir(exist_ok=True)

        self.settings_file = self.save_dir / "settings.json"
        self.high_scores_file = self.save_dir / "scores.json"
        self.profiles_file = self.save_dir / "profiles.json"
        self.saves_file = self.save_dir / "saves.json"

        self.current_profile: Optional[PlayerProfile] = None
        self.profiles: Dict[str, PlayerProfile] = {}
        self.current_player_name = ""
        self.save_slots: List[Optional[Dict]] = [None, None, None]
        self.music_volume = 0.7
        self.sound_volume = 0.8
        self.high_scores: Dict[str, List[HighScoreEntry]] = {}
        self.personal_bests: Dict[str, Dict[str, Dict[str, float]]] = {}
        self.load_all_data()

    def load_all_data(self) -> None:
        self.load_settings()
        self.load_profiles()
        self.load_scores()

    def save_settings(self) -> None:
        data = {
            "music_volume": self.music_volume,
            "sound_volume": self.sound_volume,
            "current_player": self.current_profile.name if self.current_profile else "",
            "current_player_name": self.current_player_name,
        }
        try:
            with self.settings_file.open('w') as handle:
                json.dump(data, handle, indent=2)
        except (IOError, OSError) as exc:
            print(f"Could not save settings: {exc}")

    def save_profiles(self) -> None:
        payload: Dict[str, Dict] = {}
        for name, profile in self.profiles.items():
            if isinstance(profile, PlayerProfile):
                serialised = {}
                for key, value in profile.__dict__.items():
                    if isinstance(value, set):
                        serialised[key] = list(value)
                    else:
                        serialised[key] = value
                payload[name] = serialised
            else:
                payload[name] = profile  # already dict-like

        data = {
            "profiles": payload,
            "current_player": self.current_profile.name if self.current_profile else "",
        }
        try:
            with self.profiles_file.open('w') as handle:
                json.dump(data, handle, indent=2)
        except (IOError, OSError) as exc:
            print(f"Could not save profiles: {exc}")

    def save_game(self, game_state: Dict) -> bool:
        if not self.current_profile:
            return False

        game_state['save_time'] = datetime.datetime.now().isoformat()
        game_state['player_name'] = self.current_profile.name

        mode = game_state.get('game_mode', 'normal')
        language = game_state.get('programming_language') if mode == 'programming' else None

        self.current_profile.set_saved_game(mode, game_state, language)
        self.current_profile.last_played = datetime.datetime.now().isoformat()
        self.save_profiles()
        return True

    def load_game_for_current_profile(self) -> Optional[Dict]:
        if self.current_profile and self.current_profile.saved_game:
            return self.current_profile.saved_game
        return None

    def load_settings(self) -> None:
        try:
            if self.settings_file.exists():
                with self.settings_file.open('r') as handle:
                    data = json.load(handle)
                    self.music_volume = max(0.0, min(1.0, data.get("music_volume", 0.7)))
                    self.sound_volume = max(0.0, min(1.0, data.get("sound_volume", 0.8)))
                    self.current_player_name = data.get("current_player_name", data.get("current_player", ""))
        except (IOError, OSError, json.JSONDecodeError) as exc:
            print(f"Could not load settings: {exc}")

    def load_profiles(self) -> None:
        try:
            if self.profiles_file.exists():
                with self.profiles_file.open('r') as handle:
                    data = json.load(handle)
                    profiles_dict = data.get("profiles", data)
                    self.current_player_name = data.get("current_player", "")

                    for name, profile_data in profiles_dict.items():
                        profile = PlayerProfile(name)
                        for key, value in profile_data.items():
                            if key == 'languages_played' and isinstance(value, list):
                                setattr(profile, key, set(value))
                            else:
                                setattr(profile, key, value)
                        self.profiles[name] = profile
        except (IOError, OSError, json.JSONDecodeError) as exc:
            print(f"Could not load profiles: {exc}")

    def save_scores(self) -> None:
        serialisable = {
            key: [
                {
                    'player_name': entry.player_name,
                    'score': entry.score,
                    'level': entry.level,
                    'wpm': entry.wpm,
                    'accuracy': entry.accuracy,
                    'timestamp': entry.timestamp,
                    'mode': entry.mode,
                    'language': entry.language,
                }
                for entry in entries
            ]
            for key, entries in self.high_scores.items()
        }

        data = {
            "high_scores": serialisable,
            "personal_bests": self.personal_bests,
        }
        try:
            with self.high_scores_file.open('w') as handle:
                json.dump(data, handle, indent=2)
        except (IOError, OSError) as exc:
            print(f"Could not save scores: {exc}")

    def load_scores(self) -> None:
        try:
            if self.high_scores_file.exists():
                with self.high_scores_file.open('r') as handle:
                    data = json.load(handle)
                    loaded_scores = data.get("high_scores", {})
                    self.high_scores = {}

                    for key, value in loaded_scores.items():
                        if isinstance(value, list):
                            entries = []
                            for entry_data in value:
                                if isinstance(entry_data, dict):
                                    entries.append(
                                        HighScoreEntry(
                                            player_name=entry_data.get('player_name', 'Anonymous'),
                                            score=entry_data.get('score', 0),
                                            level=entry_data.get('level', 1),
                                            wpm=entry_data.get('wpm', 0.0),
                                            accuracy=entry_data.get('accuracy', 0.0),
                                            timestamp=entry_data.get('timestamp', ''),
                                            mode=entry_data.get('mode', 'normal'),
                                            language=entry_data.get('language'),
                                        )
                                    )
                            self.high_scores[key] = entries
                        else:
                            self.high_scores[key] = []

                    self.personal_bests = data.get("personal_bests", {})
        except (IOError, OSError, json.JSONDecodeError) as exc:
            print(f"Could not load scores: {exc}")

    def add_high_score(
        self,
        mode: GameMode,
        score: int,
        level: int,
        wpm: float,
        accuracy: float,
        language: Optional[str] = None,
    ) -> int:
        entry = HighScoreEntry(
            player_name=self.current_profile.name if self.current_profile else "Anonymous",
            score=score,
            level=level,
            wpm=wpm,
            accuracy=accuracy,
            timestamp=datetime.datetime.now().isoformat(),
            mode=mode.value,
            language=language,
        )

        key = f"{mode.value}_{language}" if language else mode.value
        self.high_scores.setdefault(key, []).append(entry)
        self.high_scores[key].sort(key=lambda item: item.score, reverse=True)
        self.high_scores[key] = self.high_scores[key][:10]

        position = 0
        for index, item in enumerate(self.high_scores[key]):
            if item == entry:
                position = index + 1
                break

        self.update_personal_best(mode, score, level, wpm, accuracy, language)
        self.save_scores()
        return position

    def update_personal_best(
        self,
        mode: GameMode,
        score: int,
        level: int,
        wpm: float,
        accuracy: float,
        language: Optional[str] = None,
    ) -> bool:
        if not self.current_profile:
            return False

        player_key = self.current_profile.name
        mode_key = f"{mode.value}_{language}" if language else mode.value
        self.personal_bests.setdefault(player_key, {})
        self.personal_bests[player_key].setdefault(mode_key, {
            "score": 0,
            "level": 0,
            "wpm": 0.0,
            "accuracy": 0.0,
        })

        current = self.personal_bests[player_key][mode_key]
        if score > current["score"]:
            self.personal_bests[player_key][mode_key] = {
                "score": score,
                "level": level,
                "wpm": wpm,
                "accuracy": accuracy,
            }
            return True
        return False

    def get_high_scores(self, mode: GameMode, language: Optional[str] = None, limit: int = 10) -> List[HighScoreEntry]:
        key = f"{mode.value}_{language}" if language else mode.value
        return self.high_scores.get(key, [])[:limit]


__all__ = ["GameSettings"]

