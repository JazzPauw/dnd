#!/usr/bin/env bash
# Build a single-file MycelialArchive binary for the current platform.
set -e
cd "$(dirname "$0")"

echo "[build] installing build deps…"
python3 -m pip install --quiet --user pyinstaller
python3 -m pip install --quiet --user -r backend/requirements.txt

echo "[build] building frontend (must succeed before packaging)…"
cd frontend
if [ ! -d node_modules ]; then yarn install --silent; fi
yarn build
cd ..

echo "[build] running PyInstaller…"
python3 -m PyInstaller --clean --noconfirm mycelial.spec

echo
echo "[build] done → dist/MycelialArchive"
echo "        Distribute the dist/ binary to friends; they only need to double-click it."
