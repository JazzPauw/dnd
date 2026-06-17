# The Mycelial Archive

An immersive D&D companion and personal lore wiki — designed to feel like a living mycelial network. Local-first, no database required.

## Quick start

Prereqs: **Python 3.10+**, **Node 18+**, **Yarn** (`npm i -g yarn`).

```bash
python3 launcher.py            # installs deps, builds frontend, opens http://localhost:5145
python3 create_shortcut.py     # optional: desktop launcher
```

## Single-file binary (for sharing with friends)

Build once, then share `dist/MycelialArchive` (or `MycelialArchive.exe` on Windows) — recipients only need to double-click; no Python or Node required.

```bash
./build_installer.sh           # Linux / macOS  → dist/MycelialArchive
build_installer.bat            # Windows        → dist\MycelialArchive.exe
```

The launcher handles initial setup automatically on first run:
1. Installs missing backend Python deps.
2. Installs frontend node_modules and builds the React app if `frontend/build` is missing.
3. Checks for updates (`git pull` if it's a repo, or `MYCELIUM_UPDATE_URL` manifest).
4. Starts the backend with local JSON storage on `127.0.0.1:8001`.
5. Serves the frontend on **http://localhost:5145** and opens your browser.

Data is saved as JSON in `~/.mycelial-archive/` (override with `MYCELIUM_DATA_DIR`).

## Updates

Set `MYCELIUM_UPDATE_URL` to a JSON manifest URL (`{"version":"x.y.z","zip_url":"..."}`) to enable auto-updates from a release server. Set `MYCELIUM_SKIP_UPDATE=1` to disable. If installed via git, `git pull` is used instead.

## Features

Living Body dashboard · Character Sheet · Spell Archive (slots, filters, always_prepared, preset loadouts, multi-select PDF export) · Inventory · Roll Macros · Creature Journal · Diary · Memories (constellation + connections) · Dreams · Fungarium · Apothecary · Cycle of Death · The Network (force-directed graph) · Activity Ledger · Global Search (Cmd+K) · Per-character themes & renameable sections · Import / Export character archive (overwrites by id) · Local file image uploads.
