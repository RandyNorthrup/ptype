"""HUD rendering for P-Type (score, bars, items, controls)."""
import math
import pygame

from constants import (
    DARKER_BG, ACCENT_BLUE, MODERN_WHITE, ACCENT_CYAN, MODERN_DARK_GRAY,
    NEON_BLUE, MODERN_LIGHT, MODERN_GRAY, ACCENT_ORANGE, NEON_GREEN,
    ACCENT_RED, ACCENT_YELLOW, NEON_PINK, ACCENT_PURPLE, SCREEN_WIDTH
)
from core.types import GameMode


def draw_game_ui(game):
    """Draw modern game UI (top panel, health/shield, items, controls, achievement notifications)."""
    current_width = pygame.display.get_surface().get_width()

    # Wrong character feedback (positioned relative to current height)
    if game.wrong_char_flash > 0:
        flash_bg = pygame.Rect(20, game.current_height - 120, 200, 30)
        pygame.draw.rect(game.screen, ACCENT_RED, flash_bg, border_radius=6)
        flash_text = game.font.render("Wrong character!", True, MODERN_WHITE)
        flash_text_rect = flash_text.get_rect(center=flash_bg.center)
        game.screen.blit(flash_text, flash_text_rect)

    # Achievement notifications
    notification_y = 150
    for i, (achievement, timer) in enumerate(game.achievement_notifications[:3]):  # Show max 3 at once
        if timer > 0:
            # Fade effect
            alpha = min(255, timer * 2) if timer < 60 else 255

            # Notification panel
            notif_rect = pygame.Rect(current_width//2 - 200, notification_y + i * 80, 400, 60)
            notif_surface = pygame.Surface((400, 60), pygame.SRCALPHA)
            pygame.draw.rect(notif_surface, (*DARKER_BG[:3], alpha), (0, 0, 400, 60), border_radius=10)
            pygame.draw.rect(notif_surface, (*ACCENT_YELLOW[:3], alpha), (0, 0, 400, 60), 3, border_radius=10)

            # Achievement unlocked text
            unlock_text = game.font.render("ACHIEVEMENT UNLOCKED!", True, (*ACCENT_YELLOW[:3], alpha))
            unlock_rect = unlock_text.get_rect(center=(200, 20))
            notif_surface.blit(unlock_text, unlock_rect)

            # Achievement name only (no Unicode icon)
            ach_text = game.font.render(f"{achievement.name}", True, (*MODERN_WHITE[:3], alpha))
            ach_rect = ach_text.get_rect(center=(200, 40))
            notif_surface.blit(ach_text, ach_rect)

            game.screen.blit(notif_surface, notif_rect)

    # Update achievement notification timers
    game.achievement_notifications = [(ach, timer - 1) for ach, timer in game.achievement_notifications if timer > 0]

    # Game mode and WPM indicators - stacked display in center of top bar
    mode_text = game.game_mode.value.title() if hasattr(game.game_mode, 'value') else str(game.game_mode).title()
    if hasattr(game, 'programming_language') and game.game_mode == GameMode.PROGRAMMING:
        mode_text += f" - {game.programming_language.value}"

    from constants import BASE_WPM, MAX_WPM, MAX_LEVELS
    current_wpm = BASE_WPM + ((MAX_WPM - BASE_WPM) * (game.level - 1) / (MAX_LEVELS - 1))

    # Display mode on first line
    mode_surface = game.font.render(mode_text, True, MODERN_WHITE)
    mode_rect = mode_surface.get_rect(center=(current_width//2, 35))
    game.screen.blit(mode_surface, mode_rect)

    # Display WPM goal on second line with color based on difficulty
    # Color changes based on WPM speed for visual feedback
    if current_wpm <= 50:
        wpm_color = NEON_GREEN  # Easy - green
    elif current_wpm <= 100:
        wpm_color = ACCENT_CYAN  # Moderate - cyan
    elif current_wpm <= 150:
        wpm_color = ACCENT_YELLOW  # Challenging - yellow
    elif current_wpm <= 200:
        wmp_color = ACCENT_ORANGE  # Hard - orange
    elif current_wpm <= 250:
        wpm_color = NEON_PINK  # Very Hard - pink
    else:
        wpm_color = ACCENT_RED  # Extreme - red

    wpm_text = f"WPM Goal: {int(current_wpm)}"
    wpm_surface = game.font.render(wpm_text, True, wpm_color)
    wpm_rect = wpm_surface.get_rect(center=(current_width//2, 60))
    game.screen.blit(wpm_surface, wpm_rect)

    # EMP indicator with larger vertical progress bar - add padding from right edge
    emp_y = 110  # Position lower to avoid touching the bar above
    emp_bar_x = current_width - 40  # More padding from right edge

    # Always draw vertical EMP progress bar (bigger)
    emp_bar_bg = pygame.Rect(emp_bar_x, emp_y, 15, 60)  # Bigger bar
    pygame.draw.rect(game.screen, MODERN_DARK_GRAY, emp_bar_bg, border_radius=6)

    # Progress fill
    if getattr(game, 'emp_ready', True):
        # Full green bar when ready
        pygame.draw.rect(game.screen, NEON_GREEN, emp_bar_bg, border_radius=6)
    else:
        cooldown_percent = (game.emp_max_cooldown - game.emp_cooldown) / game.emp_max_cooldown
        bar_height = int(60 * cooldown_percent)
        if bar_height > 0:
            emp_bar_fill = pygame.Rect(emp_bar_x, emp_y + (60 - bar_height), 15, bar_height)
            pygame.draw.rect(game.screen, ACCENT_ORANGE, emp_bar_fill, border_radius=6)

    # Border
    pygame.draw.rect(game.screen, MODERN_WHITE, emp_bar_bg, 2, border_radius=6)

    # EMP text (positioned to the left of the bar)
    if getattr(game, 'emp_ready', True):
        emp_text = game.small_font.render("EMP Ready", True, NEON_GREEN)
        emp_text2 = game.small_font.render("[ENTER]", True, NEON_GREEN)
        emp_rect = emp_text.get_rect(topright=(emp_bar_x - 10, emp_y + 15))
        emp_rect2 = emp_text2.get_rect(topright=(emp_bar_x - 10, emp_y + 30))
        game.screen.blit(emp_text, emp_rect)
        game.screen.blit(emp_text2, emp_rect2)
    else:
        cooldown_percent = (game.emp_max_cooldown - game.emp_cooldown) / game.emp_max_cooldown
        emp_text = game.small_font.render("EMP", True, ACCENT_ORANGE)
        emp_percent = game.small_font.render(f"{int(cooldown_percent * 100)}%", True, ACCENT_ORANGE)
        emp_rect = emp_text.get_rect(topright=(emp_bar_x - 10, emp_y + 20))
        percent_rect = emp_percent.get_rect(topright=(emp_bar_x - 10, emp_y + 35))
        game.screen.blit(emp_text, emp_rect)
        game.screen.blit(emp_percent, percent_rect)

    # Draw EMP effect if active
    if hasattr(game, 'emp_effect_timer') and game.emp_effect_timer > 0:
        alpha = game.emp_effect_timer * 8  # Fade out effect
        emp_surf = pygame.Surface((game.emp_radius * 2, game.emp_radius * 2), pygame.SRCALPHA)
        pygame.draw.circle(emp_surf, (*ACCENT_CYAN, min(alpha, 100)),
                         (game.emp_radius, game.emp_radius), game.emp_radius, 3)
        # Pulse rings
        for i in range(3):
            ring_radius = game.emp_radius * (1 - game.emp_effect_timer / 30) + i * 20
            if ring_radius < game.emp_radius:
                pygame.draw.circle(emp_surf, (*NEON_BLUE, min(alpha // 2, 50)),
                                 (game.emp_radius, game.emp_radius), int(ring_radius), 2)
        game.screen.blit(emp_surf, (game.player_ship.x - game.emp_radius,
                                   game.player_ship.y - game.emp_radius))

    # Top panel, health/shield bars
    top_panel = pygame.Rect(0, 0, current_width, 100)
    pygame.draw.rect(game.screen, DARKER_BG, top_panel)
    pygame.draw.rect(game.screen, ACCENT_BLUE, (0, 95, current_width, 5))

    score_text = game.medium_font.render(f"Score: {game.score:,}", True, MODERN_WHITE)
    game.screen.blit(score_text, (20, 20))

    level_text = game.medium_font.render(f"Level: {game.level}/{MAX_LEVELS}", True, ACCENT_CYAN)
    game.screen.blit(level_text, (20, 50))

    health_rect = pygame.Rect(current_width - 220, 20, 180, 25)
    pygame.draw.rect(game.screen, MODERN_DARK_GRAY, health_rect, border_radius=12)

    if game.health <= 30:
        flash = abs(math.sin(pygame.time.get_ticks() * 0.005))
        health_color = ACCENT_ORANGE if flash <= 0.5 else (150, 20, 20)
    else:
        health_color = NEON_GREEN if game.health > 60 else ACCENT_ORANGE

    health_fill_width = int(180 * game.health / game.max_health)
    if health_fill_width > 0:
        health_fill = pygame.Rect(current_width - 220, 20, health_fill_width, 25)
        pygame.draw.rect(game.screen, health_color, health_fill, border_radius=12)

    text_color = MODERN_WHITE
    if game.health <= 30:
        flash = abs(math.sin(pygame.time.get_ticks() * 0.005))
        if flash > 0.5:
            text_color = ACCENT_ORANGE

    health_text = game.small_font.render(f"HP: {game.health}/{game.max_health}", True, text_color)
    health_text_rect = health_text.get_rect(center=(current_width - 130, 32))
    game.screen.blit(health_text, health_text_rect)

    shield_rect = pygame.Rect(current_width - 220, 50, 180, 25)
    pygame.draw.rect(game.screen, MODERN_DARK_GRAY, shield_rect, border_radius=12)
    shield_width = int(180 * game.shield_buffer / 100)
    if shield_width > 0:
        shield_fill = pygame.Rect(current_width - 220, 50, shield_width, 25)
        pygame.draw.rect(game.screen, ACCENT_PURPLE, shield_fill, border_radius=12)
    shield_text = game.small_font.render(f"Shield: {game.shield_buffer}%", True, MODERN_WHITE)
    shield_text_rect = shield_text.get_rect(center=(current_width - 130, 62))
    game.screen.blit(shield_text, shield_text_rect)

    # Items vertical boxes on the right
    box_size = 45
    box_spacing = 5
    items_x = current_width - 60
    items_y = 220
    items_label = game.small_font.render("ITEMS", True, ACCENT_PURPLE)
    label_rect = items_label.get_rect(center=(items_x + box_size//2, items_y - 15))
    game.screen.blit(items_label, label_rect)

    from data.trivia_db import TriviaDatabase
    from ui.icon_helpers import pil_to_pygame, tabler_icons
    for i in range(4):
        box_y = items_y + i * (box_size + box_spacing)
        box_rect = pygame.Rect(items_x, box_y, box_size, box_size)
        item = TriviaDatabase.BONUS_ITEMS[i]
        quantity = game.item_quantities[i]

        if i == game.selected_item_index:
            glow_surf = pygame.Surface((box_size + 10, box_size + 10), pygame.SRCALPHA)
            pygame.draw.rect(glow_surf, (*NEON_BLUE[:3], 80), glow_surf.get_rect(), border_radius=5)
            game.screen.blit(glow_surf, (items_x - 5, box_y - 5))
            border_color = NEON_BLUE
            box_color = (20, 40, 60) if quantity > 0 else (15, 15, 20)
        else:
            border_color = MODERN_DARK_GRAY if quantity > 0 else (50, 50, 50)
            box_color = (30, 30, 40) if quantity > 0 else DARKER_BG

        pygame.draw.rect(game.screen, box_color, box_rect, border_radius=5)
        pygame.draw.rect(game.screen, border_color, box_rect, 2, border_radius=5)

        icon_color = MODERN_WHITE if quantity > 0 else (80, 80, 80)
        icon_drawn = False
        try:
            target_item_size = int(22)  # Fit in 45x45 box
            color_str = '#%02x%02x%02x' % icon_color if isinstance(icon_color, tuple) else icon_color
            pil_icon = tabler_icons.load(item.icon_enum, size=target_item_size, color=color_str)
            if pil_icon:
                icon_surf = pil_to_pygame(pil_icon)
                icon_surf = pygame.transform.smoothscale(icon_surf, (target_item_size, target_item_size))
                icon_rect = icon_surf.get_rect()
                icon_rect.center = box_rect.center
                game.screen.blit(icon_surf, icon_rect)
                icon_drawn = True
        except Exception:
            # No fallback - fail cleanly
            pass

        if quantity > 0:
            counter_size = 18
            counter_rect = pygame.Rect(
                box_rect.right - counter_size - 2,
                box_rect.bottom - counter_size - 2,
                counter_size,
                counter_size
            )
            pygame.draw.circle(game.screen, ACCENT_CYAN if i == game.selected_item_index else MODERN_DARK_GRAY,
                               counter_rect.center, counter_size // 2)
            qty_text = game.small_font.render(str(quantity), True, MODERN_WHITE)
            qty_rect = qty_text.get_rect(center=counter_rect.center)
            game.screen.blit(qty_text, qty_rect)

    # Control hints
    hint_text = game.small_font.render("UP/DOWN", True, MODERN_GRAY)
    hint_rect = hint_text.get_rect(center=(items_x + box_size//2, items_y + 4 * (box_size + box_spacing) + 10))
    game.screen.blit(hint_text, hint_rect)

    use_text = game.small_font.render("BACKSPACE", True, MODERN_GRAY)
    use_rect = use_text.get_rect(center=(items_x + box_size//2, items_y + 4 * (box_size + box_spacing) + 25))
    game.screen.blit(use_text, use_rect)

    # Bottom controls
    controls_text = game.small_font.render("ESC: Pause | Left/Right: Switch | ENTER: EMP", True, MODERN_GRAY)
    controls_rect = controls_text.get_rect(bottomright=(current_width - 20, game.current_height - 20))
    game.screen.blit(controls_text, controls_rect)
