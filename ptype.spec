
# -*- mode: python ; coding: utf-8 -*-


import os
from PyInstaller.utils.hooks import collect_submodules, collect_data_files

# Collect all files from assets directory (recursively)
datas = []
for root, dirs, files in os.walk('assets'):
    for file in files:
        datas.append((os.path.join(root, file), os.path.join(root, file)))

# Add PIL and pytablericons data files
datas += collect_data_files('PIL')
datas += collect_data_files('pytablericons')

hiddenimports = collect_submodules('pytablericons')

a = Analysis(
    ['ptype.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
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
app = BUNDLE(
    exe,
    name='ptype.app',
    icon=None,
    bundle_identifier=None,
)
