# The Mycelial Archive

An immersive D&D companion and personal lore wiki — designed to feel like a living mycelial network. Local-first, no database required.

## Install

Prereqs: **Python 3.10+**, **Node 18+**, **Yarn** (`npm i -g yarn`).

```bash
# Linux / macOS
./install.sh
python3 create_shortcut.py     # adds desktop launcher
python3 launcher.py            # opens http://localhost:5145

# Windows
install.bat
python create_shortcut.py
python launcher.py
```

Data is saved as JSON in `~/.mycelial-archive/` (override with `MYCELIUM_DATA_DIR`).

## Updates

The launcher auto-checks for updates on every start:
- If the install dir is a **git** repo → `git pull --ff-only`.
- Else if `MYCELIUM_UPDATE_URL` is set to a JSON manifest URL (`{ "version": "x.y.z", "zip_url": "..." }`) → downloads & extracts the newer zip.
- Set `MYCELIUM_SKIP_UPDATE=1` to disable.

After an update that changes the frontend, run `cd frontend && yarn build` once.

## Features

Living Body dashboard · Character Sheet · Spell Archive (slots, filters, always_prepared, preset loadouts, **multi-select PDF export**) · Inventory · Roll Macros · Creature Journal · Diary · Memories (constellation + connections) · Dreams · Fungarium · Apothecary · Cycle of Death · The Network (force-directed graph) · Activity Ledger · Global Search (Cmd+K) · Per-character themes & renamable sections · **Import / Export character archive** (overwrites existing) · **Image upload** (local file → embedded data URL).
