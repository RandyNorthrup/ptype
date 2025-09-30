"""
Game updates and progression logic for P-Type.
Handles main game loop updates, enemy spawning cycles, and progression mechanics.
"""
import pygame

from constants import MAX_LEVELS
from core.achievements import ACHIEVEMENTS
from core.types import GameMode
from data.word_dictionary import WordDictionary
from gameplay.bonuses import update_bonus_effects as gp_update_bonus_effects
from .enemy_management import spawn_enemy, spawn_boss, destroy_enemy, check_collisions


def update_game(game):
    """Update game state"""

    mode_value = getattr(game.game_mode, "value", game.game_mode)
    if mode_value not in (GameMode.NORMAL.value, GameMode.PROGRAMMING.value):
        return

    current_time = pygame.time.get_ticks()
    if game.game_start_time == 0:
        game.game_start_time = current_time

    # Spawn enemies
    if current_time - game.last_enemy_spawn > game.enemy_spawn_delay:
        spawn_enemy(game)
        game.last_enemy_spawn = current_time

    # Check if we should spawn a boss at this level
    if WordDictionary.is_boss_level(game.level) and not game.boss_spawned:
        from .enemy_management import spawn_boss  # Import here to avoid circular imports
        spawn_boss(game)

    # Update bonus effects
    gp_update_bonus_effects(game)

    # Update game objects with speed modifiers
    enemies_to_remove = []
    for enemy in game.enemies:
        # Apply enemy slow factor (from Time Freeze/Slow) by scaling velocity
        if game.enemy_slow_factor != 1.0:
            ovx, ovy = getattr(enemy, 'vx', 0), getattr(enemy, 'vy', 0)
            enemy.vx = ovx * game.enemy_slow_factor
            enemy.vy = ovy * game.enemy_slow_factor
            enemy.update()
            # Restore after update
            enemy.vx, ovy = ovx, ovy
        else:
            enemy.update()

        if enemy.is_off_screen(game.current_height):
            enemies_to_remove.append(enemy)
            # Take damage when enemies escape (less than collision)
            damage = 10

            # Apply damage to shield first
            if game.shield_buffer > 0:
                shield_damage = min(damage, game.shield_buffer)
                game.shield_buffer -= shield_damage
                damage -= shield_damage

            game.health -= damage
            game.health = max(0, game.health)

            if enemy == game.active_enemy:
                game.active_enemy = None
                game.current_input = ""

    for enemy in enemies_to_remove:
        if enemy in game.enemies:
            game.enemies.remove(enemy)

    # Update explosions
    for explosion in game.explosions:
        explosion.update()

    game.explosions = [exp for exp in game.explosions if not exp.is_finished()]

    # Update typing effects
    for effect in game.typing_effects:
        effect.update()

    game.typing_effects = [eff for eff in game.typing_effects if not eff.is_finished()]

    # Update laser beams
    for laser in game.laser_beams:
        laser.update()

    game.laser_beams = [laser for laser in game.laser_beams if not laser.is_finished()]

    # Update missiles (seeking projectiles)
    for missile in game.missiles:
        missile.update(game)
    game.missiles = [m for m in game.missiles if not m.is_finished()]

    # Update EMP cooldown
    if game.emp_cooldown > 0:
        game.emp_cooldown -= 1
        if game.emp_cooldown == 0:
            game.emp_ready = True

    # Update EMP effect timer
    if game.emp_effect_timer > 0:
        game.emp_effect_timer -= 1

    # Update visual feedback
    if game.wrong_char_flash > 0:
        game.wrong_char_flash -= 1

    # Check collisions - but don't instantly kill
    collision_result = check_collisions(game)

    # Check game over - only when health actually reaches 0
    if game.health <= 0:
        _handle_game_over(game)


def _handle_game_over(game):
    """Handle game over logic"""
    # Store the game mode before changing it
    actual_game_mode = game.game_mode
    game.game_mode = GameMode.GAME_OVER
    # Calculate final stats
    if game.total_keystrokes > 0:
        game.accuracy = (game.correct_keystrokes / game.total_keystrokes) * 100
    else:
        game.accuracy = 0

    # Update profile stats and check achievements
    if game.current_profile:
        # Update profile stats
        game.current_profile.games_played += 1
        game.current_profile.total_score += game.score
        game.current_profile.total_words_typed += game.words_destroyed

        if game.score > game.current_profile.best_score:
            game.current_profile.best_score = game.score

        if game.level > game.current_profile.highest_level:
            game.current_profile.highest_level = game.level

        # Update best WPM if this session's peak was better
        if game.peak_wpm > game.current_profile.best_wpm:
            game.current_profile.best_wpm = game.peak_wpm
            # Save immediately to ensure it persists
            game.settings.profiles[game.current_profile.name] = game.current_profile
            game.settings.save_profiles()

        # Update mode-specific stats
        mode_stats = game.current_profile.get_mode_stats(
            actual_game_mode.value if hasattr(actual_game_mode, 'value') else str(actual_game_mode),
            game.programming_language.value if actual_game_mode == GameMode.PROGRAMMING and hasattr(game.programming_language, 'value') else None
        )
        mode_stats['games_played'] += 1
        if game.score > mode_stats['best_score']:
            mode_stats['best_score'] = game.score
        if game.level > mode_stats['highest_level']:
            mode_stats['highest_level'] = game.level
        if game.peak_wpm > mode_stats['best_wpm']:
            mode_stats['best_wpm'] = game.peak_wpm

        # Track language for polyglot achievement
        if actual_game_mode == GameMode.PROGRAMMING and hasattr(game.programming_language, 'value'):
            game.current_profile.languages_played.add(game.programming_language.value)

        # Calculate session time
        session_time = (pygame.time.get_ticks() - game.game_start_time) / 1000 if game.game_start_time > 0 else 0

        # Check achievements
        game_state = {
            'accuracy': game.accuracy,
            'game_over': True,
            'perfect_words': game.perfect_words,
            'session_time': session_time
        }
        newly_unlocked = game.current_profile.check_achievements(game_state)

        # Add achievement notifications to display in UI
        for achievement_id in newly_unlocked:
            achievement = ACHIEVEMENTS[achievement_id]
            game.achievement_notifications.append((achievement, 300))  # Show for 5 seconds (300 frames)
            game.sound_manager.play('achievement')

        # Save profile
        game.settings.profiles[game.current_profile.name] = game.current_profile
        game.settings.save_profiles()
        game.settings.current_profile = game.current_profile

    # Use the stored game mode for high score recording
    lang = (
        game.programming_language.value
        if actual_game_mode == GameMode.PROGRAMMING and hasattr(game.programming_language, 'value')
        else None
    )

    mode_enum = actual_game_mode if isinstance(actual_game_mode, GameMode) else GameMode(actual_game_mode)
    game.settings.add_high_score(mode_enum, game.score, game.level, game.peak_wpm, game.accuracy, lang)
