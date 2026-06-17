# PyInstaller spec for The Mycelial Archive launcher.
# Build:  pyinstaller mycelial.spec
# Output: dist/MycelialArchive(.exe)
#
# Notes:
# - Bundles backend/, updater.py, VERSION, and the pre-built frontend/build/.
# - The user must run `cd frontend && yarn build` once before packaging.
# - Resulting binary still needs Python's stdlib only (uvicorn is bundled).
# - Data still lives in ~/.mycelial-archive/.

import sys
from pathlib import Path

block_cipher = None
ROOT = Path(SPECPATH).resolve()

datas = [
    (str(ROOT / "backend"), "backend"),
    (str(ROOT / "frontend" / "build"), "frontend/build"),
    (str(ROOT / "VERSION"), "."),
    (str(ROOT / "updater.py"), "."),
]

a = Analysis(
    ["launcher.py"],
    pathex=[str(ROOT)],
    binaries=[],
    datas=datas,
    hiddenimports=[
        "uvicorn", "uvicorn.logging", "uvicorn.protocols",
        "uvicorn.protocols.http", "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets", "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan", "uvicorn.lifespan.on", "uvicorn.loops",
        "uvicorn.loops.auto",
        "fastapi", "pydantic", "pydantic_core", "dotenv", "motor",
        "starlette", "anyio", "sniffio",
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    cipher=block_cipher,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz, a.scripts,
    a.binaries, a.zipfiles, a.datas,
    [],
    name="MycelialArchive",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    runtime_tmpdir=None,
    console=True,  # keep console so first-run setup logs are visible
    disable_windowed_traceback=False,
)
