"""
P-Type Executable Builder
Creates a standalone Windows executable using PyInstaller
"""

import os
import subprocess
import sys
import shutil
from pathlib import Path

def install_pyinstaller():
    """Install PyInstaller if not already installed"""
    try:
        import PyInstaller
        print("✓ PyInstaller is already installed")
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print("✓ PyInstaller installed successfully")

def create_spec_file():
    """Create a PyInstaller spec file for P-Type"""
    spec_content = """# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['ptype.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='P-Type',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='icon.ico'  # We'll create this
)
"""
    
    with open('ptype.spec', 'w') as f:
        f.write(spec_content)
    print("✓ Created PyInstaller spec file")

def create_icon():
    """Create a simple icon file"""
    # Since we can't create an actual .ico file easily, we'll skip this and remove the icon line
    spec_content = """# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['ptype.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=['pygame'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='P-Type',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
"""
    
    with open('ptype.spec', 'w') as f:
        f.write(spec_content)
    print("✓ Updated spec file without icon")

def build_executable():
    """Build the executable using PyInstaller"""
    print("\n🚀 Building P-Type executable...")
    print("This may take a few minutes...\n")
    
    try:
        # Clean previous builds
        if os.path.exists('build'):
            shutil.rmtree('build')
        if os.path.exists('dist'):
            shutil.rmtree('dist')
        
        # Build using direct command with windowed flag for proper Windows application
        subprocess.check_call(['pyinstaller', '--onefile', '--windowed', '--clean', 
                              '--name=P-Type', '--add-data=ptype.manifest;.', 'ptype.py'])
        
        print("\n✅ P-Type executable built successfully!")
        print(f"📁 Executable location: {os.path.abspath('dist/P-Type.exe')}")
        
        # Check file size
        exe_path = Path('dist/P-Type.exe')
        if exe_path.exists():
            size_mb = exe_path.stat().st_size / (1024 * 1024)
            print(f"📊 File size: {size_mb:.1f} MB")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed: {e}")
        return False

def create_installer_script():
    """Create a simple installer/launcher script"""
    installer_content = """@echo off
echo.
echo ================================================
echo              P-Type Game Launcher
echo         Programming Typing Challenge
echo ================================================
echo.

REM Check if executable exists
if not exist "P-Type.exe" (
    echo ERROR: P-Type.exe not found in current directory
    echo Please make sure you extracted all files to the same folder
    pause
    exit /b 1
)

echo Starting P-Type...
echo.
echo Controls:
echo - Type the words shown on enemy ships to destroy them
echo - Use LEFT/RIGHT arrow keys to switch between ships
echo - Press ESC to pause
echo - Press F1 to access settings
echo.

REM Launch the game
start "" "P-Type.exe"

REM Optional: Wait a moment then close this window
timeout /t 2 /nobreak >nul
"""
    
    with open('dist/Launch P-Type.bat', 'w') as f:
        f.write(installer_content)
    print("✓ Created launcher script")

def create_readme():
    """Create a README file for the executable"""
    readme_content = """# P-Type - Programming Typing Challenge

## About
P-Type is an advanced typing game designed for programmers and typing enthusiasts. 
Master your coding skills while improving your typing speed!

## Features
- 🎨 Fully responsive UI that adapts to any window size
- 🚀 Modern 3D ship graphics with smooth animations
- 💻 Programming training mode with 7 languages (Python, JavaScript, Java, C#, C++, CSS, HTML)
- 📝 Normal mode with standard English dictionary words
- 👑 Epic boss battles with challenging words at level completion
- 🎯 20 progressive difficulty levels (20-300 WPM target speed)
- 🏆 High score tracking and detailed statistics
- 🎮 Advanced ship collision mechanics with visual effects
- ⚙️ Customizable audio settings
- 📊 Detailed performance analytics
- 🖱️ Smart dropdown menus with scrolling support
- ⌨️ Full keyboard support including special characters
- 🪟 Window resize support with automatic UI recalculation
- 🎯 Consistent centering and spacing across all window sizes

## How to Play
1. **Launch the game** by running `P-Type.exe` or `Launch P-Type.bat`
2. **Choose your mode**:
   - Normal Mode: Tech vocabulary and general typing
   - Programming Mode: Learn syntax while typing
3. **Select a programming language** (if using Programming Mode)
4. **Type the words** shown on enemy ships to destroy them
5. **Avoid collisions** and don't let too many ships escape!

## Controls
- **Type letters/words**: Target and destroy enemy ships
- **LEFT/RIGHT arrows**: Switch between active ships
- **ESC**: Pause game / Access settings
- **F1**: Quick settings access
- **Mouse**: Navigate menus

## Game Modes

### Normal Mode
- Beginner (Levels 1-5): Basic tech terms
- Intermediate (Levels 6-12): Medium complexity words  
- Advanced (Levels 13-20): Complex technical terminology

### Programming Mode
Each language has progressive difficulty:
- **Beginner**: Basic keywords and syntax
- **Intermediate**: Common patterns and functions
- **Advanced**: Complex expressions and frameworks

## Supported Languages
- **Python**: From basic keywords to async/await and frameworks
- **JavaScript**: ES6+ features, React, Node.js concepts
- **Java**: Object-oriented concepts, Spring Boot, streams
- **C#**: .NET Core, LINQ, async programming
- **C++**: Modern C++, STL, templates, smart pointers
- **CSS**: Flexbox, Grid, animations, modern properties
- **HTML**: HTML5, semantic markup, accessibility

## System Requirements
- Windows 10 or later
- 50 MB free disk space
- Sound card (optional, for audio effects)

## Tips for Best Performance
1. Start with beginner levels to build muscle memory
2. Focus on accuracy over speed initially
3. Use the programming mode to learn new syntax
4. Take breaks to avoid fatigue
5. Track your progress in the Stats menu

## Troubleshooting
- If the game doesn't start, make sure all files are in the same folder
- For performance issues, close other applications
- Check Windows Defender isn't blocking the executable
- Run as administrator if you encounter permission issues

## Version
v2.2 - Responsive UI Edition

## Recent Updates
- Fully responsive UI system that adapts to any window size
- Automatic UI recalculation on window resize
- Consistent centering and spacing across all screen resolutions
- Player ship always positioned correctly regardless of window size
- Enhanced window management with portrait aspect ratio maintenance
- Improved documentation and code organization

Enjoy improving your programming and typing skills while battling challenging bosses!
"""
    
    with open('dist/README.txt', 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print("✓ Created README file")

def main():
    """Main build process"""
    print("🎮 P-Type Executable Builder")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('ptype.py'):
        print("❌ Error: ptype.py not found. Please run this script from the P-Type directory.")
        return
    
    # Install PyInstaller
    install_pyinstaller()
    
    # Create spec file
    create_icon()  # This also creates the spec file
    
    # Build executable
    if build_executable():
        # Create additional files
        create_installer_script()
        create_readme()
        
        print("\n🎉 Build completed successfully!")
        print("\n📦 Distribution files:")
        print("   - dist/P-Type.exe (Main executable)")
        print("   - dist/Launch P-Type.bat (Launcher script)")
        print("   - dist/README.txt (Instructions)")
        print("\n💡 You can distribute the entire 'dist' folder to share P-Type!")
    else:
        print("\n❌ Build failed. Please check the error messages above.")

if __name__ == "__main__":
    main()