"""Player profiles and statistics for P-Type."""
from __future__ import annotations

import datetime
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from .types import GameMode


@dataclass
class PlayerStats:
    """Statistics captured for a single play session."""

    words_typed: int = 0
    total_keystrokes: int = 0
    correct_keystrokes: int = 0
    wpm_peak: float = 0.0
    accuracy: float = 100.0
    play_time: float = 0.0
    bosses_defeated: int = 0
    perfect_words: int = 0


@dataclass
class HighScoreEntry:
    """Record describing a single high score entry."""

    player_name: str
    score: int
    level: int
    wpm: float
    accuracy: float
    timestamp: str
    mode: str
    language: Optional[str] = None


class PlayerProfile:
    """Persistent player profile data and achievement tracking."""

    def __init__(self, name: str = "") -> None:
        self.name: str = name
        self.created_at: str = datetime.datetime.now().isoformat() if name else ""
        self.total_play_time: float = 0.0
        self.games_played: int = 0
        self.total_score: int = 0
        self.total_words_typed: int = 0
        self.achievements: List[str] = []
        self.last_played: str = ""

        self.best_score: int = 0
        self.highest_level: int = 0
        self.best_wpm: float = 0.0
        self.bosses_defeated: int = 0

        self.trivia_questions_answered: int = 0
        self.trivia_questions_correct: int = 0
        self.trivia_streak_current: int = 0
        self.trivia_streak_best: int = 0
        self.bonus_items_collected: int = 0
        self.bonus_items_used: int = 0

        self.saved_games: Dict[str, Optional[Dict]] = {}
        self.stats_by_mode: Dict[str, Dict[str, Any]] = {
            'normal': {
                'best_wpm': 0.0,
                'best_score': 0,
                'highest_level': 0,
                'bosses_defeated': 0,
                'games_played': 0,
                'total_words': 0,
                'average_accuracy': 0.0,
            }
        }
        self.languages_played: set = set()
        self.saved_game: Optional[Dict] = None

    def get_mode_key(self, mode: str, language: Optional[str] = None) -> str:
        if mode == 'programming' and language:
            return f"programming_{language}"
        return "normal"

    def get_saved_game(self, mode: str, language: Optional[str] = None) -> Optional[Dict]:
        return self.saved_games.get(self.get_mode_key(mode, language))

    def set_saved_game(self, mode: str, game_state: Dict, language: Optional[str] = None) -> None:
        self.saved_games[self.get_mode_key(mode, language)] = game_state

    def get_mode_stats(self, mode: str, language: Optional[str] = None) -> Dict[str, Any]:
        key = self.get_mode_key(mode, language)
        if key not in self.stats_by_mode:
            self.stats_by_mode[key] = {
                'best_wpm': 0.0,
                'best_score': 0,
                'highest_level': 0,
                'bosses_defeated': 0,
                'games_played': 0,
                'total_words': 0,
                'average_accuracy': 0.0,
            }
        return self.stats_by_mode[key]

    def check_achievements(self, game_state: Dict) -> List[str]:
        newly_unlocked: List[str] = []

        if "first_word" not in self.achievements and self.total_words_typed > 0:
            self.achievements.append("first_word")
            newly_unlocked.append("first_word")

        if "speed_demon" not in self.achievements and self.best_wpm >= 100:
            self.achievements.append("speed_demon")
            newly_unlocked.append("speed_demon")

        if "boss_slayer" not in self.achievements and self.bosses_defeated > 0:
            self.achievements.append("boss_slayer")
            newly_unlocked.append("boss_slayer")

        if "level_10" not in self.achievements and self.highest_level >= 10:
            self.achievements.append("level_10")
            newly_unlocked.append("level_10")

        if "level_20" not in self.achievements and self.highest_level >= 20:
            self.achievements.append("level_20")
            newly_unlocked.append("level_20")

        if "high_scorer" not in self.achievements and self.best_score >= 10000:
            self.achievements.append("high_scorer")
            newly_unlocked.append("high_scorer")

        if "veteran" not in self.achievements and self.games_played >= 50:
            self.achievements.append("veteran")
            newly_unlocked.append("veteran")

        if "word_master" not in self.achievements and self.total_words_typed >= 1000:
            self.achievements.append("word_master")
            newly_unlocked.append("word_master")

        if "polyglot" not in self.achievements and len(self.languages_played) >= 7:
            self.achievements.append("polyglot")
            newly_unlocked.append("polyglot")

        if "trivia_novice" not in self.achievements and self.trivia_questions_correct >= 1:
            self.achievements.append("trivia_novice")
            newly_unlocked.append("trivia_novice")

        if "trivia_expert" not in self.achievements and self.trivia_questions_correct >= 10:
            self.achievements.append("trivia_expert")
            newly_unlocked.append("trivia_expert")

        if "trivia_master" not in self.achievements and self.trivia_questions_correct >= 25:
            self.achievements.append("trivia_master")
            newly_unlocked.append("trivia_master")

        if "trivia_genius" not in self.achievements and self.trivia_questions_correct >= 50:
            self.achievements.append("trivia_genius")
            newly_unlocked.append("trivia_genius")

        if "perfect_trivia" not in self.achievements and self.trivia_streak_best >= 5:
            self.achievements.append("perfect_trivia")
            newly_unlocked.append("perfect_trivia")

        if "bonus_collector" not in self.achievements and self.bonus_items_collected >= 10:
            self.achievements.append("bonus_collector")
            newly_unlocked.append("bonus_collector")

        if "bonus_master" not in self.achievements and self.bonus_items_used >= 25:
            self.achievements.append("bonus_master")
            newly_unlocked.append("bonus_master")

        if game_state:
            if "accuracy_master" not in self.achievements:
                accuracy = game_state.get('accuracy', 0)
                if accuracy >= 95 and game_state.get('game_over', False):
                    self.achievements.append("accuracy_master")
                    newly_unlocked.append("accuracy_master")

            if "perfect_game" not in self.achievements:
                perfect_words = game_state.get('perfect_words', 0)
                if perfect_words >= 10:
                    self.achievements.append("perfect_game")
                    newly_unlocked.append("perfect_game")

            if "marathon" not in self.achievements:
                play_time = game_state.get('session_time', 0)
                if play_time >= 1800:
                    self.achievements.append("marathon")
                    newly_unlocked.append("marathon")

        return newly_unlocked


__all__ = ["PlayerStats", "HighScoreEntry", "PlayerProfile"]

