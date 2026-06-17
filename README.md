# The Mycelial Archive

An immersive D&D companion and personal lore wiki for a Wood Elf Swarm Ranger / Circle of Spores Druid — designed to feel like a living mycelial network.

## Run locally (no database required)

Prereqs: **Python 3.10+**, **Node 18+**, **Yarn** (`npm i -g yarn`). No MongoDB needed.

```bash
# 1. One-time install
./install.sh              # Linux / macOS
install.bat               # Windows

# 2. Launch (opens browser at http://localhost:5145)
python3 launcher.py
```

All data is saved locally as JSON in:

- Linux/macOS: `~/.mycelial-archive/`
- Windows: `%USERPROFILE%\.mycelial-archive\`

Override with `MYCELIUM_DATA_DIR=/some/path python3 launcher.py`.

Customize ports:

```bash
MYCELIUM_FRONT_PORT=5145 MYCELIUM_BACK_PORT=8001 python3 launcher.py
```

## Features

- **Living Body** — HP, AC, custom resources, Long/Short Rest with animations
- **Character Sheet** — attributes, skills (click-to-roll), currency
- **Spell Archive** — slots, filters, `always_prepared`, save/apply preset loadouts
- **Inventory** — table with weight totals, attunement, equipped
- **Roll Macros** — Roll20-style formulas, one-click copy
- **Creature Journal**, **Diary**, **Memories** (constellation with explicit connections), **Dreams**
- **Fungarium**, **Apothecary** (Known/Experimental/Forbidden)
- **Cycle of Death** — a garden, not a graveyard
- **The Network** — interactive force-directed graph
- **Activity Ledger**, Global Search (Cmd+K), PDF export (per page)
- **Multi-character** with per-character themes and renameable section labels (Settings)
