"""Bonuses system for P-Type.

Encapsulates logic for activating and maintaining temporary bonus effects.
"""
from __future__ import annotations

import time
from types import SimpleNamespace
from typing import Optional

from core.achievements import ACHIEVEMENTS
from data.trivia_db import TriviaDatabase
from effects.effects import Missile


def activate_selected_bonus(game) -> Optional[SimpleNamespace]:
    """Activate the bonus currently selected in the HUD.

    Returns a lightweight namespace describing the activated item when the
    action succeeds so the caller can perform additional handling (like
    analytics) without recalculating state.
    """

    if not getattr(game, "item_quantities", None):
        return None

    item_count = len(game.item_quantities)
    if item_count == 0:
        return None

    index = getattr(game, "selected_item_index", 0) % item_count
    if game.item_quantities[index] <= 0:
        return None

    item = TriviaDatabase.BONUS_ITEMS[index]
    if not apply_bonus_effect(game, item):
        return None

    game.item_quantities[index] -= 1

    if getattr(game, "current_profile", None):
        game.current_profile.bonus_items_used += 1
        newly_unlocked = game.current_profile.check_achievements({})
        for achievement_id in newly_unlocked:
            achievement = ACHIEVEMENTS.get(achievement_id)
            if achievement:
                game.achievement_notifications.append((achievement, 300))
                game.sound_manager.play('achievement')

    return SimpleNamespace(id=item.item_id, name=item.name)


def apply_bonus_effect(game, item) -> bool:
    """Apply the concrete effect for a bonus item. Returns True on success."""

    name = getattr(item, 'name', '')

    if name == "Seeking Missiles":
        playable_enemies = [e for e in game.enemies if not getattr(e, 'is_boss', False)]
        if not playable_enemies:
            return False

        px, py = int(game.player_ship.x), int(game.player_ship.y)
        playable_enemies.sort(key=lambda enemy: (enemy.x - px) ** 2 + (enemy.y - py) ** 2)
        for enemy in playable_enemies[:5]:
            game.missiles.append(Missile(px, py, enemy))
        game.sound_manager.play('missile_launch')

    elif name == "Shield Boost":
        game.shield_buffer = min(100, game.shield_buffer + int(item.effect_value))

    elif name == "Health Pack":
        game.health = min(game.max_health, game.health + int(item.effect_value))

    elif name == "Time Freeze":
        duration_frames = max(item.duration, 60)
        game.time_slow_active = True
        game.enemy_slow_factor = 0.0
        game.time_slow_end_time = time.time() + (duration_frames / 60.0)
        game.active_bonuses.append((item, duration_frames))
        for enemy in game.enemies:
            enemy.original_speed = getattr(enemy, 'original_speed', enemy.speed)
            enemy.original_velocity = getattr(enemy, 'original_velocity', (getattr(enemy, 'vx', 0), getattr(enemy, 'vy', 0)))
            enemy.speed = 0
            if hasattr(enemy, 'vx'):
                enemy.vx = 0
            if hasattr(enemy, 'vy'):
                enemy.vy = 0

    else:
        return False

    _notify_bonus_activation(game, item)
    return True


def update_bonus_effects(game) -> None:
    """Tick active bonus timers and restore state once they finish."""

    current_time = time.time()

    if getattr(game, 'rapid_fire_active', False) and current_time >= getattr(game, 'rapid_fire_end_time', 0):
        game.rapid_fire_active = False
        game.rapid_fire_multiplier = 1.0

    if getattr(game, 'time_slow_active', False) and current_time >= getattr(game, 'time_slow_end_time', 0):
        game.time_slow_active = False
        game.enemy_slow_factor = 1.0
        for enemy in game.enemies:
            if hasattr(enemy, 'original_speed'):
                enemy.speed = enemy.original_speed
                if hasattr(enemy, 'original_velocity'):
                    vx, vy = enemy.original_velocity
                    if hasattr(enemy, 'vx'):
                        enemy.vx = vx
                    if hasattr(enemy, 'vy'):
                        enemy.vy = vy
                elif hasattr(enemy, 'calculate_direction'):
                    enemy.calculate_direction()

    updated = []
    for item, timer in getattr(game, 'active_bonuses', []):
        timer -= 1
        if timer > 0:
            updated.append((item, timer))
    game.active_bonuses = updated


def _notify_bonus_activation(game, item) -> None:
    """Push HUD notification for visual feedback."""

    message = SimpleNamespace(name=f"Activated: {item.name}", description=item.description)
    game.achievement_notifications.append((message, 180))
    game.sound_manager.play('level')
