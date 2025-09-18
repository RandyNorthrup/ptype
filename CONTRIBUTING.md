# Contributing to P-Type

Thank you for your interest in contributing to P-Type! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/ptype.git
   cd ptype
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   
   # Run the game to test everything works
   python ptype.py
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Guidelines

### Code Style
- Follow PEP 8 Python style guidelines
- Use meaningful variable and function names
- Add docstrings to classes and functions
- Keep lines under 100 characters when possible

### Project Structure
```
ptype/
├── ptype.py              # Main game file - all game logic here
├── build_executable.py   # Build script - modify for build changes
├── ptype.manifest        # Windows manifest - for app properties
├── requirements.txt      # Dependencies
├── README.md            # Main documentation
├── CONTRIBUTING.md      # This file
├── CHANGELOG.md         # Version history
└── LICENSE              # MIT License
```

### Key Components in ptype.py

#### Game Classes
- `PTypeGame` - Main game class, handles all game logic
- `ModernPlayerShip` - Player ship with responsive positioning
- `ModernEnemyShip` / `BossEnemyShip` - Enemy ships with different behaviors
- `ModernButton` / `ModernDropdown` / `ModernSlider` - UI components
- `GameSettings` - Settings management and persistence

#### Important Methods
- `setup_ui_elements()` - **Critical**: Responsive UI positioning system
- `recalculate_ui_positions()` - Called on window resize
- `handle_*_events()` - Event handling for different game states
- `draw_*()` - Rendering methods for different screens

### Responsive UI System
The game features a fully responsive UI system. When adding new UI elements:

1. **Add to `setup_ui_elements()`**:
   ```python
   # Use current window dimensions
   window_w = actual_window.get_width() if actual_window else SCREEN_WIDTH
   window_h = actual_window.get_height() if actual_window else self.current_height
   center_x = window_w // 2
   
   # Create responsive positioning
   your_button = ModernButton(
       center_x - button_width // 2,  # Center horizontally
       int(window_h * 0.XX),          # Position as percentage of height
       button_width,
       button_height,
       "Button Text",
       self.font
   )
   ```

2. **Add to drawing method**:
   ```python
   your_button.draw(self.screen)
   ```

3. **Add to event handling**:
   ```python
   elif self.your_button.handle_event(event):
       # Handle button click
       pass
   ```

4. **Add to update loop**:
   ```python
   # In run() method, add to the button list
   for button in [..., self.your_button]:
       button.update()
   ```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**:
   - Operating System and version
   - Python version
   - Pygame version
   - Window size when bug occurred

2. **Steps to Reproduce**:
   - Detailed steps to reproduce the issue
   - Expected behavior vs actual behavior
   - Screenshots or videos if applicable

3. **Error Messages**:
   - Full error messages and stack traces
   - Console output if available

## ✨ Feature Requests

For new features:

1. **Search existing issues** to avoid duplicates
2. **Describe the feature** clearly and provide use cases
3. **Consider the scope** - is this a small enhancement or major feature?
4. **Provide mockups** or examples if applicable

## 🔄 Pull Request Process

1. **Update Documentation**:
   - Update README.md if adding user-facing features
   - Update CHANGELOG.md with your changes
   - Add docstrings to new functions/classes

2. **Test Your Changes**:
   ```bash
   # Test the Python script
   python ptype.py
   
   # Test building the executable
   python build_executable.py
   
   # Test the built executable
   cd dist && ./P-Type.exe
   ```

3. **Commit Guidelines**:
   ```bash
   # Use clear, descriptive commit messages
   git commit -m "Add responsive positioning for new settings panel"
   git commit -m "Fix dropdown overflow on small window sizes"
   git commit -m "Update README with new installation instructions"
   ```

4. **Submit Pull Request**:
   - Clear title and description
   - Link to related issues
   - Describe what you changed and why
   - Include screenshots for UI changes

## 🏗️ Architecture Notes

### Game State Management
- `GameMode` enum controls current screen (MENU, NORMAL, PROGRAMMING, etc.)
- Each mode has dedicated event handlers and draw methods
- Settings are persisted to JSON files automatically

### Responsive Design Philosophy
- All UI elements scale with window size
- Portrait aspect ratio (3:4) maintained at all times
- Minimum window sizes prevent overlap
- Percentage-based positioning ensures consistency

### Performance Considerations
- Game runs at 60 FPS (`FPS` constant)
- UI recalculation only happens on window resize
- Efficient drawing with proper layering (stars → ships → UI → dropdowns)

## 🎯 Areas for Contribution

### High Priority
- [ ] Additional programming languages (Rust, Go, TypeScript, Swift)
- [ ] Achievement system with unlockable content
- [ ] Enhanced sound effects and background music
- [ ] Custom word lists and difficulty settings

### Medium Priority
- [ ] Online leaderboards and statistics
- [ ] Themes and visual customization
- [ ] Multiple keyboard layouts support
- [ ] Accessibility improvements (colorblind support, etc.)

### Low Priority
- [ ] Multiplayer mode
- [ ] Mobile version
- [ ] Plugin system for custom content
- [ ] Advanced statistics and analytics

## 💡 Tips for Contributors

1. **Start Small**: Begin with small bug fixes or minor features
2. **Ask Questions**: Use GitHub discussions or issues for questions
3. **Test Thoroughly**: Test on different window sizes and resolutions
4. **Follow Patterns**: Look at existing code for patterns and style
5. **Document Changes**: Update relevant documentation

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the project goals
- Have fun! 🎮

## 📞 Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Code Questions**: Comment on relevant files or functions

---

Thank you for contributing to P-Type! Your efforts help make typing practice more engaging for developers and enthusiasts worldwide. 🚀