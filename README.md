# The Mycelial Archive

An immersive D&D companion and personal lore wiki for a Wood Elf Swarm Ranger / Circle of Spores Druid — designed to feel like a living mycelial network.

## Run Locally

Prereqs: MongoDB running locally (default `mongodb://localhost:27017`), Python 3.10+, Node 18+, Yarn.

```bash
# 1. Backend deps
cd backend && pip install -r requirements.txt && cd ..

# 2. Frontend build
cd frontend && yarn install && yarn build && cd ..

# 3. Launch (serves UI on :5145, API on :8001, opens browser)
python launcher.py
```

Visit `http://localhost:5145`.

## Features

- Living Body dashboard (HP, AC, custom resources, rest animations)
- Character Sheet (attributes, skills, currency, languages)
- Spell Archive (slots, filters, concentration, ritual)
- Creature Journal, Diary, Memories, Dreams
- Fungarium, Apothecary (Known / Experimental / Forbidden)
- Cycle of Death (a garden, not a graveyard)
- The Network: interactive force-directed graph linking everything
- Activity Ledger, Global Search (Cmd+K), PDF export (window.print)
- Multi-character + per-character themes
