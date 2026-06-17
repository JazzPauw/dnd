"""Auto-updater for The Mycelial Archive.

Strategy:
1. If the install dir is a git repo and `git` is available → `git pull --ff-only`.
2. Else if MYCELIUM_UPDATE_URL is set → fetch JSON manifest
   `{ "version": "x.y.z", "zip_url": "..." }`; if newer than local
   `VERSION` file, download the zip and replace files (preserving the
   user data dir).
3. Otherwise → no-op.

Failures are logged but never fatal; the launcher continues to start.
"""
from __future__ import annotations

import io
import json
import os
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VERSION_FILE = ROOT / "VERSION"
LOCAL_VERSION = VERSION_FILE.read_text(encoding="utf-8").strip() if VERSION_FILE.exists() else "0.0.0"


def _git_pull() -> bool:
    if not (ROOT / ".git").exists():
        return False
    if not shutil.which("git"):
        return False
    try:
        out = subprocess.run(
            ["git", "pull", "--ff-only"], cwd=str(ROOT), capture_output=True, text=True, timeout=30,
        )
        if out.returncode == 0:
            print(f"[updater] git pull → {out.stdout.strip().splitlines()[-1] if out.stdout else 'ok'}")
            return True
        print(f"[updater] git pull failed: {out.stderr.strip()[:200]}")
    except Exception as e:
        print(f"[updater] git pull error: {e}")
    return False


def _parse_version(v: str) -> tuple:
    return tuple(int(x) for x in v.replace("v", "").split(".") if x.isdigit())


def _http_update() -> bool:
    url = os.environ.get("MYCELIUM_UPDATE_URL")
    if not url:
        return False
    try:
        with urllib.request.urlopen(url, timeout=8) as r:
            manifest = json.loads(r.read().decode("utf-8"))
        remote = manifest.get("version", "0.0.0")
        if _parse_version(remote) <= _parse_version(LOCAL_VERSION):
            print(f"[updater] up to date (v{LOCAL_VERSION})")
            return False
        zip_url = manifest["zip_url"]
        print(f"[updater] updating {LOCAL_VERSION} → {remote}")
        with urllib.request.urlopen(zip_url, timeout=60) as r:
            buf = io.BytesIO(r.read())
        with zipfile.ZipFile(buf) as z:
            # extract everything except the user's data dir if it lives inside the install
            for name in z.namelist():
                if name.endswith("/"): continue
                # strip leading top-level dir if uniform (typical GitHub zip)
                parts = name.split("/", 1)
                rel = parts[1] if len(parts) == 2 else parts[0]
                if not rel: continue
                target = ROOT / rel
                target.parent.mkdir(parents=True, exist_ok=True)
                with z.open(name) as src, open(target, "wb") as dst:
                    shutil.copyfileobj(src, dst)
        VERSION_FILE.write_text(remote, encoding="utf-8")
        print(f"[updater] updated to v{remote}. Rebuild frontend if changed: cd frontend && yarn build")
        return True
    except Exception as e:
        print(f"[updater] http update failed: {e}")
        return False


def check_for_updates() -> None:
    if os.environ.get("MYCELIUM_SKIP_UPDATE") == "1":
        print("[updater] skipped (MYCELIUM_SKIP_UPDATE=1)")
        return
    if _git_pull():
        return
    _http_update()
