"""
Enemy management and lifecycle for P-Type.
Handles enemy spawning, boss spawning, destruction, and collision detection.
"""
from constants import SCREEN_WIDTH
from core.types import GameMode
from data.word_dictionary import WordDictionary
from effects.effects import ModernExplosion
from entities.enemies import BossEnemy, ModernEnemy


def spawn_enemy(game):
    """Spawn a new enemy with appropriate word based on current level"""
    # Reduce but don't stop regular enemy spawning when boss is present
    if game.boss_spawned:
        max_enemies = min(2 + game.level // 6, 5)  # Keep screen manageable during boss fights
    else:
        max_enemies = min(6 + game.level // 4, 10)  # Gradually introduce more enemies

    # Count only non-boss enemies for spawn limit
    non_boss_count = len([e for e in game.enemies if not (hasattr(e, 'is_boss') and e.is_boss)])

    if non_boss_count < max_enemies:
        # Get words appropriate for current level with proper length filtering
        words = WordDictionary.get_words(game.game_mode, game.programming_language, game.level)

        # Word dictionary already applies appropriate length filtering based on level
        # No additional filtering needed - the level system handles word length

        word = game.random_choice(words)
        # Pass player position to enemy
        player_x = game.player_ship.x if hasattr(game, 'player_ship') else SCREEN_WIDTH // 2
        enemy = ModernEnemy(word, game.level, player_x)
        game.enemies.append(enemy)


def spawn_boss(game):
    """Spawn a boss enemy with a challenging word"""
    if not game.boss_spawned:
        # Get a challenging boss word
        boss_word = WordDictionary.get_boss_word(game.game_mode, game.programming_language, game.level)

        # Create boss enemy targeting player, passing game mode for speed adjustment
        player_x = game.player_ship.x if hasattr(game, 'player_ship') else SCREEN_WIDTH // 2
        boss = BossEnemy(boss_word, game.level, player_x, game.game_mode)
        # Store reference to player ship for continuous tracking
        boss.player_ship = game.player_ship if hasattr(game, 'player_ship') else None
        game.enemies.append(boss)

        game.boss_spawned = True
        game.boss_spawn_time = game.pygame_time_get_ticks()

        # Play boss appearance sound
        game.sound_manager.play('boss')

        # Don't clear existing enemies - let them coexist with boss for added challenge


def destroy_enemy(game, enemy):
    """Destroy an enemy and create explosion effect"""
    if enemy in game.enemies:
        game.enemies.remove(enemy)

        # Create explosion - larger for bosses
        if hasattr(enemy, 'is_boss') and enemy.is_boss:
            # Multiple explosions for boss
            for _ in range(3):
                offset_x = game.random.randint(-30, 30)
                offset_y = game.random.randint(-30, 30)
                game.explosions.append(ModernExplosion(enemy.x + offset_x, enemy.y + offset_y, "large"))
            # Play destroy sound for boss
            game.sound_manager.play('destroy')
        else:
            game.explosions.append(ModernExplosion(enemy.x, enemy.y))
            # Play destroy sound
            game.sound_manager.play('destroy')

        # Boss enemies are worth more points
        word_score = len(enemy.word) * 10 * game.level
        if hasattr(enemy, 'is_boss') and enemy.is_boss:
            word_score *= 3  # Boss enemies worth triple points

        game.score += word_score
        game.words_destroyed += 1

        # Check if this was a boss - if so, advance level immediately
        if hasattr(enemy, 'is_boss') and enemy.is_boss:
            # Update profile boss count
            if game.current_profile:
                game.current_profile.bosses_defeated += 1
                mode_stats = game.current_profile.get_mode_stats(
                    game.game_mode.value if hasattr(game.game_mode, 'value') else game.game_mode,
                    game.programming_language.value if hasattr(game.programming_language, 'value') else game.programming_language
                )
                mode_stats['bosses_defeated'] += 1

                # Check for boss slayer achievement - simplified for now
                # (Original checks achievements here)

            # Shield buffer if at full health
            if game.health >= game.max_health:
                game.shield_buffer = min(game.shield_buffer + 25, 100)  # Add 25 shield, max 100

            # Track total bosses defeated for trivia
            game.total_bosses_defeated += 1

            # Check if trivia should trigger (every 2 boss defeats)
            if game.total_bosses_defeated % 2 == 0:
                game.trivia_pending = True
                # Prepare trivia question - will be handled in input management
                game.current_trivia = game.trivia_db_get_question(
                    game.game_mode,
                    game.programming_language if game.game_mode == GameMode.PROGRAMMING else None,
                    game.level
                )
                game.selected_answer = -1
                game.trivia_answered = False
                game.trivia_result = None
                # Switch to trivia mode
                game.game_mode = GameMode.TRIVIA

            game.level += 1
            game.update_spawn_delay()
            game.health = min(game.max_health, game.health + 40)  # Significant health restore for boss
            game.boss_defeated = True
            game.boss_spawned = False  # Allow new boss for next level
            game.enemies_defeated_this_level = 0  # Reset counter
            # Play level complete sound
            game.sound_manager.play('level')
        else:
            # Count regular enemies defeated this level
            game.enemies_defeated_this_level += 1

            # Spawn boss only at specific level endings (5, 10, 15, 20, etc.)
            if WordDictionary.is_boss_level(game.level) and not game.boss_spawned:
                spawn_boss(game)


def check_collisions(game) -> bool:
    """Check for ship-to-ship collisions"""
    if not game.enemies:  # Early exit if no enemies
        return False

    # Check for invincibility
    if game.invincibility_active:
        return False  # No damage during invincibility

    player_rect = game.player_ship.get_collision_rect()

    for enemy in game.enemies[:]:  # Iterate over a copy to allow safe removal
        enemy_rect = enemy.get_collision_rect()
        if player_rect.colliderect(enemy_rect):
            # Calculate base damage
            if hasattr(enemy, 'is_boss') and enemy.is_boss:
                # Boss collision: damage scales with boss level
                # Base damage: 30 at level 1, scaling up to 80 at level 100
                boss_level = getattr(enemy, 'boss_level', game.level)
                level_scaling = (boss_level - 1) / (99)  # 0 to 1 as level increases
                total_damage = int(30 + (50 * level_scaling))  # 30 to 80 damage
            else:
                # Regular enemy damage
                total_damage = 15

            # Always apply damage to shield first, then health
            remaining_damage = total_damage

            # Consume shield first
            if game.shield_buffer > 0:
                shield_absorbed = min(remaining_damage, game.shield_buffer)
                game.shield_buffer -= shield_absorbed
                remaining_damage -= shield_absorbed

            # Apply remaining damage to health
            game.health -= remaining_damage
            game.health = max(0, game.health)  # Don't go below 0

            # Create explosion effects
            game.explosions.append(ModernExplosion(enemy.x, enemy.y))
            # Smaller explosion for player damage
            game.explosions.append(ModernExplosion(game.player_ship.x, game.player_ship.y, "small"))

            # Play collision sound
            game.sound_manager.play('collision')

            # Remove the enemy
            if enemy in game.enemies:
                game.enemies.remove(enemy)
            if enemy == game.active_enemy:
                game.active_enemy = None
                game.current_input = ""

            # Flash effect for damage
            game.collision_detected = True
            return True

    # Reset collision flag after a few frames
    if hasattr(game, 'collision_detected') and game.collision_detected:
        game.collision_detected = False

    return False
