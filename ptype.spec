# -*- mode: python ; coding: utf-8 -*-
import os, sys
from PyInstaller.utils.hooks import collect_submodules, collect_data_files

# Collect assets recursively
datas = []
base_path = os.path.abspath("assets")
for root, dirs, files in os.walk(base_path):
    for file in files:
        src = os.path.join(root, file)
        rel_path = os.path.relpath(src, ".")
        datas.append((src, rel_path))

# Collect library data
datas += collect_data_files("PIL")
datas += collect_data_files("pytablericons")

# Hidden imports
hiddenimports = collect_submodules("pytablericons")

# Icon detection
icon_file = None
if sys.platform == "win32":
    icon_file = "assets/images/ptype.ico"
elif sys.platform == "darwin":
    icon_file = "assets/images/ptype.icns"

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
    onefile=True,       # single-file exe
    console=False,      # no console
    upx=True,           # compress binary
    icon=icon_file if icon_file and os.path.exists(icon_file) else None
)

# Only create Mac bundle if icon exists
if sys.platform == "darwin" and icon_file and os.path.exists(icon_file):
    app = BUNDLE(
        exe,
        name="ptype.app",
        icon=icon_file,
        bundle_identifier=None
    )
