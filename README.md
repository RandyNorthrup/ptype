# P-Type - Programming Typing Challenge

<div align="center">

![P-Type Logo](https://img.shields.io/badge/P--Type-v2.2-blue?style=for-the-badge&logo=python)
![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey?style=for-the-badge&logo=windows)
![Python](https://img.shields.io/badge/Python-3.11+-green?style=for-the-badge&logo=python)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A modern typing game designed for programmers and typing enthusiasts**

🎮 **[Download Latest Release](https://github.com/randy-moore/ptype/releases)** 🎮

</div>

## 🚀 Features

### 🎨 **Fully Responsive UI**
- Adapts to any window size while maintaining perfect proportions
- Automatic UI recalculation on window resize
- Consistent centering and spacing across all screen resolutions
- Portrait aspect ratio maintained at all window sizes

### 🎮 **Game Modes**
- **Normal Mode**: Master standard English vocabulary and tech terms
- **Programming Mode**: Learn syntax while improving typing speed
- 7 Programming languages supported: Python, JavaScript, Java, C#, C++, CSS, HTML
- Progressive difficulty from beginner to advanced levels

### 🏆 **Advanced Features**
- 📈 20 progressive difficulty levels (20-300 WPM target speed)
- 👑 Epic boss battles with challenging words at level completion
- 🎯 Real-time collision mechanics with visual effects
- 📊 Detailed statistics and high score tracking
- ⚙️ Customizable audio settings
- 🎨 Modern 3D ship graphics with smooth animations
- 🖱️ Smart dropdown menus with scrolling support
- ⌨️ Full keyboard support including special characters

### 🪟 **Professional Windows Integration**
- Proper windowed application with title bar and controls
- Resizable window with automatic UI adaptation
- Taskbar integration and system compatibility
- Clean exit options in both menu and pause screens

## 📸 Screenshots

*Screenshots coming soon - the game features a beautiful space-themed interface with modern UI elements.*

## 🎯 How to Play

1. **Choose Your Mode**:
   - **Normal Mode**: Focus on general typing skills with tech vocabulary
   - **Programming Mode**: Practice coding syntax in your preferred language

2. **Select Difficulty**:
   - **Beginner**: Basic keywords and simple terms
   - **Intermediate**: Common patterns and moderate complexity
   - **Advanced**: Complex expressions and frameworks

3. **Destroy Enemy Ships**:
   - Type the words displayed on enemy ships to destroy them
   - Use ← → arrow keys to switch between multiple targets
   - Avoid collisions and don't let too many ships escape!

4. **Face Boss Battles**:
   - Complete levels to unlock challenging boss encounters
   - Boss ships require longer, more complex phrases
   - Defeat bosses to progress to higher difficulty levels

## 💻 System Requirements

- **OS**: Windows 10 or later
- **Memory**: 100 MB RAM
- **Storage**: 50 MB free disk space
- **Optional**: Sound card for audio effects

## 📦 Installation

### Option 1: Download Executable (Recommended)
1. Go to [Releases](https://github.com/randy-moore/ptype/releases)
2. Download the latest `P-Type.exe`
3. Run the executable - no installation required!

### Option 2: Run from Source
```bash
# Clone the repository
git clone https://github.com/randy-moore/ptype.git
cd ptype

# Install dependencies
pip install pygame

# Run the game
python ptype.py
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| **Type letters/words** | Target and destroy enemy ships |
| **← →** | Switch between active enemy ships |
| **ESC** | Pause game / Access settings |
| **F11** | Toggle maximize window |
| **Mouse** | Navigate menus and dropdowns |

## 🛠️ Development

### Building from Source

```bash
# Install build dependencies
pip install pyinstaller pygame

# Build executable
python build_executable.py
```

### Project Structure
```
ptype/
├── ptype.py              # Main game file
├── build_executable.py   # Build script for creating executable
├── ptype.manifest        # Windows application manifest
├── README.md            # This file
├── LICENSE              # MIT License
└── dist/                # Built executables (created after build)
    ├── P-Type.exe       # Main executable
    ├── README.txt       # User documentation
    └── Launch P-Type.bat # User-friendly launcher
```

### Technology Stack
- **Python 3.11+**: Core game engine
- **Pygame 2.5+**: Graphics and input handling
- **PyInstaller**: Executable compilation
- **Modern UI**: Custom responsive interface system

## 🎯 Game Statistics

Track your progress with detailed statistics:
- **Words Per Minute (WPM)**: Real-time typing speed
- **Accuracy**: Percentage of correct keystrokes
- **High Scores**: Best scores for each mode and language
- **Progress**: Level completion and boss defeats
- **Time Played**: Total game time tracking

## 🏆 Achievement System

*Coming Soon*: Unlock achievements for:
- Reaching typing speed milestones
- Completing all levels in different modes
- Defeating boss battles
- Maintaining high accuracy scores
- Mastering different programming languages

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📋 Todo / Roadmap

- [ ] Add more programming languages (Rust, Go, TypeScript)
- [ ] Implement online leaderboards
- [ ] Add custom word lists support
- [ ] Create achievement system
- [ ] Add sound effects and background music
- [ ] Implement multiplayer mode
- [ ] Add themes and customization options
- [ ] Create mobile version

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pygame Community** - For the excellent game development framework
- **Python Community** - For the robust programming language
- **Typography Enthusiasts** - For inspiration in creating an engaging typing experience

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/randy-moore/ptype/issues)
- **Discussions**: [GitHub Discussions](https://github.com/randy-moore/ptype/discussions)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=randy-moore/ptype&type=Date)](https://star-history.com/#randy-moore/ptype&Date)

---

<div align="center">

**Made with ❤️ for the programming and typing community**

[⬆ Back to Top](#p-type---programming-typing-challenge)

</div>