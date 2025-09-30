"""Trivia database for P-Type.

Contains trivia questions and bonus item definitions, plus helper methods
to select questions and items.
"""
import random
from typing import Optional
from pytablericons.tabler_icons import OutlineIcon

from core.types import (
    GameMode,
    ProgrammingLanguage,
    TriviaCategory,
    TriviaQuestion,
    BonusItem,
)


class TriviaDatabase:
    """Comprehensive trivia question database"""

    TRIVIA_QUESTIONS = {
        TriviaCategory.POP_CULTURE.value: {
            'beginner': [
                TriviaQuestion("Which movie features the line 'May the Force be with you'?",
                               ["Star Trek", "Star Wars", "Avatar"], 1, "beginner", "pop_culture"),
                TriviaQuestion("What social media platform has a bird as its logo?",
                               ["Facebook", "Twitter", "TikTok"], 1, "beginner", "pop_culture"),
                TriviaQuestion("Who played Iron Man in the Marvel movies?",
                               ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth"], 1, "beginner", "pop_culture"),
                TriviaQuestion("What streaming service is known for 'Stranger Things'?",
                               ["Hulu", "Netflix", "Disney+"], 1, "beginner", "pop_culture"),
                TriviaQuestion("Which superhero is known as 'The Dark Knight'?",
                               ["Superman", "Batman", "Spider-Man"], 1, "beginner", "pop_culture"),
                TriviaQuestion("What is the name of Harry Potter's owl?",
                               ["Hedwig", "Errol", "Pigwidgeon"], 0, "beginner", "pop_culture"),
                TriviaQuestion("Which video game features a plumber named Mario?",
                               ["Sonic", "Super Mario", "Zelda"], 1, "beginner", "pop_culture"),
                TriviaQuestion("What company makes the iPhone?",
                               ["Samsung", "Apple", "Google"], 1, "beginner", "pop_culture"),
                TriviaQuestion("What is the name of the main character in The Legend of Zelda?",
                               ["Zelda", "Link", "Ganon"], 1, "beginner", "pop_culture"),
                TriviaQuestion("Which console is made by Sony?",
                               ["Xbox", "PlayStation", "Switch"], 1, "beginner", "pop_culture"),
                TriviaQuestion("What does 'www' stand for?",
                               ["World Wide Web", "Web World Wide", "Wide Web World"], 0, "beginner", "pop_culture"),
                TriviaQuestion("Which company created Minecraft?",
                               ["Epic Games", "Mojang", "Valve"], 1, "beginner", "pop_culture"),
                TriviaQuestion("What is the most subscribed YouTube channel?",
                               ["PewDiePie", "MrBeast", "T-Series"], 2, "beginner", "pop_culture"),
                TriviaQuestion("Which social media uses 'tweets'?",
                               ["Instagram", "Twitter", "Facebook"], 1, "beginner", "pop_culture"),
                TriviaQuestion("What year did the first iPhone release?",
                               ["2005", "2007", "2009"], 1, "beginner", "pop_culture"),
            ],
            'intermediate': [
                TriviaQuestion("Which band released the album 'Bohemian Rhapsody'?",
                               ["The Beatles", "Queen", "The Rolling Stones"], 1, "intermediate", "pop_culture"),
                TriviaQuestion("What is the highest-grossing film of all time?",
                               ["Titanic", "Avatar", "Avengers: Endgame"], 1, "intermediate", "pop_culture"),
                TriviaQuestion("Who directed the movie 'Inception'?",
                               ["Steven Spielberg", "Christopher Nolan", "Quentin Tarantino"], 1, "intermediate", "pop_culture"),
                TriviaQuestion("What is the best-selling video game of all time?",
                               ["Minecraft", "Tetris", "GTA V"], 1, "intermediate", "pop_culture"),
                TriviaQuestion("Which actor played the Joker in The Dark Knight?",
                               ["Joaquin Phoenix", "Heath Ledger", "Jack Nicholson"], 1, "intermediate", "pop_culture"),
                TriviaQuestion("What year was Netflix founded?",
                               ["1997", "2001", "2005"], 0, "intermediate", "pop_culture"),
                TriviaQuestion("Who created the TV series Breaking Bad?",
                               ["David Chase", "Vince Gilligan", "David Benioff"], 1, "intermediate", "pop_culture"),
                TriviaQuestion("What is the highest-grossing movie franchise?",
                               ["Star Wars", "Marvel Cinematic Universe", "Harry Potter"], 1, "intermediate", "pop_culture"),
            ],
            'advanced': [
                TriviaQuestion("Which film won the first Academy Award for Best Picture?",
                               ["Wings", "Sunrise", "The Jazz Singer"], 0, "advanced", "pop_culture"),
                TriviaQuestion("What year did MTV launch?",
                               ["1980", "1981", "1982"], 1, "advanced", "pop_culture"),
            ]
        },

        TriviaCategory.SPORTS.value: {
            'beginner': [
                TriviaQuestion("How many players are on a basketball team?",
                               ["4", "5", "6"], 1, "beginner", "sports"),
                TriviaQuestion("What sport is played at Wimbledon?",
                               ["Golf", "Tennis", "Cricket"], 1, "beginner", "sports"),
                TriviaQuestion("How often are the Olympics held?",
                               ["Every 2 years", "Every 4 years", "Every 5 years"], 1, "beginner", "sports"),
                TriviaQuestion("How many players are on a soccer team?",
                               ["9", "11", "13"], 1, "beginner", "sports"),
                TriviaQuestion("What sport is known as 'America's pastime'?",
                               ["Football", "Basketball", "Baseball"], 2, "beginner", "sports"),
                TriviaQuestion("How many periods are in a hockey game?",
                               ["2", "3", "4"], 1, "beginner", "sports"),
                TriviaQuestion("What is the maximum score in gymnastics?",
                               ["10", "100", "No limit"], 0, "beginner", "sports"),
                TriviaQuestion("Which sport uses a shuttlecock?",
                               ["Tennis", "Badminton", "Squash"], 1, "beginner", "sports"),
            ],
        },

        TriviaCategory.HISTORY.value: {
            'beginner': [
                TriviaQuestion("In which year did World War II end?",
                               ["1944", "1945", "1946"], 1, "beginner", "history"),
                TriviaQuestion("Who was the first President of the United States?",
                               ["Thomas Jefferson", "George Washington", "John Adams"], 1, "beginner", "history"),
            ],
        },

        # Programming language trivia
        ProgrammingLanguage.PYTHON.value: {
            'beginner': [
                TriviaQuestion("What keyword is used to define a function in Python?",
                               ["function", "def", "func"], 1, "beginner", "Python"),
            ],
            'intermediate': [
                TriviaQuestion("What does PEP stand for in Python?",
                               ["Python Enhancement Proposal", "Python Execution Protocol", "Python Extension Package"], 0, "intermediate", "Python"),
            ],
            'advanced': [
                TriviaQuestion("What is the Global Interpreter Lock (GIL) in Python?",
                               ["A security feature", "A thread synchronization mechanism", "A garbage collector"], 1, "advanced", "Python"),
            ]
        },

        ProgrammingLanguage.JAVASCRIPT.value: {
            'beginner': [
                TriviaQuestion("Which keyword is used to declare a variable in modern JavaScript?",
                               ["var", "let", "const"], 1, "beginner", "JavaScript"),
            ],
            'intermediate': [
                TriviaQuestion("What is the difference between == and === in JavaScript?",
                               ["No difference", "=== checks type and value", "== is faster"], 1, "intermediate", "JavaScript"),
            ],
            'advanced': [
                TriviaQuestion("What is a closure in JavaScript?",
                               ["A loop construct", "A function with access to outer scope", "A data type"], 1, "advanced", "JavaScript"),
            ]
        },

        ProgrammingLanguage.JAVA.value: {
            'beginner': [
                TriviaQuestion("What is the main method signature in Java?",
                               ["public static void main(String args[])", "public void main(String args[])", "void main(String args[])"], 0, "beginner", "Java"),
                TriviaQuestion("Which keyword is used to create a class in Java?",
                               ["class", "Class", "new"], 0, "beginner", "Java"),
            ],
            'intermediate': [
                TriviaQuestion("What is the difference between ArrayList and LinkedList?",
                               ["No difference", "ArrayList is faster for random access", "LinkedList is always better"], 1, "intermediate", "Java"),
            ],
            'advanced': [
                TriviaQuestion("What is the difference between abstract class and interface in Java 8+?",
                               ["No difference", "Abstract classes only", "Both can have concrete methods"], 2, "advanced", "Java"),
            ]
        },
    }

    BONUS_ITEMS = [
        BonusItem(0, "Seeking Missiles", "Launch homing missiles to destroy 5 nearest enemies", OutlineIcon.ROCKET, 1, 1, 0.0),
        BonusItem(1, "Shield Boost", "Instant 50 shield points", OutlineIcon.SHIELD, 1, 1, 50.0),
        BonusItem(2, "Health Pack", "Restore 30 HP instantly", OutlineIcon.HEART, 1, 1, 30.0),
        BonusItem(3, "Time Freeze", "Freeze all enemies for 5 seconds", OutlineIcon.CLOCK_STOP, 300, 1, 0.0),
    ]

    @staticmethod
    def get_question(mode: GameMode, language: Optional[ProgrammingLanguage] = None, difficulty_level: int = 1) -> TriviaQuestion:
        if mode == GameMode.PROGRAMMING and language:
            category = language.value
        else:
            categories = [cat.value for cat in TriviaCategory]
            category = random.choice(categories)

        if difficulty_level <= 30:
            difficulty = 'beginner'
        elif difficulty_level <= 70:
            difficulty = 'intermediate'
        else:
            difficulty = 'advanced'

        questions = TriviaDatabase.TRIVIA_QUESTIONS.get(category, {})
        difficulty_questions = questions.get(difficulty, [])

        if not difficulty_questions:
            difficulty_questions = questions.get('beginner', [])

        if difficulty_questions:
            return random.choice(difficulty_questions)

        return TriviaQuestion("What is 2+2?", ["3", "4", "5"], 1, "beginner", "mathematics")

    @staticmethod
    def get_bonus_item() -> BonusItem:
        return random.choice(TriviaDatabase.BONUS_ITEMS)

    __all__ = ["TriviaDatabase"]

