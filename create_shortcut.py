"""Creates a desktop shortcut for The Mycelial Archive.

- Linux: writes a .desktop file to ~/.local/share/applications/
- macOS: writes a launcher .command to ~/Desktop/
- Windows: writes a .vbs shortcut creator + a .bat to the Desktop

Run once after install:
    python3 create_shortcut.py
"""
from __future__ import annotations

import os
import platform
import stat
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PY = sys.executable
LAUNCHER = ROOT / "launcher.py"
ICON = ROOT / "frontend" / "public" / "favicon.ico"


def _linux() -> Path:
    d = Path.home() / ".local" / "share" / "applications"
    d.mkdir(parents=True, exist_ok=True)
    target = d / "mycelial-archive.desktop"
    target.write_text(
        f"""[Desktop Entry]
Type=Application
Name=The Mycelial Archive
Comment=Immersive D&D companion
Exec={PY} {LAUNCHER}
Path={ROOT}
Icon={ICON if ICON.exists() else 'utilities-terminal'}
Terminal=false
Categories=Game;Utility;
StartupNotify=true
""",
        encoding="utf-8",
    )
    target.chmod(0o755)
    return target


def _macos() -> Path:
    d = Path.home() / "Desktop"
    target = d / "Mycelial Archive.command"
    target.write_text(
        f"""#!/usr/bin/env bash
cd "{ROOT}"
exec "{PY}" "{LAUNCHER}"
""",
        encoding="utf-8",
    )
    target.chmod(target.stat().st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH)
    return target


def _windows() -> Path:
    desktop = Path(os.path.expanduser("~/Desktop"))
    bat = desktop / "Mycelial Archive.bat"
    bat.write_text(
        f"""@echo off
cd /d "{ROOT}"
start "" "{PY}" "{LAUNCHER}"
""",
        encoding="utf-8",
    )
    return bat


def main() -> None:
    sysname = platform.system().lower()
    if "linux" in sysname:
        p = _linux()
    elif "darwin" in sysname:
        p = _macos()
    elif "windows" in sysname:
        p = _windows()
    else:
        print(f"[!] unsupported platform: {sysname}")
        sys.exit(1)
    print(f"[mycelium] desktop launcher created at {p}")


if __name__ == "__main__":
    main()
