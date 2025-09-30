"""EMP system for P-Type."""
import math

from effects.effects import ModernExplosion


def trigger_emp(game) -> None:
    """Trigger the EMP blast if it is currently available."""

    if not game.emp_ready or game.emp_cooldown > 0:
        return

    player_x = game.player_ship.x
    player_y = game.player_ship.y

    enemies_to_destroy = []
    for enemy in game.enemies:
        if getattr(enemy, 'is_boss', False):
            continue
        dx = enemy.x - player_x
        dy = enemy.y - player_y
        distance = math.sqrt(dx * dx + dy * dy)
        if distance <= game.emp_radius:
            enemies_to_destroy.append(enemy)

    if enemies_to_destroy:
        for enemy in enemies_to_destroy:
            game.explosions.append(ModernExplosion(enemy.x, enemy.y))
            if enemy in game.enemies:
                game.enemies.remove(enemy)
            if enemy is game.active_enemy:
                game.active_enemy = None
                game.current_input = ""
            game.score += (len(enemy.word) * 5 * game.level) // 2
            game.words_destroyed += 1

        game.emp_effect_timer = 30

    game.emp_ready = False
    game.emp_cooldown = game.emp_max_cooldown
