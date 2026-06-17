#!/usr/bin/env python3
"""The Mycelial Archive — local launcher.

Starts MongoDB-backed FastAPI on :8001 and serves the built frontend
on :5145. Run `python launcher.py` after `cd frontend && yarn build`.

Requires a running MongoDB on MONGO_URL (default: mongodb://localhost:27017).
"""
from __future__ import annotations

import http.server
import os
import socketserver
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FRONT = ROOT / "frontend" / "build"
BACK = ROOT / "backend"

FRONT_PORT = int(os.environ.get("MYCELIUM_FRONT_PORT", "5145"))
BACK_PORT = int(os.environ.get("MYCELIUM_BACK_PORT", "8001"))


def start_backend() -> subprocess.Popen:
    env = os.environ.copy()
    env.setdefault("MONGO_URL", "mongodb://localhost:27017")
    env.setdefault("DB_NAME", "mycelial_archive")
    env.setdefault("CORS_ORIGINS", f"http://localhost:{FRONT_PORT}")
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", str(BACK_PORT)],
        cwd=str(BACK), env=env,
    )


class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        # Proxy /api to backend
        if self.path.startswith("/api"):
            self.send_response(502)
            self.end_headers()
            self.wfile.write(b"Use backend directly at http://localhost:%d/api" % BACK_PORT)
            return
        # Serve SPA: fall back to index.html for unknown routes
        path = self.translate_path(self.path)
        if not Path(path).exists():
            self.path = "/index.html"
        return super().do_GET()


def start_frontend() -> None:
    if not FRONT.exists():
        print(f"[!] Frontend build not found at {FRONT}.")
        print("    Run: cd frontend && yarn build")
        sys.exit(1)
    os.chdir(str(FRONT))
    handler = SPAHandler
    with socketserver.TCPServer(("0.0.0.0", FRONT_PORT), handler) as httpd:
        url = f"http://localhost:{FRONT_PORT}"
        print(f"[mycelium] archive blooming at {url}")
        threading.Timer(1.4, lambda: webbrowser.open(url)).start()
        httpd.serve_forever()


def main() -> None:
    print("[mycelium] starting backend…")
    proc = start_backend()
    try:
        time.sleep(2)
        start_frontend()
    finally:
        proc.terminate()


if __name__ == "__main__":
    main()
