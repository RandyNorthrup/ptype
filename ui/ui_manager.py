"""
UI Manager for P-Type.
Handles UI element setup, positioning, and responsive layout.
"""
import pygame
from constants import SCREEN_WIDTH, MIN_WINDOW_HEIGHT
from core.types import GameMode, ProgrammingLanguage
from ui.widgets import ModernButton, ModernDropdown, ModernSlider


class UIManager:
    """Manages UI elements, layout, and responsiveness"""

    def __init__(self, game_instance):
        self.game = game_instance
        self.center_x = SCREEN_WIDTH // 2

    def calculate_responsive_positions(self):
        """Calculate all responsive UI positions based on current window dimensions"""
        # Get current window height (width is always fixed)
        actual_window = pygame.display.get_surface()
        if actual_window:
            window_h = actual_window.get_height()
        else:
            window_h = self.game.current_height

        # Use fixed width
        window_w = SCREEN_WIDTH

        # Central reference point for all UI
        center_x = window_w // 2

        # Store responsive positions for text elements
        self.ui_title_y = max(80, int(window_h * 0.08))  # Title at 8% of height, min 80px
        self.ui_subtitle_y = self.ui_title_y + 100  # Subtitle 100px below title

        # Standard button width - 70% of window, constrained between 200-350px
        std_button_w = max(200, min(350, int(window_w * 0.7)))

        return window_w, window_h, center_x, std_button_w

    def setup_main_menu_ui(self):
        """Setup UI elements for the main menu"""
        window_w, window_h, center_x, std_button_w = self.calculate_responsive_positions()

        # Initialize selected mode to "Choose a Mode" by default
        if not hasattr(self.game, 'selected_mode'):
            self.game.selected_mode = "Choose a Mode"

        # Check if current profile has a saved game for currently selected mode
        has_save = False
        if self.game.current_profile and hasattr(self.game, 'selected_mode') and self.game.selected_mode != "Choose a Mode":
            # Determine if selected mode is Normal or Programming
            if self.game.selected_mode == "Normal":
                saved_game = self.game.current_profile.get_saved_game("normal", None)
            else:
                # It's a programming language
                saved_game = self.game.current_profile.get_saved_game("programming", self.game.selected_mode)
            has_save = saved_game is not None

        # Continue button - always visible, positioned at top
        continue_y = max(200, int(window_h * 0.22))
        self.game.continue_button = ModernButton(
            center_x - std_button_w // 2, continue_y, std_button_w, 60,
            "Continue", self.game.medium_font, has_save
        )

        # New Game button (disabled until mode is selected)
        new_game_y = continue_y + 80
        self.game.new_game_button = ModernButton(
            center_x - std_button_w // 2, new_game_y, std_button_w, 60,
            "New Game", self.game.medium_font, True
        )
        # Disable if no mode selected
        if not hasattr(self.game, 'selected_mode') or self.game.selected_mode == "Choose a Mode":
            self.game.new_game_button.is_disabled = True

        # Mode dropdown - includes placeholder plus Normal mode and all programming languages
        prog_languages = [lang.value for lang in ProgrammingLanguage]
        all_modes = ["Choose a Mode", "Normal"] + prog_languages

        # Position dropdown below New Game button
        dropdown_y = new_game_y + 100
        dropdown_w = max(250, min(300, int(window_w * 0.7)))

        # Find the index of current selected mode and set it in dropdown
        try:
            selected_index = all_modes.index(self.game.selected_mode)
        except ValueError:
            # If selected_mode is not in the list, default to Choose a Mode
            self.game.selected_mode = "Choose a Mode"
            selected_index = 0

        self.game.mode_dropdown = ModernDropdown(
            center_x - dropdown_w // 2, dropdown_y, dropdown_w, 40,
            all_modes, self.game.font, selected_index=selected_index, window_height=window_h
        )

        # Store dropdown label position (30px above dropdown)
        self.game.dropdown_label_y = dropdown_y - 30

        # Store version info position (responsive to window height)
        self.game.ui_version_y = window_h - 20

    def setup_menu_buttons(self):
        """Setup bottom menu buttons (Stats, Settings, About, Exit)"""
        window_w, window_h, center_x, _ = self.calculate_responsive_positions()

        # Bottom menu buttons - positioned below dropdown area
        dropdown_area_end = getattr(self.game, 'dropdown_label_y', 400) + 200
        bottom_y = max(dropdown_area_end, window_h - 300)  # Space above bottom

        small_btn_w = max(85, min(110, window_w // 8))  # Responsive small button width
        btn_spacing = max(15, min(25, window_w // 25))  # More generous spacing

        # Calculate total width and starting position for centering
        total_width = 3 * small_btn_w + 2 * btn_spacing
        start_x = center_x - total_width // 2

        self.game.stats_button = ModernButton(
            start_x, bottom_y, small_btn_w, 50,
            "Stats", self.game.font, False
        )

        self.game.settings_button = ModernButton(
            start_x + small_btn_w + btn_spacing, bottom_y, small_btn_w, 50,
            "Settings", self.game.font, False
        )

        self.game.about_button = ModernButton(
            start_x + 2 * (small_btn_w + btn_spacing), bottom_y, small_btn_w, 50,
            "About", self.game.font, False
        )

        # Exit game button - positioned below other buttons
        exit_btn_w = max(120, min(160, int(window_w * 0.6)))
        exit_y = bottom_y + 70  # 70px below other buttons
        exit_y = min(exit_y, window_h - 150)  # More space from bottom

        self.game.exit_game_button = ModernButton(
            center_x - exit_btn_w // 2, exit_y, exit_btn_w, 50,
            "Exit Game", self.game.font, False
        )

    def setup_popup_elements(self):
        """Setup popup UI elements (close button, sliders, etc.)"""
        window_w, window_h, center_x, _ = self.calculate_responsive_positions()

        # Close popout button
        close_btn_w = max(110, min(140, int(window_w * 0.55)))
        self.game.close_popout_button = ModernButton(
            center_x - close_btn_w // 2, 50, close_btn_w, 50,
            "Close", self.game.medium_font, True
        )

        # Settings sliders
        slider_w = max(200, min(320, int(window_w * 0.75)))
        self.game.music_slider = ModernSlider(
            center_x - slider_w // 2, int(window_h * 0.48), slider_w, 20,
            0.0, 1.0, self.game.settings.music_volume, "Music Volume"
        )
        self.game.sound_slider = ModernSlider(
            center_x - slider_w // 2, int(window_h * 0.54), slider_w, 20,
            0.0, 1.0, self.game.settings.sound_volume, "Sound Volume"
        )

    def setup_pause_menu_buttons(self):
        """Setup pause menu buttons"""
        window_w, window_h, center_x, _ = self.calculate_responsive_positions()

        pause_btn_w = max(200, min(280, int(window_w * 0.7)))
        pause_start_y = int(window_h * 0.35)  # Start lower to avoid covering the pause menu label
        btn_spacing = 65

        self.game.resume_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y, pause_btn_w, 55,
            "Resume", self.game.medium_font, True
        )

        self.game.save_game_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing, pause_btn_w, 55,
            "Save Game", self.game.medium_font, False
        )

        self.game.pause_settings_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing * 2, pause_btn_w, 55,
            "Settings", self.game.medium_font, False
        )

        self.game.quit_to_menu_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing * 3, pause_btn_w, 55,
            "Main Menu", self.game.medium_font, False
        )

        self.game.quit_game_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing * 4, pause_btn_w, 55,
            "Exit Game", self.game.medium_font, False
        )

    def setup_game_over_buttons(self):
        """Setup game over screen buttons"""
        window_w, window_h, center_x, _ = self.calculate_responsive_positions()

        game_over_btn_w = max(180, min(280, int(window_w * 0.7)))
        self.game.restart_button = ModernButton(
            center_x - game_over_btn_w // 2, window_h // 2 + 150, game_over_btn_w, 60,
            "Play Again", self.game.medium_font, True
        )
        self.game.menu_button = ModernButton(
            center_x - game_over_btn_w // 2, window_h // 2 + 230, game_over_btn_w, 60,
            "Main Menu", self.game.medium_font
        )

    def setup_profile_select_ui(self):
        """Setup UI elements specifically for the profile select screen"""
        window_w, window_h, _, _ = self.calculate_responsive_positions()

        # Profile Select UI Components
        panel_width = 480
        panel_height = 360
        panel_top = max(80, self.game.current_height // 2 - panel_height // 2)
        panel_x = SCREEN_WIDTH // 2 - panel_width // 2
        self.game.profile_panel_rect = pygame.Rect(panel_x, panel_top, panel_width, panel_height)

        dropdown_y = self.game.profile_panel_rect.y + 90
        dropdown_w = max(240, min(320, int(window_w * 0.55)))

        # Get profile names
        profile_names = [p.name for p in self.game.profiles] if hasattr(self.game, 'profiles') and self.game.profiles else ["(No profiles)"]

        selectable = profile_names and profile_names[0] != "(No profiles)"
        selected_idx = 0
        if selectable:
            if getattr(self.game, 'selected_profile_name', None) in profile_names:
                selected_idx = profile_names.index(self.game.selected_profile_name)
            elif getattr(self.game.settings, 'current_player_name', None) in profile_names:
                selected_idx = profile_names.index(self.game.settings.current_player_name)

        self.game.profile_dropdown = ModernDropdown(
            SCREEN_WIDTH//2 - dropdown_w//2, dropdown_y, dropdown_w, 40,
            profile_names, self.game.font, selected_index=selected_idx, window_height=window_h
        )

        if selectable:
            self.game.selected_profile_name = profile_names[selected_idx]
        else:
            self.game.selected_profile_name = "(No profiles)"

        # Select and New Profile buttons
        button_y = dropdown_y + 110
        button_w = max(150, min(200, int(window_w * 0.35)))
        button_spacing = max(40, int(window_w * 0.06))

        total_width = button_w * 2 + button_spacing
        base_x = self.game.profile_panel_rect.centerx - total_width // 2

        self.game.select_profile_button = ModernButton(
            base_x, button_y, button_w, 48,
            "Select", self.game.font, True
        )
        self.game.select_profile_button.is_disabled = not selectable

        self.game.new_profile_button = ModernButton(
            base_x + button_w + button_spacing, button_y, button_w, 48,
            "New Player", self.game.font, False
        )

        info_y = button_y - 65
        self.game.profile_help_label_pos = (SCREEN_WIDTH // 2, info_y)
        self.game.profile_help_text = "Select an existing player or create a new one"

    def setup_all_ui_elements(self):
        """Main setup method to configure all UI elements"""
        # Calculate positions
        self.calculate_responsive_positions()

        # Setup individual UI components
        self.setup_main_menu_ui()
        self.setup_menu_buttons()
        self.setup_popup_elements()
        self.setup_pause_menu_buttons()
        self.setup_game_over_buttons()

        # Store current window dimensions for responsive drawing
        self.game.ui_window_width = self.center_x * 2
        self.game.ui_center_x = self.center_x

        # Update player ship position for responsive window
        if hasattr(self.game, 'player_ship'):
            self.game.player_ship.update_position_for_window_dimensions(self.game.ui_window_width, self.game.current_height)

    def setup_ui_elements(self):
        """Setup modern UI elements with fully responsive positioning.

        This method creates all UI elements with positions calculated based on the current
        window dimensions. All elements use percentage-based positioning with minimum
        spacing constraints to prevent overlap at any window size.

        Key Features:
        - Responsive centering for all elements
        - Generous spacing prevents overlap
        - Portrait aspect ratio maintained
        - Automatic recalculation on window resize
        """
        # Get current window height (width is always fixed)
        actual_window = pygame.display.get_surface()
        if actual_window:
            window_h = actual_window.get_height()
        else:
            window_h = self.game.current_height

        # Use fixed width
        window_w = SCREEN_WIDTH

        # Central reference point for all UI
        center_x = window_w // 2

        # Store current window dimensions for responsive drawing
        self.game.ui_window_width = window_w
        self.game.ui_center_x = center_x

        # Store responsive positions for text elements
        self.game.ui_title_y = max(80, int(window_h * 0.08))  # Title at 8% of height, min 80px
        self.game.ui_subtitle_y = self.game.ui_title_y + 100  # Subtitle 100px below title (increased from 50)

        # Standard button width - 70% of window, constrained between 200-350px
        std_button_w = max(200, min(350, int(window_w * 0.7)))

        # Continue button - always visible, positioned at top
        continue_y = max(200, int(window_h * 0.22))

        # Check if current profile has a saved game for currently selected mode
        has_save = False
        if self.game.current_profile and hasattr(self.game, 'selected_mode') and self.game.selected_mode != "Choose a Mode":
            # Determine if selected mode is Normal or Programming
            if self.game.selected_mode == "Normal":
                saved_game = self.game.current_profile.get_saved_game("normal", None)
            else:
                # It's a programming language
                saved_game = self.game.current_profile.get_saved_game("programming", self.game.selected_mode)
            has_save = saved_game is not None

        # Continue button - always created but may be disabled
        self.game.continue_button = ModernButton(
            center_x - std_button_w // 2, continue_y, std_button_w, 60,
            "Continue", self.game.medium_font, has_save  # Enabled state based on save
        )
        if not has_save:
            self.game.continue_button.is_disabled = True  # Mark as disabled

        # New Game button (disabled until mode is selected)
        new_game_y = continue_y + 80
        self.game.new_game_button = ModernButton(
            center_x - std_button_w // 2, new_game_y, std_button_w, 60,
            "New Game", self.game.medium_font, True
        )
        # Disable if no mode selected
        if not hasattr(self.game, 'selected_mode') or self.game.selected_mode == "Choose a Mode":
            self.game.new_game_button.is_disabled = True

        # Mode dropdown - includes placeholder plus Normal mode and all programming languages
        # Get all language values from the enum properly
        prog_languages = [lang.value for lang in ProgrammingLanguage]
        all_modes = ["Choose a Mode", "Normal"] + prog_languages

        # Position dropdown below New Game button
        dropdown_y = new_game_y + 100  # Below New Game button
        dropdown_w = max(250, min(300, int(window_w * 0.7)))

        # Create or update the dropdown with all modes
        # Force the dropdown to show all options properly
        # Preserve open state if dropdown already exists
        was_open = self.game.mode_dropdown.is_open if hasattr(self.game, 'mode_dropdown') else False
        self.game.mode_dropdown = ModernDropdown(
            center_x - dropdown_w // 2, dropdown_y, dropdown_w, 40,
            all_modes, self.game.font, window_height=window_h
        )
        # Restore open state
        self.game.mode_dropdown.is_open = was_open

        # Initialize selected mode if not exists
        if not hasattr(self.game, 'selected_mode'):
            self.game.selected_mode = "Choose a Mode"

        # Find the index of current selected mode and set it in dropdown
        try:
            selected_index = all_modes.index(self.game.selected_mode)
            self.game.mode_dropdown.selected_index = selected_index
        except ValueError:
            # If selected_mode is not in the list, default to Choose a Mode
            self.game.selected_mode = "Choose a Mode"
            self.game.mode_dropdown.selected_index = 0

        # Store dropdown label position (30px above dropdown)
        self.game.dropdown_label_y = dropdown_y - 30

        # Store version info position (responsive to window height)
        self.game.ui_version_y = window_h - 20

        # Update player ship position for responsive window
        if hasattr(self.game, 'player_ship'):
            self.game.player_ship.update_position_for_window_dimensions(window_w, window_h)

        # Bottom menu buttons - positioned below dropdown area
        # Give reasonable space for dropdown
        bottom_y = dropdown_y + 80  # Space below closed dropdown
        # But ensure minimum space from bottom for help panel
        bottom_y = min(bottom_y, window_h - 300)  # Leave 300px at bottom for help panel and footer

        small_btn_w = max(85, min(110, window_w // 8))  # Responsive small button width
        btn_spacing = max(15, min(25, window_w // 25))  # More generous spacing

        # Calculate total width and starting position for centering
        total_width = 3 * small_btn_w + 2 * btn_spacing
        start_x = center_x - total_width // 2

        self.game.stats_button = ModernButton(
            start_x, bottom_y, small_btn_w, 50,
            "Stats", self.game.font, False
        )

        self.game.settings_button = ModernButton(
            start_x + small_btn_w + btn_spacing, bottom_y, small_btn_w, 50,
            "Settings", self.game.font, False
        )

        self.game.about_button = ModernButton(
            start_x + 2 * (small_btn_w + btn_spacing), bottom_y, small_btn_w, 50,
            "About", self.game.font, False
        )

        # Exit game button - positioned below other buttons
        exit_btn_w = max(120, min(160, int(window_w * 0.6)))
        exit_y = bottom_y + 70  # 70px below other buttons
        # Ensure it doesn't go too close to bottom (leave space for help panel)
        exit_y = min(exit_y, window_h - 220)  # More space from bottom

        self.game.exit_game_button = ModernButton(
            center_x - exit_btn_w // 2, exit_y, exit_btn_w, 50,
            "Exit Game", self.game.font, False
        )

        # Close popout button
        close_btn_w = max(110, min(140, int(window_w * 0.55)))
        self.game.close_popout_button = ModernButton(
            center_x - close_btn_w // 2, bottom_y, close_btn_w, 50,
            "Close", self.game.medium_font, True
        )

        # Pause menu elements - improved layout
        pause_btn_w = max(200, min(280, int(window_w * 0.7)))
        pause_start_y = int(window_h * 0.35)  # Start lower to avoid covering the pause menu label
        btn_spacing = 65

        self.game.resume_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y, pause_btn_w, 55,
            "Resume", self.game.medium_font, True
        )

        self.game.save_game_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing, pause_btn_w, 55,
            "Save Game", self.game.medium_font, False
        )

        self.game.pause_settings_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing * 2, pause_btn_w, 55,
            "Settings", self.game.medium_font, False
        )

        self.game.quit_to_menu_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing * 3, pause_btn_w, 55,
            "Main Menu", self.game.medium_font, False
        )

        self.game.quit_game_button = ModernButton(
            center_x - pause_btn_w // 2, pause_start_y + btn_spacing * 4, pause_btn_w, 55,
            "Exit Game", self.game.medium_font, False
        )

        # Settings sliders
        slider_w = max(200, min(320, int(window_w * 0.75)))
        self.game.music_slider = ModernSlider(
            center_x - slider_w // 2, int(window_h * 0.48), slider_w, 20,
            0.0, 1.0, self.game.settings.music_volume, "Music Volume"
        )
        self.game.sound_slider = ModernSlider(
            center_x - slider_w // 2, int(window_h * 0.54), slider_w, 20,
            0.0, 1.0, self.game.settings.sound_volume, "Sound Volume"
        )

        # Game over buttons
        game_over_btn_w = max(180, min(280, int(window_w * 0.7)))
        self.game.restart_button = ModernButton(
            center_x - game_over_btn_w // 2, window_h // 2 + 150, game_over_btn_w, 60,
            "Play Again", self.game.medium_font, True
        )
        self.game.menu_button = ModernButton(
            center_x - game_over_btn_w // 2, window_h // 2 + 230, game_over_btn_w, 60,
            "Main Menu", self.game.medium_font
        )

    def recalculate_ui_positions(self):
        """Recalculate UI positions and sizes based on current window dimensions"""
        # Simply call setup again to recalculate everything
        self.setup_all_ui_elements()
