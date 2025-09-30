"""UI widgets for P-Type.

Currently includes ModernButton. Extracted for modular UI architecture.
"""
try:
    import pygame
except Exception:  # pragma: no cover
    pygame = None  # type: ignore

try:
    from ..constants import (
        MODERN_GRAY,
        MODERN_DARK_GRAY,
        MODERN_LIGHT,
        MODERN_WHITE,
        ACCENT_BLUE,
        ACCENT_CYAN,
        ACCENT_GREEN,
        ACCENT_YELLOW,
        NEON_BLUE,
        SCREEN_HEIGHT,
    )
except Exception:
    from constants import (
        MODERN_GRAY,
        MODERN_DARK_GRAY,
        MODERN_LIGHT,
        MODERN_WHITE,
        ACCENT_BLUE,
        ACCENT_CYAN,
        ACCENT_GREEN,
        ACCENT_YELLOW,
        NEON_BLUE,
        SCREEN_HEIGHT,
    )


class ModernButton:
    """Sleek modern button with hover effects and disabled state"""
    def __init__(self, x, y, width, height, text, font, primary=False):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.font = font
        self.primary = primary
        self.is_hovered = False
        self.is_disabled = False
        self.click_animation = 0
        
    def handle_event(self, event):
        if self.is_disabled:
            return False
        if event.type == pygame.MOUSEMOTION:
            self.is_hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                self.click_animation = 10
                return True
        return False
    
    def update(self):
        if self.click_animation > 0:
            self.click_animation -= 1
    
    def draw(self, screen):
        if pygame is None:
            return
        if self.is_disabled:
            base_color = (60, 60, 60)
            hover_color = (60, 60, 60)
            text_color = MODERN_GRAY
        elif self.primary:
            base_color = ACCENT_BLUE
            hover_color = NEON_BLUE
            text_color = MODERN_WHITE
        else:
            base_color = MODERN_DARK_GRAY
            hover_color = MODERN_GRAY
            text_color = MODERN_LIGHT
        current_color = hover_color if (self.is_hovered and not self.is_disabled) else base_color
        rect = self.rect.copy()
        if self.click_animation > 0:
            shrink = self.click_animation // 2
            rect.inflate_ip(-shrink, -shrink)
        pygame.draw.rect(screen, current_color, rect, border_radius=8)
        text_surface = self.font.render(self.text, True, text_color)
        text_rect = text_surface.get_rect(center=rect.center)
        screen.blit(text_surface, text_rect)


class ModernDropdown:
    """Sleek dropdown menu with smart positioning."""

    def __init__(self, x, y, width, height, options, font, selected_index=0, window_height=None):
        if pygame is None:
            raise RuntimeError("pygame is required for ModernDropdown")

        self.rect = pygame.Rect(x, y, width, height)
        self.options = list(options)
        self.font = font
        self.selected_index = min(selected_index, len(self.options) - 1) if self.options else 0
        self.is_open = False
        self.is_hovered = False

        if window_height is None:
            surface = pygame.display.get_surface()
            window_height = surface.get_height() if surface else SCREEN_HEIGHT

        space_below = window_height - (y + height)
        desired_height = height * len(self.options)
        self.open_upward = False if space_below >= desired_height else False

        available_space = space_below if not self.open_upward else y
        max_that_fit = int(available_space // height) if height else 5
        self.max_visible = max(1, min(5, max_that_fit, len(self.options)))

        self.scroll_offset = 0
        self.option_rects = []
        self._update_option_rects()

    def _update_option_rects(self) -> None:
        self.option_rects = []
        for i in range(min(self.max_visible, len(self.options))):
            option_index = i + self.scroll_offset
            if option_index >= len(self.options):
                break
            if self.open_upward:
                option_y = self.rect.y - self.rect.height * (i + 1)
            else:
                option_y = self.rect.y + self.rect.height * (i + 1)
            option_rect = pygame.Rect(self.rect.x, option_y, self.rect.width, self.rect.height)
            self.option_rects.append((option_rect, option_index))

    def handle_event(self, event) -> bool:
        if pygame is None:
            return False

        if event.type == pygame.MOUSEMOTION:
            self.is_hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.is_open and event.button in (4, 5):
                if len(self.options) > self.max_visible:
                    if event.button == 4:
                        self.scroll_offset = max(0, self.scroll_offset - 1)
                    else:
                        self.scroll_offset = min(len(self.options) - self.max_visible, self.scroll_offset + 1)
                    self._update_option_rects()
                return True
            if event.button == 1:
                if self.rect.collidepoint(event.pos):
                    self.is_open = not self.is_open
                    if self.is_open:
                        if self.selected_index < self.scroll_offset:
                            self.scroll_offset = self.selected_index
                        elif self.selected_index >= self.scroll_offset + self.max_visible:
                            self.scroll_offset = self.selected_index - self.max_visible + 1
                        self._update_option_rects()
                    return True
                if self.is_open:
                    for rect, option_index in self.option_rects:
                        if rect.collidepoint(event.pos):
                            self.selected_index = option_index
                            self.is_open = False
                            return True
                    self.is_open = False
        elif event.type == pygame.MOUSEBUTTONUP and event.button == 1 and self.is_open:
            if not self.rect.collidepoint(event.pos):
                for rect, _ in self.option_rects:
                    if rect.collidepoint(event.pos):
                        break
                else:
                    self.is_open = False
        return False

    def get_selected(self):
        if 0 <= self.selected_index < len(self.options):
            return self.options[self.selected_index]
        return self.options[0] if self.options else ""

    def draw(self, screen):
        if pygame is None:
            return

        pygame.draw.rect(screen, MODERN_DARK_GRAY, self.rect, border_radius=6)
        pygame.draw.rect(screen, ACCENT_BLUE, self.rect, 2, border_radius=6)

        label = self.options[self.selected_index] if self.options else ""
        text_surface = self.font.render(label, True, MODERN_WHITE)
        text_rect = text_surface.get_rect(midleft=(self.rect.x + 10, self.rect.centery))
        screen.blit(text_surface, text_rect)

        arrow_points = [
            (self.rect.right - 20, self.rect.centery - 5),
            (self.rect.right - 8, self.rect.centery - 5),
            (self.rect.right - 14, self.rect.centery + 5),
        ]
        pygame.draw.polygon(screen, ACCENT_CYAN, arrow_points)

        if not self.is_open:
            return

        if self.open_upward:
            bg_rect = pygame.Rect(
                self.rect.x,
                self.rect.y - self.rect.height * self.max_visible,
                self.rect.width,
                self.rect.height * self.max_visible,
            )
        else:
            bg_rect = pygame.Rect(
                self.rect.x,
                self.rect.bottom,
                self.rect.width,
                self.rect.height * self.max_visible,
            )

        pygame.draw.rect(screen, MODERN_DARK_GRAY, bg_rect, border_radius=6)
        pygame.draw.rect(screen, ACCENT_BLUE, bg_rect, 2, border_radius=6)

        visible_start = self.scroll_offset
        visible_end = min(len(self.options), visible_start + self.max_visible)

        for i in range(visible_start, visible_end):
            option_y = bg_rect.y + (i - visible_start) * self.rect.height
            option_rect = pygame.Rect(
                bg_rect.x + 4,
                option_y + 2,
                bg_rect.width - 8,
                self.rect.height - 4,
            )

            if i == self.selected_index:
                pygame.draw.rect(screen, ACCENT_GREEN, option_rect, border_radius=4)
            else:
                pygame.draw.rect(screen, MODERN_GRAY, option_rect, border_radius=4)

            pygame.draw.rect(screen, MODERN_WHITE, option_rect, 1, border_radius=4)
            option_text = self.font.render(self.options[i], True, MODERN_WHITE)
            text_rect = option_text.get_rect(midleft=(option_rect.x + 10, option_rect.centery))
            screen.blit(option_text, text_rect)

        if len(self.options) > self.max_visible:
            scrollbar_track = pygame.Rect(bg_rect.right - 10, bg_rect.y + 2, 8, bg_rect.height - 4)
            pygame.draw.rect(screen, MODERN_GRAY, scrollbar_track, border_radius=4)

            scroll_range = len(self.options) - self.max_visible
            thumb_height = max(20, (self.max_visible / len(self.options)) * scrollbar_track.height)
            if scroll_range > 0:
                thumb_offset = (self.scroll_offset / scroll_range) * (scrollbar_track.height - thumb_height)
            else:
                thumb_offset = 0
            thumb_rect = pygame.Rect(scrollbar_track.x + 1, scrollbar_track.y + thumb_offset, 6, thumb_height)
            pygame.draw.rect(screen, ACCENT_YELLOW, thumb_rect, border_radius=3)


class ModernSlider:
    """Modern slider with smooth animations."""

    def __init__(self, x, y, width, height, min_val, max_val, initial_val, label):
        if pygame is None:
            raise RuntimeError("pygame is required for ModernSlider")

        self.rect = pygame.Rect(x, y, width, height)
        self.min_val = min_val
        self.max_val = max_val
        self.val = initial_val
        self.label = label
        self.dragging = False
        self.knob_radius = height // 2 + 2

    def handle_event(self, event) -> bool:
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos) or self._get_knob_rect().collidepoint(event.pos):
                self.dragging = True
                return True
        elif event.type == pygame.MOUSEBUTTONUP:
            self.dragging = False
        elif event.type == pygame.MOUSEMOTION and self.dragging:
            relative_x = max(0, min(self.rect.width, event.pos[0] - self.rect.x))
            self.val = self.min_val + (relative_x / self.rect.width) * (self.max_val - self.min_val)
            return True
        return False

    def _get_knob_x(self) -> float:
        return self.rect.x + (self.val - self.min_val) / (self.max_val - self.min_val) * self.rect.width

    def _get_knob_rect(self) -> pygame.Rect:
        knob_x = self._get_knob_x()
        return pygame.Rect(knob_x - self.knob_radius, self.rect.y - 2, self.knob_radius * 2, self.rect.height + 4)

    def draw(self, screen, font):
        pygame.draw.rect(screen, MODERN_DARK_GRAY, self.rect, border_radius=self.rect.height // 2)

        progress_ratio = (self.val - self.min_val) / (self.max_val - self.min_val)
        fill_width = int(progress_ratio * self.rect.width)
        if fill_width > 0:
            fill_rect = pygame.Rect(self.rect.x, self.rect.y, fill_width, self.rect.height)
            pygame.draw.rect(screen, ACCENT_BLUE, fill_rect, border_radius=self.rect.height // 2)

        knob_center = (int(self._get_knob_x()), self.rect.centery)
        pygame.draw.circle(screen, MODERN_WHITE, knob_center, self.knob_radius)
        pygame.draw.circle(screen, ACCENT_BLUE, knob_center, self.knob_radius - 2)

        value_text = font.render(f"{int(self.val * 100)}%", True, MODERN_LIGHT)
        screen.blit(value_text, (self.rect.x + self.rect.width + 15, self.rect.centery - 8))
