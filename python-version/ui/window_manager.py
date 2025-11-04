"""
Window management utilities for P-Type.
Handles window resizing, maximize state, and platform-specific modifications.
"""
import pygame
try:
    from ..constants import SCREEN_WIDTH, MIN_WINDOW_HEIGHT
except ImportError:
    from constants import SCREEN_WIDTH, MIN_WINDOW_HEIGHT


class WindowManager:
    """Manages window resizing, maximization, and platform-specific modifications"""

    def __init__(self, game_instance):
        self.game = game_instance
        self._disable_maximize_later = False

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
        if not self.game.is_maximized:
            self.game.normal_height = new_height

        # Create resizable window with fixed width
        self.game.screen = pygame.display.set_mode((new_width, new_height), pygame.RESIZABLE)
        self.game.current_height = new_height

        # Re-disable maximize button after resize
        if self._disable_maximize_later:
            self._disable_windows_maximize_button()

        # Recalculate UI positions for the new dimensions
        self.game.recalculate_ui_positions()

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
        if self.game.current_height >= screen_height - 100:
            self.handle_window_resize(0, screen_height)

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

        if self.game.is_maximized:
            # Restore to normal size
            self.game.is_maximized = False
            self.handle_window_resize(SCREEN_WIDTH, self.game.normal_height)
        else:
            # Maximize to screen height (but keep width fixed)
            self.game.is_maximized = True
            max_height = screen_height - 80  # Leave space for taskbar
            self.handle_window_resize(SCREEN_WIDTH, max_height)
