# The Mycelial Archive — PRD

## Problem
Build a dual-purpose website: an immersive lore experience and a practical D&D companion for a Wood Elf Swarm Ranger / Circle of Spores Druid. Multi-character, per-character themes, full CRUD, PDF export, fast navigation. Local-first (launcher on :5145).

## User Personas
- **Primary**: Player who wants a beautiful, themed reference during D&D sessions.
- **Secondary**: Players' friends (different PCs) — each with their own character, theme, custom section names.

## Implemented (2026-06-17)
- Backend (FastAPI + MongoDB): characters (with cascade delete + duplicate), spells (with always_prepared), creatures, diary, memories (with connections + image), dreams, fungi, recipes, deaths, ledger, resources (with restore_on rules), effects, inventory, themes, **macros**, **presets** (with /apply endpoint), rest/long, rest/short, search.
- Frontend: Sidebar nav with per-character renamable section labels; Command palette (Cmd+K); Spore canvas background; mushroom decor; mycelium-themed CSS; print stylesheet for per-page PDF export.
- Pages: Living Body dashboard, Character Sheet, Spell Archive (slots + filters + **presets/loadouts**), Inventory, Roll Macros, Creature Journal, Diary, Memories (constellation + connections), Dreams, Fungarium, Apothecary (Known/Experimental/Forbidden), Cycle of Death, The Network (force-directed graph), Activity Ledger, Themes (full editor), Characters (CRUD + duplicate + instant switch), Settings (per-PC section labels).
- Mouse-following glow REMOVED per user preference. Neutral language: New / Save / Delete (no flavour verbs).

## Bug fixes addressed
- Network.jsx: added NaN guard on `nodeCanvasObject` (no more canvas crash).
- Memories.jsx: SVG path uses numeric viewBox coords (no more % unit errors).

## Backlog (P1)
- Multi-select PDF export across entries (currently per-page).
- File upload for images (currently image URLs only).
- Hidden easter eggs & lore snippets surfaced via discovered actions.
- Mycelium SVG growth animation on section mount.
- Cycle of Death garden grows visually with more entries (CSS).

## P2
- Custom fields on every entity (basic version done via notes).
- Drag-and-drop in The Network to define explicit connections beyond memory→memory.
- Optional dice-roller that resolves macro formulas inline (currently copy-only).
