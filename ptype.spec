# -*- mode: python ; coding: utf-8 -*-
import os, sys
from PyInstaller.utils.hooks import collect_submodules, collect_data_files

# Collect assets properly (no double path issue)
datas = []
base_path = os.path.abspath(os.path.join("core", "assets"))
for root, dirs, files in os.walk(base_path):
    for file in files:
        src = os.path.join(root, file)
        rel_dir = os.path.relpath(root, ".")  # <-- Only folder path, not filename
        datas.append((src, rel_dir))

# Collect data from libraries
datas += collect_data_files("PIL")
datas += collect_data_files("pytablericons")

# Hidden imports for pytablericons
hiddenimports = collect_submodules("pytablericons")

# Platform-specific icon
icon_file = None
if sys.platform == "win32":
    icon_file = os.path.join("core", "assets", "images", "ptype.ico")
elif sys.platform == "darwin":
    icon_file = os.path.join("core", "assets", "images", "ptype.icns")

# Base analysis
a = Analysis(
    ['ptype.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure)

# Executable build for all OSes
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name="ptype",
    onefile=True,          # Single executable for each OS
    console=False,
    upx=True,
    icon=icon_file if icon_file and os.path.exists(icon_file) else None
)

# Mac .app bundle only if macOS + .icns exists
if sys.platform == "darwin" and icon_file and os.path.exists(icon_file):
    app = BUNDLE(
        exe,
        name="ptype.app",
        icon=icon_file,
        bundle_identifier=None
    )
