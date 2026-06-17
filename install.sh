#!/usr/bin/env bash
# The Mycelial Archive — one-time installer
set -e
cd "$(dirname "$0")"

echo "[mycelium] installing backend deps…"
python3 -m pip install --user -r backend/requirements.txt

echo "[mycelium] building frontend…"
cd frontend
if ! command -v yarn >/dev/null 2>&1; then
  echo "[!] yarn not found. Install Node 18+ and yarn (npm i -g yarn), then re-run."
  exit 1
fi
yarn install --silent
yarn build
cd ..

echo
echo "[mycelium] installed."
echo "         Run:        python3 launcher.py"
echo "         Shortcut:   python3 create_shortcut.py"
echo "         Data:       ~/.mycelial-archive/"
