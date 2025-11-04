"""
Game state management for P-Type.
Handles game state initialization, saving, and loading operations.
"""
import json
from .types import GameMode, ProgrammingLanguage


def reset_game_state(game):
    """Reset all game state variables"""
    game.score = 0
    game.level = 1
    game.health = 100
    game.shield_buffer = 0  # Extra shield from boss defeats at full health
    game.max_health = 100
    game.missed_ships = 0
    game.words_destroyed = 0
    game.enemies = []
    game.explosions = []
    game.typing_effects = []  # New: typing visual effects
    game.laser_beams = []  # Laser beam effects from player to enemy
    game.missiles = []  # Seeking missiles in flight
    game.current_input = ""
    game.active_enemy = None
    game.last_enemy_spawn = 0
    game.game_start_time = 0
    game.collision_detected = False
    game.wrong_char_flash = 0

    # Initialize sound manager if not already initialized
    if not hasattr(game, 'sound_manager') and hasattr(game, 'create_sound_manager'):
        game.sound_manager = game.create_sound_manager(0.8)

    # EMP weapon system
    game.emp_ready = True
    game.emp_cooldown = 0
    game.emp_max_cooldown = 600  # 10 seconds at 60 FPS
    game.emp_radius = 250
    game.emp_effect_timer = 0

    # Boss system variables
    game.boss_spawned = False
    game.boss_defeated = False
    game.boss_spawn_time = 0
    game.enemies_defeated_this_level = 0

    # Player stats tracking
    if hasattr(game, 'create_session_stats'):
        game.session_stats = game.create_session_stats()
    else:
        game.session_stats = getattr(game, 'session_stats', {})
    game.total_keystrokes = 0
    game.correct_keystrokes = 0
    game.current_wpm = 0.0
    game.peak_wpm = 0.0
    game.accuracy = 100.0
    game.perfect_words = 0
    game.mistakes_this_word = 0

    # Name entry state
    game.entering_name = False
    game.player_name_input = ""

    # Profile management state
    game.creating_profile = False
    game.selected_profile_name = None
    game.update_profile_dropdown = False
    game.stats_change_player_btn = None

    # Achievement notifications
    game.achievement_notifications = []  # List of (achievement, timer) tuples

    # Trivia system
    game.total_bosses_defeated = 0  # Track total bosses defeated for trivia trigger
    game.trivia_pending = False
    game.current_trivia = None
    game.selected_answer = -1
    game.trivia_answered = False
    game.trivia_result = None  # True for correct, False for wrong

    # Bonus items inventory - track quantity of each unique item type
    game.item_quantities = [0, 0, 0, 0]  # Quantities for each of the 4 unique items
    game.selected_item_index = 0  # Currently selected item type (0-3)
    game.active_bonuses = []  # Currently active bonus effects [(item, timer)]

    game.enemy_spawn_delay = 5200

    # Bonus effect flags and timers
    game.rapid_fire_active = False
    game.rapid_fire_end_time = 0
    game.rapid_fire_multiplier = 1.0
    game.multi_shot_active = False
    game.invincibility_active = False
    game.time_slow_active = False
    game.time_slow_end_time = 0
    game.enemy_slow_factor = 1.0  # Speed multiplier for enemies


def get_game_state(game) -> dict:
    """Get current game state for saving"""

    current_mode = getattr(game, 'game_mode', None)
    if current_mode == GameMode.PAUSE:
        actual_mode = getattr(game, '_last_game_mode', current_mode)
    else:
        actual_mode = current_mode

    mode_value = actual_mode.value if isinstance(actual_mode, GameMode) else str(actual_mode)

    return {
        'score': game.score,
        'level': game.level,
        'health': game.health,
        'missed_ships': game.missed_ships,
        'words_destroyed': game.words_destroyed,
        'game_mode': mode_value,
        'programming_language': (
            game.programming_language.value
            if isinstance(actual_mode, GameMode) and actual_mode == GameMode.PROGRAMMING and hasattr(game.programming_language, 'value')
            else None
        ),
        'boss_spawned': game.boss_spawned,
        'enemies_defeated_this_level': game.enemies_defeated_this_level,
        'total_keystrokes': game.total_keystrokes,
        'correct_keystrokes': game.correct_keystrokes,
        'peak_wpm': game.peak_wpm,
        'perfect_words': game.perfect_words
    }


def load_game_state(game, state: dict) -> None:
    """Load game state from save"""
    reset_game_state(game)
    game.score = state.get('score', 0)
    game.level = state.get('level', 1)
    game.health = state.get('health', 100)
    game.missed_ships = state.get('missed_ships', 0)
    game.words_destroyed = state.get('words_destroyed', 0)
    game.boss_spawned = state.get('boss_spawned', False)
    game.enemies_defeated_this_level = state.get('enemies_defeated_this_level', 0)
    game.total_keystrokes = state.get('total_keystrokes', 0)
    game.correct_keystrokes = state.get('correct_keystrokes', 0)
    game.peak_wpm = state.get('peak_wpm', 0.0)
    game.perfect_words = state.get('perfect_words', 0)

    # Set game mode
    mode_value = state.get('game_mode', GameMode.NORMAL.value)
    try:
        game.game_mode = GameMode(mode_value)
    except ValueError:
        game.game_mode = GameMode.NORMAL

    # Set programming language if applicable
    if game.game_mode == GameMode.PROGRAMMING:
        lang = state.get('programming_language', 'Python')
        if hasattr(ProgrammingLanguage, lang.upper()):
            game.programming_language = ProgrammingLanguage[lang.upper()]


def update_spawn_delay(game):
    """Update enemy spawn delay based on current level"""
    base_delay = 5200
    min_delay = 1800
    delay_reduction = (base_delay - min_delay) * (game.level - 1) / (100 - 1)  # Using MAX_LEVELS from constants
    game.enemy_spawn_delay = max(min_delay, base_delay - delay_reduction)
