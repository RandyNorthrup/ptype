"""Game application module for P-Type."""

from __future__ import annotations

import random
import sys
from typing import Any, Dict

import pygame

from pytablericons.tabler_icons import TablerIcons

from audio.sound_manager import SoundManager
from constants import FPS, MIN_WINDOW_HEIGHT, SCREEN_WIDTH
from core.game_state import (
    get_game_state,
    load_game_state,
    reset_game_state,
    update_spawn_delay as compute_spawn_delay,
)
from core.initialization import (
    initialize_profile_system,
    load_background_music,
    load_logo_image,
    setup_fonts,
    setup_sound_system,
    setup_window_icon,
)
from data.trivia_db import TriviaDatabase
from core.profile_manager import ProfileManager
from core.settings import GameSettings
from core.types import GameMode, ProgrammingLanguage
from effects.effects import LaserBeam, ModernExplosion, Missile, TypingEffect
from graphics.stars import ModernStar
from ui import hud as ui_hud
from ui import screens as ui_screens
from ui.ui_manager import UIManager
from ui.window_manager import WindowManager
from entities.player import ModernPlayerShip
from gameplay.enemy_management import destroy_enemy as destroy_enemy_impl
from gameplay.game_updates import update_game
from gameplay.input_management import (
    activate_selected_bonus,
    cycle_item_selection,
    handle_input,
    handle_trivia_input,
    select_next_ship,
    select_previous_ship,
    trigger_emp,
)


class PTypeGame:
    """Main P-Type game class with modern design"""
    
    def __init__(self):
        # Initialize Pygame and create window
        pygame.init()
        try:
            pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
        except pygame.error:
            pass

        # Initialize TablerIcons
        self.tabler_icons = TablerIcons()

        # Set up window - keep it simple for better compatibility
        self._disable_maximize_later = False  # Don't try to disable maximize

        # Create a proper windowed application that starts at screen height
        try:
            display_info = pygame.display.Info()
            screen_height = display_info.current_h
            calculated_height = screen_height - 80
            default_height = max(MIN_WINDOW_HEIGHT, calculated_height)
        except Exception:
            default_height = max(MIN_WINDOW_HEIGHT, 1000)

        # Use fixed width - don't calculate proportionally
        window_width = SCREEN_WIDTH

        flags = pygame.RESIZABLE
        self.screen = pygame.display.set_mode((window_width, default_height), flags)
        pygame.display.set_caption("P-Type - The Typing Game")

        self.clock = pygame.time.Clock()
        self.current_height = default_height
        self.is_maximized = False
        self.normal_height = default_height

        # Initialize core systems using modular components
        setup_fonts(self)
        self.settings = GameSettings()
        initialize_profile_system(self)
        setup_sound_system(self)
        setup_window_icon(self)
        load_background_music(self)
        load_logo_image(self)

        # Initialize managers
        self.window_manager = WindowManager(self)
        self.ui_manager = UIManager(self)
        if not getattr(self, 'profile_manager', None):
            self.profile_manager = ProfileManager(self.settings)

        # Initialize audio system
        self.sound_manager = SoundManager(self.settings.sound_volume)

        # Core helpers required by gameplay modules
        self.random = random.Random()
        self.LaserBeam = LaserBeam
        self.TypingEffect = TypingEffect
        self.ModernExplosion = ModernExplosion
        self.Missile = Missile
        self.trivia_db = TriviaDatabase()

        # Preserve profile selected during initialization
        self.current_profile = getattr(self, 'current_profile', None)

        # Game state
        self.running = True
        # Start at profile selection if no auto-selected profile, otherwise go to menu
        self.game_mode = GameMode.PROFILE_SELECT
        self.programming_language = ProgrammingLanguage.PYTHON

        # Initialize selected mode to "Choose a Mode" by default
        self.selected_mode = "Choose a Mode"

        # If we have a current profile with saves, set selected mode to one with a save
        if self.current_profile and hasattr(self.current_profile, 'saved_games') and self.current_profile.saved_games:
            if "normal" in self.current_profile.saved_games:
                self.selected_mode = "Normal"
            else:
                for key in self.current_profile.saved_games.keys():
                    if key.startswith("programming_"):
                        lang = key.replace("programming_", "")
                        self.selected_mode = lang
                        break

        # Save/Load states
        self.saving_game = False
        self.loading_game = False
        self.show_save_slots = False

        # Game variables
        reset_game_state(self)
        self.update_spawn_delay()

        # Enhanced game objects
        self.stars = [ModernStar() for _ in range(200)]
        self.player_ship = ModernPlayerShip(self.current_height)

        # Initialize UI elements for current screen mode
        self.ui_manager.setup_all_ui_elements()

        # For profile select mode, we need additional profile UI setup
        if self.game_mode == GameMode.PROFILE_SELECT:
            self.ui_manager.setup_profile_select_ui()
    

    

    

    
    def recalculate_ui_positions(self):
        """Recalculate UI positions and sizes based on current window dimensions.
        
        This method is called whenever the window is resized to ensure all UI elements
        maintain proper positioning and spacing. It delegates to setup_ui_elements()
        for a complete recalculation of all responsive positioning.
        """
        # Simply call setup_ui_elements again to recalculate everything
        self.ui_manager.setup_ui_elements()
    
    def _disable_windows_maximize_button(self):
        """Disable the Windows maximize button"""
        try:
            import ctypes
            from ctypes import wintypes
            
            # Get window handle
            hwnd = pygame.display.get_wm_info()["window"]
            
            # Windows API constants
            GWL_STYLE = -16
            WS_MAXIMIZEBOX = 0x00010000
            
            import sys
            if sys.platform.startswith('win'):
                import ctypes
                windll = getattr(ctypes, 'windll', None)
                if windll:
                    # Get current window style
                    style = windll.user32.GetWindowLongW(hwnd, GWL_STYLE)
                    # Remove maximize box
                    style &= ~WS_MAXIMIZEBOX
                    # Set new window style
                    windll.user32.SetWindowLongW(hwnd, GWL_STYLE, style)
                    # Force window to redraw
                    windll.user32.SetWindowPos(hwnd, 0, 0, 0, 0, 0, 0x0027)
            
        except Exception as e:
            print(f"Could not disable maximize button: {e}")
    
    def handle_window_resize(self, width, height):
        """Handle window resize events - only height changes allowed.
        
        Keeps width static while allowing height adjustments.
        Automatically recalculates all UI element positions for the new dimensions.
        """
        # Enforce minimum height to ensure UI elements fit properly
        new_height = max(MIN_WINDOW_HEIGHT, height)
        
        # Keep width static at SCREEN_WIDTH
        new_width = SCREEN_WIDTH
        
        # Update normal height for restore functionality
        if not self.is_maximized:
            self.normal_height = new_height
        
        # Create resizable window with fixed width
        self.screen = pygame.display.set_mode((new_width, new_height), pygame.RESIZABLE)
        self.current_height = new_height
        
        # Re-disable maximize button after resize
        if self._disable_maximize_later:
            self._disable_windows_maximize_button()
        
        # Recalculate UI positions for the new dimensions
        self.recalculate_ui_positions()
    
    def check_maximize_state(self):
        """Check and handle window maximize state"""
        # Get display info to check if window should be maximized
        try:
            display_info = pygame.display.Info()
            screen_height = display_info.current_h
        except Exception:
            # Fallback method for standalone executables
            try:
                import tkinter as tk
                root = tk.Tk()
                screen_height = root.winfo_screenheight()
                root.destroy()
            except Exception:
                screen_height = 1080
        
        # If current height is close to screen height, ensure it's properly sized
        if self.current_height >= screen_height - 100:
            self.handle_window_resize(0, screen_height)  # Width will be calculated proportionally
    
    def toggle_maximize(self):
        """Toggle between normal and maximized window states using keyboard shortcut"""
        try:
            display_info = pygame.display.Info()
            screen_height = display_info.current_h
        except Exception:
            # Fallback method for standalone executables
            try:
                import tkinter as tk
                root = tk.Tk()
                screen_height = root.winfo_screenheight()
                root.destroy()
            except Exception:
                screen_height = 1080
        
        if self.is_maximized:
            # Restore to normal size
            self.is_maximized = False
            self.handle_window_resize(SCREEN_WIDTH, self.normal_height)  # Fixed width
        else:
            # Maximize to screen height (but keep width fixed)
            self.is_maximized = True
            max_height = screen_height - 80  # Leave space for taskbar
            self.handle_window_resize(SCREEN_WIDTH, max_height)  # Fixed width
    
    # Removed old methods - now handled by imported modules
    
    def draw_modern_background(self):
        return ui_screens.draw_modern_background(self)
    
    def draw_stats_popup(self):
        return ui_screens.draw_stats_popup(self)
    
    def draw_settings_popup(self):
        return ui_screens.draw_settings_popup(self)
    
    def draw_name_entry_popup(self):
        return ui_screens.draw_name_entry_popup(self)
    
    def draw_save_slots_popup(self):
        return ui_screens.draw_save_slots_popup(self)
    
    def draw_profile_select(self):
        return ui_screens.draw_profile_select(self)
    
    def draw_about_popup(self):
        return ui_screens.draw_about_popup(self)
    
    def draw_menu_background(self):
        return ui_screens.draw_menu_background(self)
    
    def draw_menu(self):
        return ui_screens.draw_menu(self)
    
    def draw_game(self):
        """Draw main game screen"""
        return ui_screens.draw_game(self)

    def draw_game_ui(self):
        """Draw modern game UI"""
        ui_hud.draw_game_ui(self)
    
    def draw_pause_menu(self):
        return ui_screens.draw_pause_menu(self)
    
    def draw_trivia(self):
        return ui_screens.draw_trivia(self)
    

    
    def draw_game_over(self):
        return ui_screens.draw_game_over(self)
    
    def draw(self):
        """Main draw method"""
        self.draw_modern_background()
        
        if self.game_mode == GameMode.PROFILE_SELECT:
            self.draw_profile_select()
        elif self.game_mode == GameMode.MENU:
            self.draw_menu()
        elif self.game_mode == GameMode.STATS:
            # Draw stars in background
            for star in self.stars:
                star.draw(self.screen)
            self.draw_stats_popup()
        elif self.game_mode == GameMode.SETTINGS:
            # Draw stars in background
            for star in self.stars:
                star.draw(self.screen)
            self.draw_settings_popup()
        elif self.game_mode == GameMode.ABOUT:
            # Draw stars in background
            for star in self.stars:
                star.draw(self.screen)
            self.draw_about_popup()
        elif self.game_mode in [GameMode.NORMAL, GameMode.PROGRAMMING]:
            self.draw_game()
        elif self.game_mode == GameMode.PAUSE:
            self.draw_game()
            self.draw_pause_menu()
        elif self.game_mode == GameMode.TRIVIA:
            # Draw game in background with overlay
            self.draw_game()
            self.draw_trivia()
        elif self.game_mode == GameMode.GAME_OVER:
            for star in self.stars:
                star.draw(self.screen)
            self.draw_game_over()
        
        pygame.display.flip()
    
    def handle_events(self):
        """Handle all game events"""
        for event in pygame.event.get():
            # Allow mouse wheel events only if dropdown is open and can handle them
            wheel_handled = False
            if event.type == pygame.MOUSEWHEEL and self.game_mode == GameMode.MENU:
                if hasattr(self, 'mode_dropdown') and self.mode_dropdown.is_open:
                    wheel_handled = self.mode_dropdown.handle_event(event)
            
            # Ignore mouse wheel events that weren't handled by dropdowns
            if event.type == pygame.MOUSEWHEEL and not wheel_handled:
                continue
            # Also ignore scroll-related mouse button events (4 and 5) ONLY if dropdown is not open
            if (event.type == pygame.MOUSEBUTTONDOWN or event.type == pygame.MOUSEBUTTONUP) and event.button in (4, 5):
                # Allow these events if dropdown is open
                if self.game_mode == GameMode.MENU and hasattr(self, 'mode_dropdown') and self.mode_dropdown.is_open:
                    pass  # Don't continue, let the event through
                else:
                    continue
                
            if event.type == pygame.QUIT:
                self.settings.save_settings()
                self.running = False
            
            elif event.type == pygame.VIDEORESIZE:
                # Handle window resize - maintain portrait proportions
                self.handle_window_resize(event.w, event.h)
            
            elif self.game_mode == GameMode.PROFILE_SELECT:
                self.handle_profile_select_events(event)
            
            elif self.game_mode == GameMode.MENU:
                self.handle_menu_events(event)
            
            elif self.game_mode in [GameMode.STATS, GameMode.SETTINGS, GameMode.ABOUT]:
                self.handle_popout_events(event)
            
            elif self.game_mode in [GameMode.NORMAL, GameMode.PROGRAMMING]:
                self.handle_game_events(event)
            
            elif self.game_mode == GameMode.PAUSE:
                self.handle_pause_events(event)
            
            elif self.game_mode == GameMode.TRIVIA:
                if event.type == pygame.KEYDOWN:
                    handle_trivia_input(self, event.key)
            
            elif self.game_mode == GameMode.GAME_OVER:
                self.handle_game_over_events(event)
    
    def handle_profile_select_events(self, event):
        """Handle profile selection screen events"""
        # Handle ESC key to go back to menu
        if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            self.game_mode = GameMode.MENU
            return
        
        if self.creating_profile:
            # Handle profile name input
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN:
                    # Create profile with entered name
                    if self.profile_name_input.strip():
                        new_profile = self.profile_manager.create_profile(self.profile_name_input.strip())
                        if new_profile:
                            # Mark that we need to update the dropdown
                            self.update_profile_dropdown = True
                            self.selected_profile_name = new_profile.name
                            self.profile_manager.select_profile(new_profile)
                            # Recalculate UI for new profile
                            self.ui_manager.setup_ui_elements()
                            self.game_mode = GameMode.MENU
                        self.creating_profile = False
                        self.profile_name_input = ""
                elif event.key == pygame.K_ESCAPE:
                    self.creating_profile = False
                    self.profile_name_input = ""
                elif event.key == pygame.K_BACKSPACE:
                    self.profile_name_input = self.profile_name_input[:-1]
                elif event.unicode and event.unicode.isprintable() and len(self.profile_name_input) < 20:
                    self.profile_name_input += event.unicode
        else:
            # Handle dropdown selection
            if hasattr(self, 'profile_dropdown') and self.profile_dropdown.handle_event(event):
                self.selected_profile_name = self.profile_dropdown.get_selected()

            # Handle Select button
            elif hasattr(self, 'select_profile_button') and self.select_profile_button.handle_event(event):
                if hasattr(self, 'selected_profile_name') and self.selected_profile_name != "(No profiles)":
                    # Find and select the profile
                    profile = self.profile_manager.get_profile_by_name(self.selected_profile_name)
                    if profile:
                        self.profile_manager.select_profile(profile)
                        self.ui_manager.setup_ui_elements()
                        self.game_mode = GameMode.MENU

            # Handle New Profile button
            elif hasattr(self, 'new_profile_button') and self.new_profile_button.handle_event(event):
                self.creating_profile = True
                self.profile_name_input = ""
    
    def handle_menu_events(self, event):
        """Handle menu events"""
        
        # Handle dropdown FIRST when it's open - for ANY event type (scroll, keyboard, mouse)
        if hasattr(self, 'mode_dropdown') and hasattr(self.mode_dropdown, 'is_open') and self.mode_dropdown.is_open:
            handled = self.mode_dropdown.handle_event(event)
            if handled:
                old_mode = self.selected_mode
                self.selected_mode = self.mode_dropdown.get_selected()

                # Only update if selection actually changed
                if old_mode != self.selected_mode:
                    # Enable/disable New Game button based on selection
                    if self.selected_mode != "Choose a Mode":
                        self.new_game_button.is_disabled = False
                    else:
                        self.new_game_button.is_disabled = True

                    # Update Continue button based on new selection
                    # Check if there's a save for the newly selected mode
                    if self.current_profile and self.selected_mode != "Choose a Mode":
                        if self.selected_mode == "Normal":
                            saved_game = self.current_profile.get_saved_game("normal", None)
                        else:
                            saved_game = self.current_profile.get_saved_game("programming", self.selected_mode)
                        self.continue_button.is_disabled = saved_game is None
                    else:
                        self.continue_button.is_disabled = True

                return  # Important: return early to prevent other events from being handled
        
        # Handle Continue button if enabled
        if self.continue_button and not self.continue_button.is_disabled and self.continue_button.handle_event(event):
            # Load saved game for currently selected mode
            if self.current_profile and self.selected_mode != "Choose a Mode":
                if self.selected_mode == "Normal":
                    saved_game = self.current_profile.get_saved_game("normal", None)
                    if saved_game:
                        load_game_state(self, saved_game)
                        self.game_mode = GameMode.NORMAL
                else:
                    # Programming mode
                    saved_game = self.current_profile.get_saved_game("programming", self.selected_mode)
                    if saved_game:
                        load_game_state(self, saved_game)
                        self.game_mode = GameMode.PROGRAMMING
                        # Set the correct language
                        for pl in ProgrammingLanguage:
                            if pl.value == self.selected_mode:
                                self.programming_language = pl
                                break
        
        elif self.new_game_button.handle_event(event):
            print(f"DEBUG: New Game button pressed, selected_mode: {getattr(self, 'selected_mode', 'NONE')}")
            # Only start game if mode is selected
            if self.selected_mode != "Choose a Mode":
                print(f"DEBUG: Starting game in {self.selected_mode} mode")
                try:
                    # Start new game based on selected mode
                    reset_game_state(self)
                    print("DEBUG: Game state reset successful")

                    # Make sure music is playing when game starts
                    if not pygame.mixer.music.get_busy():
                        pygame.mixer.music.play(-1)

                    if self.selected_mode == "Normal":
                        self.game_mode = GameMode.NORMAL
                        print("DEBUG: Set game mode to NORMAL")
                    else:
                        self.game_mode = GameMode.PROGRAMMING
                        print(f"DEBUG: Set game mode to PROGRAMMING")

                        # Set the programming language
                        for lang in ProgrammingLanguage:
                            if lang.value == self.selected_mode:
                                self.programming_language = lang
                                print(f"DEBUG: Set programming language to {lang}")
                                break

                    print("DEBUG: Game start sequence completed successfully")

                except Exception as e:
                    print(f"ERROR: Failed to start game: {e}")
                    import traceback
                    traceback.print_exc()
            else:
                print("ERROR: New Game button pressed but no mode selected")
        
        elif self.stats_button.handle_event(event):
            self.game_mode = GameMode.STATS
        
        elif self.settings_button.handle_event(event):
            self.game_mode = GameMode.SETTINGS
        
        elif self.about_button.handle_event(event):
            self.game_mode = GameMode.ABOUT
        
        elif self.exit_game_button.handle_event(event):
            self.settings.save_settings()
            pygame.mixer.music.stop()
            self.running = False
        
        # Handle dropdown when it's closed (just opening it)
        elif self.mode_dropdown.handle_event(event):
            # Dropdown is being opened, no need to update anything
            pass
    
    def handle_popout_events(self, event):
        """Handle events for popout screens (stats, settings, about)"""
        if self.close_popout_button.handle_event(event):
            # Return to pause menu if we came from there, otherwise to main menu
            if hasattr(self, '_came_from_pause') and self._came_from_pause:
                self.game_mode = GameMode.PAUSE
                self._came_from_pause = False
            else:
                self.game_mode = GameMode.MENU
        
        elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            # Return to pause menu if we came from there, otherwise to main menu
            if hasattr(self, '_came_from_pause') and self._came_from_pause:
                self.game_mode = GameMode.PAUSE
                self._came_from_pause = False
            else:
                self.game_mode = GameMode.MENU
        
        # Handle change player button in stats
        elif self.game_mode == GameMode.STATS and hasattr(self, 'stats_change_player_btn'):
            if event.type == pygame.MOUSEBUTTONDOWN and self.stats_change_player_btn.collidepoint(event.pos):
                self.game_mode = GameMode.PROFILE_SELECT
                self.update_profile_dropdown = True
        
        # Handle settings-specific events
        elif self.game_mode == GameMode.SETTINGS:
            if self.music_slider.handle_event(event):
                self.settings.music_volume = self.music_slider.val
                pygame.mixer.music.set_volume(self.music_slider.val)
                self.settings.save_settings()
            
            elif self.sound_slider.handle_event(event):
                self.settings.sound_volume = self.sound_slider.val
                self.sound_manager.set_volume(self.sound_slider.val)
                self.settings.save_settings()
    
    def handle_game_events(self, event):
        """Handle in-game events"""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                self.game_mode = GameMode.PAUSE
            elif event.key == pygame.K_RETURN:  # EMP trigger
                trigger_emp(self)
            elif event.key == pygame.K_UP:  # Cycle offensive items
                cycle_item_selection(self, "up")
            elif event.key == pygame.K_DOWN:  # Cycle defensive items
                cycle_item_selection(self, "down")
            elif event.key == pygame.K_BACKSPACE:  # Activate selected item
                activate_selected_bonus(self)
            elif event.key == pygame.K_LEFT:
                select_previous_ship(self)
            elif event.key == pygame.K_RIGHT:
                select_next_ship(self)
            elif event.unicode and event.unicode.isprintable():
                # Allow all printable characters for maximum compatibility
                handle_input(self, event.unicode)
    
    def handle_pause_events(self, event):
        """Handle pause menu events"""
        if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            if hasattr(self, '_last_game_mode'):
                self.game_mode = self._last_game_mode
            else:
                self.game_mode = GameMode.NORMAL
        
        elif self.resume_button.handle_event(event):
            if hasattr(self, '_last_game_mode'):
                self.game_mode = self._last_game_mode
            else:
                self.game_mode = GameMode.NORMAL
        
        elif self.save_game_button.handle_event(event):
            # Save current game state to profile
            if self.current_profile:
                game_state = get_game_state(self)
                self.settings.current_profile = self.current_profile  # Ensure settings knows current profile
                if self.settings.save_game(game_state):
                    # Visual feedback (UI only; no console spam)
                    pass
        
        elif self.pause_settings_button.handle_event(event):
            # Open settings panel from pause menu
            self._came_from_pause = True  # Track that we came from pause menu
            self.game_mode = GameMode.SETTINGS
        
        elif self.quit_to_menu_button.handle_event(event):
            # Store the mode that was being played before resetting
            played_mode = "Normal" if self._last_game_mode == GameMode.NORMAL else self.programming_language.value

            # Reset game state
            reset_game_state(self)

            # Update selected mode to match what was just played
            if hasattr(self, 'mode_dropdown'):
                self.selected_mode = played_mode

            # Recalculate UI to update Continue button state
            self.ui_manager.setup_ui_elements()
            self.game_mode = GameMode.MENU
        
        elif self.quit_game_button.handle_event(event):
            self.settings.save_settings()
            pygame.mixer.music.stop()
            self.running = False

    def reset_game_state(self):
        reset_game_state(self)

    def handle_game_over_events(self, event):
        """Handle game over screen events"""
        if self.restart_button.handle_event(event):
            self.reset_game_state()
            if hasattr(self, '_last_game_mode'):
                self.game_mode = self._last_game_mode
            else:
                self.game_mode = GameMode.NORMAL
        
        elif self.menu_button.handle_event(event):
            self.game_mode = GameMode.MENU
            self.reset_game_state()
        
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                self.game_mode = GameMode.MENU
                self.reset_game_state()

    def pygame_time_get_ticks(self) -> int:
        """Expose pygame's tick counter for modules that query via the game object."""

        return pygame.time.get_ticks()

    def random_choice(self, items):
        """Return a deterministic random choice using the game's RNG."""

        sequence = list(items)
        if not sequence:
            raise ValueError("random_choice requires a non-empty sequence")
        return self.random.choice(sequence)

    def create_sound_manager(self, volume: float) -> SoundManager:
        """Factory used by game_state when rebuilding audio components."""

        return SoundManager(volume)

    def create_session_stats(self) -> Dict[str, Any]:
        """Produce a fresh session stats container."""

        return {
            "score": 0,
            "level": 1,
            "words_played": 0,
            "duration_seconds": 0.0,
        }

    def destroy_enemy(self, enemy) -> None:
        """Delegate enemy destruction to gameplay module."""

        destroy_enemy_impl(self, enemy)

    def trivia_db_get_question(
        self,
        mode: GameMode,
        language: ProgrammingLanguage | None,
        level: int,
    ):
        """Fetch a trivia question tailored to the current mode."""

        return self.trivia_db.get_question(mode, language, level)

    def update_spawn_delay(self) -> None:
        """Recalculate enemy spawn delay based on current progression."""

        compute_spawn_delay(self)

    def run(self):
        """Main game loop"""
        # Suppress verbose console banner in production
        pass
        
        while self.running:
            # Store game mode for resume functionality
            if self.game_mode in [GameMode.NORMAL, GameMode.PROGRAMMING]:
                self._last_game_mode = self.game_mode
            
            self.handle_events()
            
            # Update UI elements
            for button in [self.continue_button, self.new_game_button,
                          self.stats_button, self.settings_button, self.about_button, self.exit_game_button,
                          self.close_popout_button, self.resume_button, self.quit_to_menu_button, self.quit_game_button,
                          self.restart_button, self.menu_button]:
                if button:  # Check if button exists
                    button.update()
            
            # Update game
            if self.game_mode in [GameMode.NORMAL, GameMode.PROGRAMMING]:
                update_game(self)
            
            self.draw()
            self.clock.tick(FPS)
        
        self.settings.save_settings()
        pygame.quit()
        sys.exit()


__all__ = ["PTypeGame"]
