
# -*- mode: python ; coding: utf-8 -*-

from PyInstaller.utils.hooks import collect_submodules, collect_data_files

import glob
import os
# Collect data files and hidden imports for requirements
datas = collect_data_files('PIL') + collect_data_files('pytablericons')
# Add all files from assets directory
datas += [(f, f) for f in glob.glob('assets/**/*', recursive=True) if os.path.isfile(f)]
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
