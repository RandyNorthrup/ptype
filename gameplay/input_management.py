"""
Input management and trivia system for P-Type.
Handles keyboard input processing, word typing, and trivia interactions.
"""
import pygame
from data.trivia_db import TriviaDatabase
from core.types import GameMode


def handle_input(game, char: str):
    """Handle character input from player with comprehensive stats tracking"""
    current_time = pygame.time.get_ticks()

    # Track total keystrokes
    game.total_keystrokes += 1

    # Initialize keystroke timing if needed
    if not hasattr(game, 'keystroke_times'):
        game.keystroke_times = []
        game.last_keystroke_time = current_time

    # Track time between keystrokes for WPM calculation
    time_since_last = current_time - game.last_keystroke_time
    if 50 < time_since_last < 5000:  # Ignore very fast or very slow keystrokes
        game.keystroke_times.append(time_since_last)
        if len(game.keystroke_times) > 20:  # Keep last 20 keystrokes
            game.keystroke_times.pop(0)

        # Calculate current WPM
        if len(game.keystroke_times) >= 5:
            avg_time = sum(game.keystroke_times) / len(game.keystroke_times)
            # WPM = (60000ms / avg_time_per_char) / 5 chars_per_word
            game.current_wpm = (60000 / avg_time) / 5
            game.peak_wpm = max(game.peak_wpm, game.current_wpm)

    game.last_keystroke_time = current_time

    # If no active enemy, try to start typing a new word
    if game.active_enemy is None:
        for enemy in game.enemies:
            if enemy.original_word.startswith(char) and not enemy.active:
                enemy.active = True
                enemy.typed_chars = char
                game.active_enemy = enemy
                game.current_input = char
                game.correct_keystrokes += 1
                game.mistakes_this_word = 0
                # Play type sound
                game.sound_manager.play('type')
                # Add laser beam effect
                game.laser_beams.append(game.LaserBeam(
                    game.player_ship.x, game.player_ship.y,
                    enemy.x, enemy.y
                ))
                break
        else:
            # No matching enemy found - wrong key
            game.wrong_char_flash = 30
            game.sound_manager.play('wrong')
    else:
        # Continue typing the active word
        if game.active_enemy in game.enemies:
            if game.active_enemy.type_char(char):
                game.current_input += char
                game.correct_keystrokes += 1

                # Play type sound
                game.sound_manager.play('type')

                # Add laser beam effect from player to enemy
                if game.active_enemy:
                    game.laser_beams.append(game.LaserBeam(
                        game.player_ship.x, game.player_ship.y,
                        game.active_enemy.x, game.active_enemy.y
                    ))

                # Add typing effect at enemy position
                if game.active_enemy:
                    effect_x = game.active_enemy.x + len(game.current_input) * 8 - 40
                    effect_y = game.active_enemy.y + 30
                    game.typing_effects.append(game.TypingEffect(effect_x, effect_y, char, True))

                if game.active_enemy.is_word_complete():
                    # Play correct word sound
                    game.sound_manager.play('correct')
                    # Track perfect words
                    if game.mistakes_this_word == 0:
                        game.perfect_words += 1
                        game.score += 50  # Perfect word bonus
                        # Heal more for perfect words
                        game.health = min(100, game.health + 8)
                    else:
                        # Normal heal for completing a word
                        game.health = min(100, game.health + 5)

                    # Update profile stats
                    if game.current_profile:
                        game.current_profile.total_words_typed += 1
                        mode_stats = game.current_profile.get_mode_stats(
                            game.game_mode.value if hasattr(game.game_mode, 'value') else game.game_mode,
                            game.programming_language.value if hasattr(game.programming_language, 'value') else game.programming_language
                        )
                        mode_stats['total_words'] += 1
                        # Update both overall and mode-specific best WPM
                        if game.current_wpm > mode_stats['best_wpm']:
                            mode_stats['best_wpm'] = game.current_wpm
                        # Also update the overall profile best_wpm
                        if game.current_wpm > game.current_profile.best_wpm:
                            game.current_profile.best_wpm = game.current_wpm

                        # Achievement checking will be handled in main game class

                    game.destroy_enemy(game.active_enemy)
                    game.active_enemy = None
                    game.current_input = ""
                    game.mistakes_this_word = 0
            else:
                # Wrong character feedback
                game.wrong_char_flash = 30
                game.mistakes_this_word += 1
                game.sound_manager.play('wrong')
        else:
            # Active enemy no longer exists
            game.active_enemy = None
            game.current_input = ""

            # Try to start a new word
            for enemy in game.enemies:
                if enemy.original_word.startswith(char) and not enemy.active:
                    enemy.active = True
                    enemy.typed_chars = char
                    game.active_enemy = enemy
                    game.current_input = char
                    game.correct_keystrokes += 1
                    game.mistakes_this_word = 0
                    break
            else:
                game.wrong_char_flash = 30
                game.sound_manager.play('wrong')

    # Update accuracy
    if game.total_keystrokes > 0:
        game.accuracy = (game.correct_keystrokes / game.total_keystrokes) * 100


def select_next_ship(game):
    """Select the next ship in the list"""
    if not game.enemies:
        return

    if game.active_enemy is None:
        game.active_enemy = game.enemies[0]
        game.active_enemy.active = True
        game.current_input = ""
        return

    try:
        current_index = game.enemies.index(game.active_enemy)
        game.active_enemy.active = False
        game.active_enemy.typed_chars = ""

        next_index = (current_index + 1) % len(game.enemies)
        game.active_enemy = game.enemies[next_index]
        game.active_enemy.active = True
        game.current_input = ""
    except ValueError:
        if game.enemies:
            game.active_enemy = game.enemies[0]
            game.active_enemy.active = True
            game.current_input = ""


def select_previous_ship(game):
    """Select the previous ship in the list"""
    if not game.enemies:
        return

    if game.active_enemy is None:
        game.active_enemy = game.enemies[-1]
        game.active_enemy.active = True
        game.current_input = ""
        return

    try:
        current_index = game.enemies.index(game.active_enemy)
        game.active_enemy.active = False
        game.active_enemy.typed_chars = ""

        prev_index = (current_index - 1) % len(game.enemies)
        game.active_enemy = game.enemies[prev_index]
        game.active_enemy.active = True
        game.current_input = ""
    except ValueError:
        if game.enemies:
            game.active_enemy = game.enemies[-1]
            game.active_enemy.active = True
            game.current_input = ""


def cycle_item_selection(game, direction: str):
    """Cycle through the 4 item types"""
    if direction == "up":
        game.selected_item_index = (game.selected_item_index - 1) % 4
    elif direction == "down":
        game.selected_item_index = (game.selected_item_index + 1) % 4


def activate_selected_bonus(game):
    """Activate the currently selected bonus item (BACKSPACE)."""
    from .bonuses import activate_selected_bonus as gp_activate_selected_bonus
    gp_activate_selected_bonus(game)


def trigger_emp(game):
    """Trigger EMP weapon to destroy nearby enemies."""
    from .emp import trigger_emp as gp_trigger_emp
    gp_trigger_emp(game)


def handle_trivia_input(game, key: int):
    """Handle input during trivia mode"""
    if not game.current_trivia:
        return

    if not game.trivia_answered:
        # Select answer
        if key == pygame.K_1:
            game.selected_answer = 0
        elif key == pygame.K_2:
            game.selected_answer = 1
        elif key == pygame.K_3:
            game.selected_answer = 2
        elif key == pygame.K_SPACE and game.selected_answer >= 0:
            # Confirm answer
            game.trivia_answered = True
            game.trivia_result = (game.selected_answer == game.current_trivia.correct_answer)
            # Play sound
            if game.trivia_result:
                game.sound_manager.play('correct')
            else:
                game.sound_manager.play('wrong')
    else:
        # Answer has been given, space to continue
        if key == pygame.K_SPACE:
            complete_trivia(game)


def complete_trivia(game):
    """Complete trivia and award prizes"""
    # Update profile stats
    if game.current_profile:
        game.current_profile.trivia_questions_answered += 1

        if game.trivia_result:
            # Correct answer - update stats
            game.current_profile.trivia_questions_correct += 1
            game.current_profile.trivia_streak_current += 1
            if game.current_profile.trivia_streak_current > game.current_profile.trivia_streak_best:
                game.current_profile.trivia_streak_best = game.current_profile.trivia_streak_current

            # Award one random bonus item
            bonus_item = TriviaDatabase.get_bonus_item()

            # Add to the quantity of that item type
            game.item_quantities[bonus_item.item_id] += 1

            # Track bonus collection
            game.current_profile.bonus_items_collected += 1

            # Show notification
            game.achievement_notifications.append(
                (type('obj', (object,), {
                    'name': f'Trivia Reward: {bonus_item.name}',
                    'description': 'Use UP/DOWN to select, BACKSPACE to use'
                })(), 300)
            )
        else:
            # Wrong answer - reset streak
            game.current_profile.trivia_streak_current = 0

        # Achievement checking will be handled in main game class

    # Return to game
    game.trivia_pending = False
    game.current_trivia = None
    game.selected_answer = -1
    game.trivia_answered = False
    game.trivia_result = None

    # Return to previous game mode
    if hasattr(game, '_last_game_mode'):
        game.game_mode = game._last_game_mode
    else:
        game.game_mode = GameMode.NORMAL
