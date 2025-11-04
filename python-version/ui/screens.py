"""Screen rendering for P-Type (backgrounds, menus, popups)."""
import math
import pygame

from pytablericons.tabler_icons import OutlineIcon

from constants import (
    DARK_BG,
    DARKER_BG,
    ACCENT_BLUE,
    ACCENT_CYAN,
    ACCENT_GREEN,
    ACCENT_ORANGE,
    ACCENT_PURPLE,
    ACCENT_RED,
    ACCENT_YELLOW,
    MODERN_WHITE,
    MODERN_GRAY,
    MODERN_LIGHT,
    MODERN_DARK_GRAY,
    NEON_GREEN,
    NEON_PINK,
    SCREEN_WIDTH,
    VERSION,
    VERSION_NAME,
    BASE_WPM,
    MAX_WPM,
    MAX_LEVELS,
)
from core.achievements import ACHIEVEMENTS
from core.types import GameMode
from ui.hud import draw_game_ui

from ui.icon_helpers import pil_to_pygame, tabler_icons


from ui.widgets import ModernButton, ModernDropdown








def draw_modern_background(game):
    """Draw modern gradient background (responsive to current height)"""
    # Create gradient effect using current height
    for i in range(game.current_height):
        ratio = i / game.current_height
        r = int(DARK_BG[0] * (1 - ratio) + DARKER_BG[0] * ratio)
        g = int(DARK_BG[1] * (1 - ratio) + DARKER_BG[1] * ratio)
        b = int(DARK_BG[2] * (1 - ratio) + DARKER_BG[2] * ratio)
        pygame.draw.line(game.screen, (r, g, b), (0, i), (SCREEN_WIDTH, i))


def draw_game(game):
    """Render active gameplay including entities and HUD."""
    for star in game.stars:
        star.draw(game.screen)
    game.player_ship.draw(game.screen)
    for enemy in game.enemies:
        enemy.draw(game.screen, game.font)
    for explosion in game.explosions:
        explosion.draw(game.screen)
    for laser in game.laser_beams:
        laser.draw(game.screen)
    for missile in game.missiles:
        missile.draw(game.screen)
    for effect in game.typing_effects:
        effect.draw(game.screen, game.font)
    draw_game_ui(game)


def draw_stats_popup(game):
    """Draw stats popup optimized for narrow window"""
    # Semi-transparent overlay
    overlay = pygame.Surface((SCREEN_WIDTH, game.current_height))
    overlay.set_alpha(200)
    overlay.fill(DARKER_BG)
    game.screen.blit(overlay, (0, 0))

    # Optimized panel for narrow window
    panel_width = min(550, SCREEN_WIDTH - 40)  # Leave margin
    # Make panel taller to fit all 19 achievements (4 rows of 5)
    panel_height = min(850, game.current_height - 20)  # Much taller panel
    panel_rect = pygame.Rect(SCREEN_WIDTH//2 - panel_width//2, 10, panel_width, panel_height)
    pygame.draw.rect(game.screen, DARK_BG, panel_rect, border_radius=15)
    pygame.draw.rect(game.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)

    # Title (smaller for narrow window)
    stats_title = game.medium_font.render("Player Statistics", True, ACCENT_YELLOW)
    stats_rect = stats_title.get_rect(center=(SCREEN_WIDTH//2, 80))
    game.screen.blit(stats_title, stats_rect)

    y_offset = 110

    if game.current_profile:
        # Player info section with change button
        player_panel = pygame.Rect(panel_rect.x + 20, y_offset, panel_rect.width - 40, 45)
        pygame.draw.rect(game.screen, MODERN_DARK_GRAY, player_panel, border_radius=8)

        # Player name
        profile_title = game.font.render(f"Player: {game.current_profile.name}", True, ACCENT_CYAN)
        game.screen.blit(profile_title, (player_panel.x + 15, player_panel.y + 12))

        # Change player button
        change_btn = pygame.Rect(player_panel.right - 100, player_panel.y + 7, 90, 30)
        pygame.draw.rect(game.screen, ACCENT_BLUE, change_btn, border_radius=6)
        change_text = game.small_font.render("Change", True, MODERN_WHITE)
        change_rect = change_text.get_rect(center=change_btn.center)
        game.screen.blit(change_text, change_rect)
        game.stats_change_player_btn = change_btn

        y_offset += 55

        # Compact stats display - single column for narrow window
        # Get best stats from profile
        best_score = getattr(game.current_profile, 'best_score', 0)
        highest_level = getattr(game.current_profile, 'highest_level', 0)
        best_wpm = getattr(game.current_profile, 'best_wpm', 0.0)
        languages_played = getattr(game.current_profile, 'languages_played', set())
        bosses_defeated = getattr(game.current_profile, 'bosses_defeated', 0)

        # Get trivia stats
        trivia_correct = getattr(game.current_profile, 'trivia_questions_correct', 0)
        trivia_answered = getattr(game.current_profile, 'trivia_questions_answered', 0)
        trivia_accuracy = (trivia_correct / trivia_answered * 100) if trivia_answered > 0 else 0
        trivia_streak = getattr(game.current_profile, 'trivia_streak_best', 0)
        bonus_used = getattr(game.current_profile, 'bonus_items_used', 0)

        stats_data = [
            ("Games:", f"{game.current_profile.games_played}", MODERN_WHITE),
            ("Best Score:", f"{best_score:,}", NEON_GREEN),
            ("Level:", f"{highest_level}", ACCENT_CYAN),
            ("Best WPM:", f"{best_wpm:.1f}", ACCENT_ORANGE),
            ("Languages:", f"{len(languages_played)}/7", ACCENT_BLUE)
        ]

        # Add trivia stats only if player has answered questions
        if trivia_answered > 0:
            stats_data.extend([
                ("Trivia Score:", f"{trivia_correct}/{trivia_answered}", ACCENT_PURPLE),
                ("Trivia Accuracy:", f"{trivia_accuracy:.0f}%", NEON_PINK),
                ("Best Streak:", f"{trivia_streak}", ACCENT_YELLOW),
                ("Items Used:", f"{bonus_used}", ACCENT_CYAN)
            ])

        # Single column with aligned values
        max_label_width = max(game.small_font.size(label)[0] for label, _, _ in stats_data)
        for label, value, color in stats_data:
            label_surf = game.small_font.render(label, True, MODERN_GRAY)
            value_surf = game.small_font.render(value, True, color)
            game.screen.blit(label_surf, (panel_rect.x + 30, y_offset))
            game.screen.blit(value_surf, (panel_rect.x + 40 + max_label_width, y_offset))
            y_offset += 22

        y_offset += 20

        # Achievements Section - Better grid layout
        ach_title = game.font.render("Achievements", True, ACCENT_GREEN)
        game.screen.blit(ach_title, (panel_rect.x + 20, y_offset))
        y_offset += 35

        # Achievement grid - adjusted to fit all 19 achievements
        total_achievements = len(ACHIEVEMENTS)
        achievements_per_row = 5  # More per row to fit all
        ach_size = 55  # Slightly larger icons
        ach_spacing = 10  # Better spacing

        # Calculate centering for achievement grid
        grid_width = achievements_per_row * (ach_size + ach_spacing) - ach_spacing
        grid_x_start = panel_rect.x + (panel_rect.width - grid_width) // 2

        # Get mouse position for hover detection
        mouse_x, mouse_y = pygame.mouse.get_pos()
        hovered_achievement = None

        for i, (ach_id, achievement) in enumerate(ACHIEVEMENTS.items()):
            row = i // achievements_per_row
            col = i % achievements_per_row
            x_pos = grid_x_start + col * (ach_size + ach_spacing)
            y_pos = y_offset + row * (ach_size + ach_spacing + 10)
            unlocked = ach_id in game.current_profile.achievements
            ach_rect = pygame.Rect(x_pos, y_pos, ach_size, ach_size)
            if ach_rect.collidepoint(mouse_x, mouse_y):
                hovered_achievement = (achievement, ach_rect)
            if unlocked:
                pygame.draw.rect(game.screen, MODERN_DARK_GRAY, ach_rect, border_radius=10)
                pygame.draw.rect(game.screen, ACCENT_YELLOW, ach_rect, 2, border_radius=10)
                # Map each achievement to specific icon enum and color
                icon_map = {
                    "first_word": (OutlineIcon.ABC, ACCENT_GREEN),
                    "speed_demon": (OutlineIcon.ROCKET, ACCENT_ORANGE),
                    "accuracy_master": (OutlineIcon.TARGET, ACCENT_GREEN),
                    "boss_slayer": (OutlineIcon.SKULL, ACCENT_RED),
                    "level_10": (OutlineIcon.MEDAL, ACCENT_CYAN),
                    "level_20": (OutlineIcon.MEDAL_2, ACCENT_CYAN),
                    "perfect_game": (OutlineIcon.CIRCLE_CHECK, NEON_GREEN),
                    "marathon": (OutlineIcon.CLOCK, ACCENT_BLUE),
                    "polyglot": (OutlineIcon.LANGUAGE, ACCENT_PURPLE),
                    "high_scorer": (OutlineIcon.COIN, ACCENT_YELLOW),
                    "veteran": (OutlineIcon.MILITARY_AWARD, ACCENT_ORANGE),
                    "word_master": (OutlineIcon.WRITING, ACCENT_PURPLE),
                    "trivia_novice": (OutlineIcon.BULB, NEON_PINK),
                    "trivia_expert": (OutlineIcon.BULB_OFF, NEON_PINK),
                    "trivia_master": (OutlineIcon.BRAIN, NEON_PINK),
                    "trivia_genius": (OutlineIcon.SPARKLES, NEON_PINK),
                    "perfect_trivia": (OutlineIcon.AWARD, ACCENT_YELLOW),
                    "bonus_collector": (OutlineIcon.PACKAGE, ACCENT_CYAN),
                    "bonus_master": (OutlineIcon.GIFT, ACCENT_CYAN)
                }
                icon_enum, icon_color = icon_map.get(ach_id, (OutlineIcon.TROPHY, ACCENT_YELLOW))
                target_item_size = int(28)  # Fit in 55x55 box
                pil_icon = tabler_icons.load(icon_enum, size=target_item_size, color='#%02x%02x%02x' % icon_color)
                icon_surf = pil_to_pygame(pil_icon)
                icon_surf = pygame.transform.smoothscale(icon_surf, (target_item_size, target_item_size))
                icon_rect = icon_surf.get_rect(center=ach_rect.center)
                game.screen.blit(icon_surf, icon_rect)
            else:
                # Locked achievement - show lock icon
                pygame.draw.rect(game.screen, (45, 45, 50), ach_rect, border_radius=10)
                pygame.draw.rect(game.screen, (80, 80, 85), ach_rect, 2, border_radius=10)

                # Draw lock icon for locked achievements
                target_item_size = int(24)  # Smaller size to fit in 55x55 box
                lock_color = (120, 120, 125)  # Grayish color for locked
                color_str = '#%02x%02x%02x' % lock_color
                pil_icon = tabler_icons.load(OutlineIcon.LOCK, size=target_item_size, color=color_str)
                icon_surf = pil_to_pygame(pil_icon)
                icon_surf = pygame.transform.smoothscale(icon_surf, (target_item_size, target_item_size))
                icon_rect = icon_surf.get_rect(center=ach_rect.center)
                game.screen.blit(icon_surf, icon_rect)

        y_offset += ((len(ACHIEVEMENTS) - 1) // achievements_per_row + 1) * (ach_size + ach_spacing + 10) + 20

        # Draw tooltip for hovered achievement
        if hovered_achievement:
            ach, ach_rect = hovered_achievement

            # Create tooltip surface
            tooltip_padding = 10
            name_surf = game.font.render(ach.name, True, ACCENT_YELLOW)
            desc_surf = game.small_font.render(ach.description, True, MODERN_WHITE)

            tooltip_width = max(name_surf.get_width(), desc_surf.get_width()) + tooltip_padding * 2
            tooltip_height = name_surf.get_height() + desc_surf.get_height() + tooltip_padding * 2 + 5

            # Position tooltip above the achievement
            tooltip_x = ach_rect.centerx - tooltip_width // 2
            tooltip_y = ach_rect.y - tooltip_height - 5

            # Keep tooltip on screen
            if tooltip_x < panel_rect.x:
                tooltip_x = panel_rect.x
            elif tooltip_x + tooltip_width > panel_rect.right:
                tooltip_x = panel_rect.right - tooltip_width

            if tooltip_y < panel_rect.y:
                tooltip_y = ach_rect.bottom + 5

            # Draw tooltip background
            tooltip_rect = pygame.Rect(tooltip_x, tooltip_y, tooltip_width, tooltip_height)
            pygame.draw.rect(game.screen, DARKER_BG, tooltip_rect, border_radius=8)
            pygame.draw.rect(game.screen, ACCENT_YELLOW, tooltip_rect, 2, border_radius=8)

            # Draw tooltip text
            game.screen.blit(name_surf, (tooltip_x + tooltip_padding, tooltip_y + tooltip_padding))
            game.screen.blit(desc_surf, (tooltip_x + tooltip_padding, 
                                        tooltip_y + tooltip_padding + name_surf.get_height() + 5))

    # High Scores Section (if space available)
    if y_offset < panel_rect.bottom - 150:  # More space for close button
        hs_title = game.font.render("Top Scores", True, ACCENT_YELLOW)
        game.screen.blit(hs_title, (panel_rect.x + 20, y_offset))
        y_offset += 25

        # Get top 5 scores for display
        all_scores = []
        for mode in [GameMode.NORMAL, GameMode.PROGRAMMING]:
            scores = game.settings.get_high_scores(mode, limit=5)
            for score in scores:
                all_scores.append((score, mode))

        # Sort by score and take top 5
        all_scores.sort(key=lambda x: x[0].score, reverse=True)
        all_scores = all_scores[:5]

        # Always show 5 slots
        for i in range(5):
            rank = f"{i+1}." 
            if i < len(all_scores):
                entry, mode = all_scores[i]
                score_text = game.small_font.render(
                    f"{rank} {entry.player_name[:12]}: {entry.score:,}",
                    True, MODERN_LIGHT)
            else:
                # Empty slot
                score_text = game.small_font.render(
                    f"{rank} ----------: 0",
                    True, (80, 80, 80))
            game.screen.blit(score_text, (panel_rect.x + 30, y_offset))
            y_offset += 20

    # Achievement progress at bottom
    if game.current_profile:
        progress_y = panel_rect.bottom - 50
        # Progress bar
        bar_rect = pygame.Rect(panel_rect.x + 20, progress_y, panel_rect.width - 40, 20)
        pygame.draw.rect(game.screen, MODERN_DARK_GRAY, bar_rect, border_radius=10)

        # Fill based on achievement percentage
        if len(ACHIEVEMENTS) > 0:
            progress = len(game.current_profile.achievements) / len(ACHIEVEMENTS)
            fill_width = int(bar_rect.width * progress)
            if fill_width > 0:
                fill_rect = pygame.Rect(bar_rect.x, bar_rect.y, fill_width, bar_rect.height)
                pygame.draw.rect(game.screen, ACCENT_GREEN, fill_rect, border_radius=10)

        # Text overlay
        progress_text = game.small_font.render(
            f"{len(game.current_profile.achievements)}/{len(ACHIEVEMENTS)} Achievements",
            True, MODERN_WHITE
        )
        text_rect = progress_text.get_rect(center=bar_rect.center)
        game.screen.blit(progress_text, text_rect)

    # Close button - position below the panel to avoid overlap
    game.close_popout_button.rect.center = (SCREEN_WIDTH//2, panel_rect.bottom + 30)
    game.close_popout_button.draw(game.screen)

def draw_settings_popup(game):
    """Draw settings popup with better spacing"""
    # Semi-transparent overlay
    overlay = pygame.Surface((SCREEN_WIDTH, game.current_height))
    overlay.set_alpha(200)
    overlay.fill(DARKER_BG)
    game.screen.blit(overlay, (0, 0))

    # Settings panel
    panel_rect = pygame.Rect(SCREEN_WIDTH//2 - 250, game.current_height//2 - 250, 500, 500)
    pygame.draw.rect(game.screen, DARK_BG, panel_rect, border_radius=15)
    pygame.draw.rect(game.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)

    # Title
    settings_title = game.large_font.render("Settings", True, ACCENT_YELLOW)
    settings_rect = settings_title.get_rect(center=(SCREEN_WIDTH//2, panel_rect.y + 50))
    game.screen.blit(settings_title, settings_rect)

    # Audio Settings Section
    audio_y = panel_rect.y + 100
    audio_title = game.medium_font.render("Audio Settings", True, ACCENT_CYAN)
    audio_rect = audio_title.get_rect(center=(SCREEN_WIDTH//2, audio_y))
    game.screen.blit(audio_title, audio_rect)

    # Music volume label and slider
    music_y = audio_y + 50
    music_label = game.font.render("Music Volume", True, MODERN_WHITE)
    game.screen.blit(music_label, (panel_rect.x + 50, music_y))

    # Position music slider properly
    game.music_slider.rect.x = panel_rect.x + 50
    game.music_slider.rect.y = music_y + 30
    game.music_slider.draw(game.screen, game.font)

    # Sound volume label and slider
    sound_y = music_y + 100
    sound_label = game.font.render("Sound Effects", True, MODERN_WHITE)
    game.screen.blit(sound_label, (panel_rect.x + 50, sound_y))

    # Position sound slider properly
    game.sound_slider.rect.x = panel_rect.x + 50
    game.sound_slider.rect.y = sound_y + 30
    game.sound_slider.draw(game.screen, game.font)

    # Close button at bottom
    game.close_popout_button.rect.center = (SCREEN_WIDTH//2, panel_rect.bottom - 50)
    game.close_popout_button.draw(game.screen)

def draw_name_entry_popup(game):
    """Draw player name entry popup"""
    # Semi-transparent overlay
    overlay = pygame.Surface((SCREEN_WIDTH, game.current_height))
    overlay.set_alpha(200)
    overlay.fill(DARKER_BG)
    game.screen.blit(overlay, (0, 0))

    # Name entry panel
    panel_w = min(500, int(SCREEN_WIDTH * 0.8))
    panel_h = 300
    panel_rect = pygame.Rect(game.ui_center_x - panel_w//2, game.current_height//2 - panel_h//2, panel_w, panel_h)
    pygame.draw.rect(game.screen, DARK_BG, panel_rect, border_radius=15)
    pygame.draw.rect(game.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)

    # Title
    title = game.large_font.render("Enter Your Name", True, ACCENT_YELLOW)
    title_rect = title.get_rect(center=(game.ui_center_x, panel_rect.y + 60))
    game.screen.blit(title, title_rect)

    # Name input field
    input_rect = pygame.Rect(game.ui_center_x - 200, panel_rect.y + 120, 400, 50)
    pygame.draw.rect(game.screen, MODERN_DARK_GRAY, input_rect, border_radius=8)
    pygame.draw.rect(game.screen, ACCENT_CYAN if game.entering_name else MODERN_GRAY, input_rect, 2, border_radius=8)

    # Display entered name with cursor
    name_display = game.player_name_input + ("_" if pygame.time.get_ticks() % 1000 < 500 else "")
    name_text = game.medium_font.render(name_display, True, MODERN_WHITE)
    name_rect = name_text.get_rect(center=input_rect.center)
    game.screen.blit(name_text, name_rect)

    # Instructions
    inst_text = game.font.render("Press ENTER to confirm or ESC to skip", True, MODERN_GRAY)
    inst_rect = inst_text.get_rect(center=(game.ui_center_x, panel_rect.y + 220))
    game.screen.blit(inst_text, inst_rect)

def draw_save_slots_popup(game):
    """Draw save slots popup for saving/loading"""
    # Semi-transparent overlay
    overlay = pygame.Surface((SCREEN_WIDTH, game.current_height))
    overlay.set_alpha(200)
    overlay.fill(DARKER_BG)
    game.screen.blit(overlay, (0, 0))

    # Save panel
    panel_w = min(600, int(SCREEN_WIDTH * 0.9))
    panel_h = 500
    panel_rect = pygame.Rect(game.ui_center_x - panel_w//2, game.current_height//2 - panel_h//2, panel_w, panel_h)
    pygame.draw.rect(game.screen, DARK_BG, panel_rect, border_radius=15)
    pygame.draw.rect(game.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)

    # Title
    title_text = "Save Game" if game.saving_game else "Load Game"
    title = game.large_font.render(title_text, True, ACCENT_YELLOW)
    title_rect = title.get_rect(center=(game.ui_center_x, panel_rect.y + 40))
    game.screen.blit(title, title_rect)

    # Draw save slots
    slot_y = panel_rect.y + 100
    for i in range(3):
        slot_rect = pygame.Rect(game.ui_center_x - 250, slot_y, 500, 80)

        # Check if slot has save data
        save_data = game.settings.save_slots[i]
        if save_data:
            # Slot has data
            pygame.draw.rect(game.screen, MODERN_DARK_GRAY, slot_rect, border_radius=10)
            pygame.draw.rect(game.screen, ACCENT_GREEN, slot_rect, 2, border_radius=10)

            # Display save info
            player_name = save_data.get('player_name', 'Unknown')
            level = save_data.get('level', 1)
            score = save_data.get('score', 0)
            mode = save_data.get('game_mode', 'normal')

            slot_text = game.font.render(f"Slot {i+1}: {player_name}", True, MODERN_WHITE)
            game.screen.blit(slot_text, (slot_rect.x + 20, slot_rect.y + 10))

            info_text = game.small_font.render(
                f"Level {level} | Score: {score:,} | Mode: {mode.title()}", 
                True, MODERN_LIGHT
            )
            game.screen.blit(info_text, (slot_rect.x + 20, slot_rect.y + 35))

            # Save time
            if 'save_time' in save_data:
                time_text = game.small_font.render(
                    f"Saved: {save_data['save_time'][:19]}",
                    True, MODERN_GRAY
                )
                game.screen.blit(time_text, (slot_rect.x + 20, slot_rect.y + 55))
        else:
            # Empty slot
            pygame.draw.rect(game.screen, MODERN_DARK_GRAY, slot_rect, border_radius=10)
            pygame.draw.rect(game.screen, MODERN_GRAY, slot_rect, 1, border_radius=10)

            empty_text = game.font.render(f"Slot {i+1}: Empty", True, MODERN_GRAY)
            game.screen.blit(empty_text, (slot_rect.x + 20, slot_rect.y + 30))

        slot_y += 100

    # Close button
    close_btn = pygame.Rect(game.ui_center_x - 60, panel_rect.bottom - 70, 120, 40)
    pygame.draw.rect(game.screen, ACCENT_RED, close_btn, border_radius=8)
    close_text = game.font.render("Cancel", True, MODERN_WHITE)
    close_rect = close_text.get_rect(center=close_btn.center)
    game.screen.blit(close_text, close_rect)

def draw_profile_select(game):
    """Draw profile selection as a centered popup over the main menu"""
    # Draw the main menu in the background
    game.draw_menu_background()

    # Semi-transparent overlay
    overlay = pygame.Surface((SCREEN_WIDTH, game.current_height))
    overlay.set_alpha(200)
    overlay.fill(DARKER_BG)
    game.screen.blit(overlay, (0, 0))

    # Ensure UI elements are configured
    if (not hasattr(game, 'profile_dropdown') or
            not hasattr(game, 'profile_panel_rect') or
            game.update_profile_dropdown):
        game.ui_manager.setup_profile_select_ui()
        game.update_profile_dropdown = False

    panel_rect = getattr(
        game,
        'profile_panel_rect',
        pygame.Rect(SCREEN_WIDTH//2 - 240, game.current_height//2 - 180, 480, 360)
    )

    pygame.draw.rect(game.screen, DARK_BG, panel_rect, border_radius=15)
    pygame.draw.rect(game.screen, ACCENT_CYAN, panel_rect, 3, border_radius=15)

    title = game.medium_font.render("SELECT PLAYER", True, ACCENT_YELLOW)
    title_rect = title.get_rect(center=(panel_rect.centerx, panel_rect.y + 40))
    game.screen.blit(title, title_rect)

    # If creating a profile, show input dialog
    if game.creating_profile:
        # Dark overlay
        overlay = pygame.Surface((SCREEN_WIDTH, game.current_height))
        overlay.set_alpha(180)
        overlay.fill(DARKER_BG)
        game.screen.blit(overlay, (0, 0))

        # Input dialog
        dialog_rect = pygame.Rect(SCREEN_WIDTH//2 - 200, game.current_height//2 - 100, 400, 200)
        pygame.draw.rect(game.screen, DARK_BG, dialog_rect, border_radius=10)
        pygame.draw.rect(game.screen, ACCENT_BLUE, dialog_rect, 3, border_radius=10)

        # Dialog title
        dialog_title = game.medium_font.render("Enter Profile Name", True, ACCENT_YELLOW)
        title_rect = dialog_title.get_rect(center=(SCREEN_WIDTH//2, dialog_rect.y + 40))
        game.screen.blit(dialog_title, title_rect)

        # Input field
        input_rect = pygame.Rect(dialog_rect.x + 50, dialog_rect.y + 80, 300, 40)
        pygame.draw.rect(game.screen, MODERN_DARK_GRAY, input_rect, border_radius=5)
        pygame.draw.rect(game.screen, ACCENT_CYAN, input_rect, 2, border_radius=5)

        # Input text
        if game.profile_name_input:
            input_text = game.font.render(game.profile_name_input, True, MODERN_WHITE)
            game.screen.blit(input_text, (input_rect.x + 10, input_rect.y + 10))

        # Cursor
        cursor_x = input_rect.x + 10
        if game.profile_name_input:
            text_width = game.font.size(game.profile_name_input)[0]
            cursor_x += text_width
        if pygame.time.get_ticks() % 1000 < 500:  # Blinking cursor
            pygame.draw.line(game.screen, MODERN_WHITE, 
                           (cursor_x, input_rect.y + 10), 
                           (cursor_x, input_rect.y + 30), 2)

        # Instructions
        inst_text = game.small_font.render("Press ENTER to confirm or ESC to cancel", True, MODERN_GRAY)
        inst_rect = inst_text.get_rect(center=(SCREEN_WIDTH//2, dialog_rect.bottom - 30))
        game.screen.blit(inst_text, inst_rect)

        return  # Don't draw profile slots when creating

    dropdown_rect = game.profile_dropdown.rect

    if hasattr(game, 'selected_profile_name') and game.selected_profile_name not in (None, "(No profiles)"):
        current_label = game.small_font.render(f"Current: {game.selected_profile_name}", True, ACCENT_GREEN)
        label_y = max(panel_rect.y + 120, dropdown_rect.y - 30)
        label_rect = current_label.get_rect(center=(panel_rect.centerx, label_y))
        game.screen.blit(current_label, label_rect)
    elif getattr(game.select_profile_button, 'is_disabled', False):
        empty_label = game.small_font.render("No profiles found. Create a new one to begin.", True, ACCENT_RED)
        empty_rect = empty_label.get_rect(center=(panel_rect.centerx, dropdown_rect.y - 30))
        game.screen.blit(empty_label, empty_rect)

    if hasattr(game, 'profile_help_text') and hasattr(game, 'profile_help_label_pos'):
        help_text = game.small_font.render(game.profile_help_text, True, MODERN_GRAY)
        help_rect = help_text.get_rect(center=game.profile_help_label_pos)
        game.screen.blit(help_text, help_rect)

    game.select_profile_button.draw(game.screen)
    game.new_profile_button.draw(game.screen)

    game.profile_dropdown.draw(game.screen)

def draw_about_popup(game):
    """Draw about popup with version and credits"""
    # Semi-transparent overlay
    overlay = pygame.Surface((SCREEN_WIDTH, game.current_height))
    overlay.set_alpha(200)
    overlay.fill(DARKER_BG)
    game.screen.blit(overlay, (0, 0))

    # About panel - adjusted size for version info
    panel_w = 420
    panel_h = 280
    panel_rect = pygame.Rect(SCREEN_WIDTH//2 - panel_w//2, game.current_height//2 - panel_h//2, panel_w, panel_h)
    pygame.draw.rect(game.screen, DARK_BG, panel_rect, border_radius=15)
    pygame.draw.rect(game.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)

    # Title
    about_title = game.large_font.render("P-Type", True, ACCENT_YELLOW)
    about_rect = about_title.get_rect(center=(SCREEN_WIDTH//2, panel_rect.y + 50))
    game.screen.blit(about_title, about_rect)

    # Version info
    version_text = game.font.render(f"Version {VERSION}", True, ACCENT_CYAN)
    version_rect = version_text.get_rect(center=(SCREEN_WIDTH//2, panel_rect.y + 85))
    game.screen.blit(version_text, version_rect)

    # Version name
    version_name_text = game.small_font.render(f"{VERSION_NAME}", True, MODERN_GRAY)
    version_name_rect = version_name_text.get_rect(center=(SCREEN_WIDTH//2, panel_rect.y + 105))
    game.screen.blit(version_name_text, version_name_rect)

    # Credit text
    credit_text = game.medium_font.render("Created by Randy Northrup", True, MODERN_WHITE)
    credit_rect = credit_text.get_rect(center=(SCREEN_WIDTH//2, panel_rect.centery + 10))
    game.screen.blit(credit_text, credit_rect)

    year_text = game.font.render("© 2025", True, ACCENT_CYAN)
    year_rect = year_text.get_rect(center=(SCREEN_WIDTH//2, panel_rect.centery + 40))
    game.screen.blit(year_text, year_rect)

    # Close button at the bottom of panel
    game.close_popout_button.rect.center = (SCREEN_WIDTH//2, panel_rect.bottom - 40)
    game.close_popout_button.draw(game.screen)

def draw_menu_background(game):
    """Draw the menu background with title"""
    # Draw stars
    for star in game.stars:
        star.draw(game.screen)

    # Draw the PNG logo image (no fallback)
    if hasattr(game, 'logo_image') and game.logo_image:
        # Draw the logo image centered
        logo_rect = game.logo_image.get_rect(center=(game.ui_center_x, game.ui_title_y))
        game.screen.blit(game.logo_image, logo_rect)

        # Add subtle glow effect around the logo
        pulse = abs(math.sin(pygame.time.get_ticks() * 0.001)) * 0.3 + 0.7
        for i in range(3):
            glow_surf = pygame.Surface((logo_rect.width + 20 + i*10, logo_rect.height + 20 + i*10), pygame.SRCALPHA)
            glow_surf.set_alpha(int(30 * pulse * (1 - i/3)))
            pygame.draw.rect(glow_surf, (100, 150, 255, int(30 * pulse * (1 - i/3))), glow_surf.get_rect(), border_radius=15)
            glow_rect = glow_surf.get_rect(center=(game.ui_center_x, game.ui_title_y))
            game.screen.blit(glow_surf, glow_rect)

        # Re-draw the logo on top of the glow
        game.screen.blit(game.logo_image, logo_rect)

    # Animated subtitle
    subtitle = "The Typing Game"
    subtitle_surface = game.medium_font.render(subtitle, True, ACCENT_CYAN)
    subtitle_rect = subtitle_surface.get_rect(center=(game.ui_center_x, game.ui_subtitle_y))
    game.screen.blit(subtitle_surface, subtitle_rect)

def draw_menu(game):
    """Draw modern main menu"""
    game.draw_menu_background()

    # Main action buttons with better styling
    # Continue button (always visible, may be disabled)
    game.continue_button.draw(game.screen)

    # Draw New Game button
    game.new_game_button.draw(game.screen)

    # Mode selection with improved label
    mode_panel = pygame.Rect(game.ui_center_x - 140, game.dropdown_label_y - 5, 280, 30)
    pygame.draw.rect(game.screen, DARKER_BG, mode_panel, border_radius=15)
    mode_label = game.font.render("Game Mode", True, ACCENT_YELLOW)
    mode_rect = mode_label.get_rect(center=mode_panel.center)
    game.screen.blit(mode_label, mode_rect)

    # Bottom menu buttons with icons and better layout (draw before dropdown)
    game.stats_button.draw(game.screen)
    game.settings_button.draw(game.screen)
    game.about_button.draw(game.screen)

    # Exit game button
    game.exit_game_button.draw(game.screen)

    # Help panel at bottom - draw before dropdown so dropdown can overlap
    # Fixed position from bottom
    help_y = game.current_height - 160  # Moved up slightly for more room
    help_panel = pygame.Rect(game.ui_center_x - 260, help_y, 520, 105)

    # Draw the help panel
    pygame.draw.rect(game.screen, DARKER_BG, help_panel, border_radius=10)
    pygame.draw.rect(game.screen, MODERN_DARK_GRAY, help_panel, 1, border_radius=10)

    # Help title
    help_title = game.font.render("How to Play", True, ACCENT_CYAN)
    title_rect = help_title.get_rect(center=(help_panel.centerx, help_panel.y + 18))
    game.screen.blit(help_title, title_rect)

    # Instructions (updated with new features)
    instructions = [
        "Type falling words before they reach bottom | TAB to switch targets",
        "Defeat bosses every level | Answer trivia every 2 bosses for items",
        "ENTER: EMP weapon | UP/DOWN: Select item | BACKSPACE: Use item",
        "Collect & use 4 unique bonus items from trivia rewards"
    ]

    y_off = help_panel.y + 35
    for instruction in instructions:
        inst_text = game.small_font.render(instruction, True, MODERN_LIGHT)
        inst_rect = inst_text.get_rect(center=(help_panel.centerx, y_off))
        game.screen.blit(inst_text, inst_rect)
        y_off += 16

    # Footer info - position above help panel
    footer_text = game.small_font.render("ESC to pause during game", True, MODERN_GRAY)
    footer_rect = footer_text.get_rect(center=(game.ui_center_x, game.current_height - 40))
    game.screen.blit(footer_text, footer_rect)

    # Draw mode dropdown ABSOLUTELY LAST so it appears on top of EVERYTHING
    game.mode_dropdown.draw(game.screen)

def draw_pause_menu(game):
    """Draw modern pause menu"""
    # Semi-transparent overlay
    overlay = pygame.Surface((SCREEN_WIDTH, game.current_height))
    overlay.set_alpha(200)
    overlay.fill(DARKER_BG)
    game.screen.blit(overlay, (0, 0))

    # Pause panel - make it taller to fit all buttons
    panel_h = 450
    panel_w = 350
    panel_y = game.current_height//2 - panel_h//2
    panel_rect = pygame.Rect(SCREEN_WIDTH//2 - panel_w//2, panel_y, panel_w, panel_h)
    pygame.draw.rect(game.screen, DARK_BG, panel_rect, border_radius=15)
    pygame.draw.rect(game.screen, ACCENT_BLUE, panel_rect, 3, border_radius=15)

    # Title
    pause_text = game.large_font.render("PAUSED", True, ACCENT_YELLOW)
    pause_rect = pause_text.get_rect(center=(SCREEN_WIDTH//2, panel_y + 40))
    game.screen.blit(pause_text, pause_rect)

    # Target WPM info
    current_wpm = BASE_WPM + ((MAX_WPM - BASE_WPM) * (game.level - 1) / (MAX_LEVELS - 1))
    info_text = game.small_font.render(f"Target: {int(current_wpm)} WPM", True, MODERN_GRAY)
    info_rect = info_text.get_rect(center=(SCREEN_WIDTH//2, panel_y + 70))
    game.screen.blit(info_text, info_rect)

    # Draw buttons only (they're already positioned correctly in setup_ui_elements)
    game.resume_button.draw(game.screen)
    game.save_game_button.draw(game.screen)
    game.pause_settings_button.draw(game.screen)
    game.quit_to_menu_button.draw(game.screen)
    game.quit_game_button.draw(game.screen)

    # Controls reminder at bottom
    controls_text = game.small_font.render("ESC: Resume | Left/Right: Switch Ships", True, MODERN_GRAY)
    controls_rect = controls_text.get_rect(center=(SCREEN_WIDTH//2, panel_rect.bottom - 20))
    game.screen.blit(controls_text, controls_rect)

def draw_trivia(game):
    """Draw trivia question screen"""
    if not game.current_trivia:
        return

    # Semi-transparent overlay
    overlay = pygame.Surface((SCREEN_WIDTH, game.current_height))
    overlay.set_alpha(200)
    overlay.fill(DARKER_BG)
    game.screen.blit(overlay, (0, 0))

    # Trivia panel
    panel_w = 500
    panel_h = 400
    panel_x = SCREEN_WIDTH//2 - panel_w//2
    panel_y = game.current_height//2 - panel_h//2
    panel_rect = pygame.Rect(panel_x, panel_y, panel_w, panel_h)
    pygame.draw.rect(game.screen, DARK_BG, panel_rect, border_radius=15)
    pygame.draw.rect(game.screen, ACCENT_YELLOW, panel_rect, 3, border_radius=15)

    # Title
    title_text = game.large_font.render("TRIVIA CHALLENGE!", True, ACCENT_YELLOW)
    title_rect = title_text.get_rect(center=(SCREEN_WIDTH//2, panel_y + 40))
    game.screen.blit(title_text, title_rect)

    # Category
    category_text = game.medium_font.render(f"Category: {game.current_trivia.category.title()}", True, ACCENT_CYAN)
    category_rect = category_text.get_rect(center=(SCREEN_WIDTH//2, panel_y + 70))
    game.screen.blit(category_text, category_rect)

    # Question
    question_lines = game.wrap_text(game.current_trivia.question, game.font, panel_w - 40)
    y_offset = panel_y + 100
    for line in question_lines:
        text_surface = game.font.render(line, True, MODERN_WHITE)
        text_rect = text_surface.get_rect(center=(SCREEN_WIDTH//2, y_offset))
        game.screen.blit(text_surface, text_rect)
        y_offset += 25

    # Options
    option_y = y_offset + 20
    option_keys = ['1', '2', '3']
    for i, option in enumerate(game.current_trivia.options):
        # Highlight selected option
        if i == game.selected_answer:
            if game.trivia_answered:
                # Show result
                if i == game.current_trivia.correct_answer:
                    color = NEON_GREEN
                    bg_color = (0, 100, 0)
                else:
                    color = ACCENT_RED
                    bg_color = (100, 0, 0)
            else:
                color = ACCENT_YELLOW
                bg_color = MODERN_DARK_GRAY

            # Draw selection background
            option_bg = pygame.Rect(panel_x + 20, option_y - 5, panel_w - 40, 30)
            pygame.draw.rect(game.screen, bg_color, option_bg, border_radius=5)
        else:
            if game.trivia_answered and i == game.current_trivia.correct_answer:
                # Highlight correct answer
                color = NEON_GREEN
                option_bg = pygame.Rect(panel_x + 20, option_y - 5, panel_w - 40, 30)
                pygame.draw.rect(game.screen, (0, 100, 0), option_bg, border_radius=5)
            else:
                color = MODERN_WHITE

        option_text = f"{option_keys[i]}. {option}"
        text_surface = game.font.render(option_text, True, color)
        text_rect = text_surface.get_rect(x=panel_x + 30, centery=option_y + 10)
        game.screen.blit(text_surface, text_rect)
        option_y += 40

    # Instructions
    if not game.trivia_answered:
        instruction = "Press 1-3 to select answer, SPACE to confirm"
        color = MODERN_GRAY
    else:
        if game.trivia_result:
            instruction = "Correct! Press SPACE to continue and claim reward"
            color = NEON_GREEN
        else:
            instruction = "Incorrect! Press SPACE to continue"
            color = ACCENT_RED

    instruction_text = game.small_font.render(instruction, True, color)
    instruction_rect = instruction_text.get_rect(center=(SCREEN_WIDTH//2, panel_rect.bottom - 30))
    game.screen.blit(instruction_text, instruction_rect)

def draw_game_over(game):
    """Draw modern game over screen"""
    # Get current window dimensions for responsive UI
    current_width = pygame.display.get_surface().get_width()

    # Overlay - responsive to current dimensions
    overlay = pygame.Surface((current_width, game.current_height))
    overlay.set_alpha(220)
    overlay.fill(DARKER_BG)
    game.screen.blit(overlay, (0, 0))

    # Game over panel - centered with current dimensions
    panel_rect = pygame.Rect(current_width//2 - 250, game.current_height//2 - 250, 500, 500)
    pygame.draw.rect(game.screen, DARK_BG, panel_rect, border_radius=15)
    pygame.draw.rect(game.screen, ACCENT_RED, panel_rect, 3, border_radius=15)

    # Title based on end condition - centered with current width
    if game.collision_detected:
        title_text = game.large_font.render("COLLISION!", True, ACCENT_RED)
    else:
        title_text = game.large_font.render("GAME OVER", True, ACCENT_RED)

    title_rect = title_text.get_rect(center=(current_width//2, game.current_height//2 - 180))
    game.screen.blit(title_text, title_rect)

    # Stats
    stats = [
        f"Final Score: {game.score:,}",
        f"Level Reached: {game.level}",
        f"Words Destroyed: {game.words_destroyed}",
        f"Mode: {game.game_mode.value.title()}"
    ]

    if game.game_mode == GameMode.PROGRAMMING:
        stats.append(f"Language: {game.programming_language.value}")

    if game.game_start_time > 0:
        game_time = (pygame.time.get_ticks() - game.game_start_time) / 1000
        minutes = int(game_time // 60)
        seconds = int(game_time % 60)
        stats.append(f"Time: {minutes:02d}:{seconds:02d}")

    y_start = game.current_height//2 - 100
    for i, stat in enumerate(stats):
        stat_text = game.font.render(stat, True, MODERN_WHITE)
        stat_rect = stat_text.get_rect(center=(current_width//2, y_start + i * 30))
        game.screen.blit(stat_text, stat_rect)

    # High score notification
    # Check if this is a new high score
    lang = game.programming_language.value if game.game_mode == GameMode.PROGRAMMING else None
    scores = game.settings.get_high_scores(game.game_mode, lang, limit=1)

    if scores and scores[0].score == game.score:
        new_record_text = game.medium_font.render("NEW HIGH SCORE!", True, ACCENT_YELLOW)
        record_rect = new_record_text.get_rect(center=(current_width//2, game.current_height//2 + 50))
        game.screen.blit(new_record_text, record_rect)

    # Buttons
    game.restart_button.draw(game.screen)
    game.menu_button.draw(game.screen)
