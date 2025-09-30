"""Achievement definitions shared across the game."""

from __future__ import annotations

from typing import Dict


class Achievement:
    """Achievement definition used for UI display and progress tracking."""

    def __init__(self, identifier: str, name: str, description: str, icon: str = "🏆"):
        self.id = identifier
        self.name = name
        self.description = description
        self.icon = icon
        self.unlocked = False
        self.unlock_date = None


ACHIEVEMENTS: Dict[str, Achievement] = {
    "first_word": Achievement("first_word", "First Steps", "Type your first word", "BABY"),
    "speed_demon": Achievement("speed_demon", "Speed Demon", "Reach 100 WPM", "SPEED"),
    "accuracy_master": Achievement("accuracy_master", "Accuracy Master", "Complete a game with 95% accuracy", "TARGET"),
    "boss_slayer": Achievement("boss_slayer", "Boss Slayer", "Defeat your first boss", "BOSS"),
    "level_10": Achievement("level_10", "Halfway There", "Reach level 10", "L10"),
    "level_20": Achievement("level_20", "Master Typist", "Reach level 20", "L20"),
    "perfect_game": Achievement("perfect_game", "Perfection", "Complete 10 words in a row without mistakes", "100%"),
    "marathon": Achievement("marathon", "Marathon Runner", "Play for 30 minutes straight", "30M"),
    "polyglot": Achievement("polyglot", "Polyglot", "Play in all programming languages", "CODE"),
    "high_scorer": Achievement("high_scorer", "High Scorer", "Score over 10,000 points", "10K"),
    "veteran": Achievement("veteran", "Veteran", "Play 50 games", "50G"),
    "word_master": Achievement("word_master", "Word Master", "Type 1000 words total", "1000W"),
    "trivia_novice": Achievement("trivia_novice", "Trivia Novice", "Answer your first trivia question correctly", "Q1"),
    "trivia_expert": Achievement("trivia_expert", "Trivia Expert", "Answer 10 trivia questions correctly", "Q10"),
    "trivia_master": Achievement("trivia_master", "Trivia Master", "Answer 25 trivia questions correctly", "Q25"),
    "trivia_genius": Achievement("trivia_genius", "Trivia Genius", "Answer 50 trivia questions correctly", "Q50"),
    "perfect_trivia": Achievement("perfect_trivia", "Perfect Mind", "Answer 5 trivia questions in a row correctly", "5✓"),
    "bonus_collector": Achievement("bonus_collector", "Bonus Collector", "Collect 10 bonus items from trivia", "B10"),
    "bonus_master": Achievement("bonus_master", "Bonus Master", "Use 25 bonus items in combat", "B25"),
}


__all__ = ["Achievement", "ACHIEVEMENTS"]

