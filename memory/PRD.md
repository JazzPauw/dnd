# The Mycelial Archive — PRD

## Original problem statement
Continue The Mycelial Archive (codebase pulled from github.com/JazzPauw/dnd). Four tasks:
1. Print-safe PDF mode (white background) toggle near export-pdf-btn
2. Per-entry PDF export buttons inside every edit modal (Diary, Dreams, Creatures, Fungarium, Spells, Memories, Apothecary, Cycle of Death)
3. Make always_prepared prominent in Spells with renamed label + help text
4. Rewrite /app/README.md as a non-technical 4-part guide

Follow-up: replace browser print with custom client-side PDF generator (true vector, theme-aware).

## Architecture
- Frontend: React + Tailwind + shadcn/ui (CRA via craco) at /app/frontend
- Backend: FastAPI + local Mongo at /app/backend (server.py, local_db.py)
- Distribution: launcher.py launches the local stack + opens the browser (desktop app feel)
- PDF generation: @react-pdf/renderer client-side, no server roundtrip, no print dialog

## What's implemented (2026-06-17)
- Print-safe toggle: "Light PDF (white paper)" checkbox on every page header. Toggling adds/removes `body.print-safe` which is read by the PDF generator to switch between dark and light vector themes (does NOT alter on-screen view).
- Per-entry PDF export ("Export this entry"): wired in Spells, Memories, Apothecary, CycleOfDeath, and via EntityPage for Diary, Dreams, Creatures, Fungarium. Replaces window.print() entirely with @react-pdf/renderer. Downloads `<type>-<slug>.pdf` directly, no browser dialog.
- /app/frontend/src/lib/pdfExport.jsx — generic Document template + per-entity layout map (kicker, title, subtitle, meta grid, pills, sections, image, footer with page number). Uses built-in Times-Roman/Helvetica fonts (no external font fetches, offline-safe).
- Spells: prominent "Concurrent (always prepared — e.g. Ranger spells)" row with bordered/glow container + help text + data-testid="spell-always-prepared", placed above the prepared/concentration/ritual row.
- /app/README.md: rewritten as a non-technical 4-part guide (install, daily launch, backup, troubleshooting).
- Removed: page-level "Export this page" button and Spells multi-select print mode (replaced by per-entry PDF).

## Testing
- Backend: 10/10 pass (CRUD across all entity types, always_prepared persists). Report: /app/backend/tests/test_mycelium_api.py
- Frontend: per-entry export buttons present on all 8 entity types; download verified via Playwright for dark + light PDF (both files generated, content validated via PDF extraction). Print-safe toggle adds/removes body class as expected.

## Next / Backlog
- P2: Optional cover page (character portrait + name + date) when batch-exporting multiple entries
- P2: Full-page export (e.g. "all spells as one PDF") — currently scoped out per user request
- P2: Inline preview of the PDF before download (react-pdf PDFViewer)
- P3: Per-entity theme variants (e.g. parchment for Diary, ink-on-vellum for Spells)
- P3: Extract duplicated `printEntry` helpers into a shared hook
