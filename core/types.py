"""Core type definitions for P-Type.

Holds enums and dataclasses used across modules to reduce circular imports.
"""
from enum import Enum
from dataclasses import dataclass
from typing import List, Any


class GameMode(Enum):
    PROFILE_SELECT = "profile_select"
    MENU = "menu"
    NORMAL = "normal"
    PROGRAMMING = "programming"
    PAUSE = "pause"
    GAME_OVER = "game_over"
    STATS = "stats"
    SETTINGS = "settings"
    ABOUT = "about"
    TRIVIA = "trivia"


class ProgrammingLanguage(Enum):
    PYTHON = "Python"
    JAVA = "Java"
    JAVASCRIPT = "JavaScript"
    CSHARP = "C#"
    CPLUSPLUS = "C++"
    CSS = "CSS"
    HTML = "HTML"


class BonusItemType(Enum):
    OFFENSIVE = "offensive"  # Up arrow key
    DEFENSIVE = "defensive"  # Down arrow key


class TriviaCategory(Enum):
    POP_CULTURE = "pop_culture"
    SPORTS = "sports"
    HISTORY = "history"
    GEOGRAPHY = "geography"
    MATHEMATICS = "mathematics"
    ART = "art"
    NATURE = "nature"


@dataclass
class TriviaQuestion:
    question: str
    options: List[str]
    correct_answer: int
    difficulty: str
    category: str


@dataclass
class BonusItem:
    item_id: int  # Unique identifier (0-3)
    name: str
    description: str
    icon_enum: Any  # pytablericons icon enum (OutlineIcon or FilledIcon)
    duration: int  # Duration in frames (60 = 1 second)
    uses: int  # How many uses
    effect_value: float  # Strength of effect

