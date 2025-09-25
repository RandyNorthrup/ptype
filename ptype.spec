# -*- mode: python ; coding: utf-8 -*-
import os
from PyInstaller.utils.hooks import collect_submodules, collect_data_files

# Absolute path for assets
base_path = os.path.abspath("assets")

# Collect all files from assets preserving folder structure
datas = []
for root, dirs, files in os.walk(base_path):
    for file in files:
        src = os.path.join(root, file)
        rel_path = os.path.relpath(src, ".")
        datas.append((src, rel_path))

# Collect extra data from dependencies
datas += collect_data_files('PIL')
datas += collect_data_files('pytablericons')

# Collect submodules for pytablericons
hiddenimports = collect_submodules('pytablericons')

# Detect platform to set proper icon
import sys
if sys.platform == "win32":
    icon_file = "assets/images/ptype.ico"
elif sys.platform == "darwin":
    icon_file = "assets/images/ptype.icns"
else:
    icon_file = None

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

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='ptype',
    onefile=True,        # single-file executable
    console=False,       # no console window
    upx=True,            # compress binary if UPX available
    icon=icon_file,      # platform-specific icon
)

# On macOS, wrap in a .app bundle
if sys.platform == "darwin":
    app = BUNDLE(
        exe,
        name='ptype.app',
        icon=icon_file,
        bundle_identifier=None,
    )
