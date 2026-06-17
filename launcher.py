"""The Mycelial Archive — local launcher.

Starts the FastAPI backend with JSON-file storage and serves the built
React frontend on http://localhost:5145. All data lives in
~/.mycelial-archive/ (override with MYCELIUM_DATA_DIR env var).

USAGE
    python launcher.py            # serves on :5145 and :8001
    MYCELIUM_FRONT_PORT=7000 python launcher.py

First-time setup
    cd backend  && pip install -r requirements.txt
    cd frontend && yarn install && yarn build
    python launcher.py
"""
from __future__ import annotations

import http.server
import json
import os
import socket
import socketserver
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FRONT_BUILD = ROOT / "frontend" / "build"
BACKEND_DIR = ROOT / "backend"

FRONT_PORT = int(os.environ.get("MYCELIUM_FRONT_PORT", "5145"))
BACK_PORT = int(os.environ.get("MYCELIUM_BACK_PORT", "8001"))
DATA_DIR = Path(os.environ.get("MYCELIUM_DATA_DIR") or (Path.home() / ".mycelial-archive"))


def _wait_port(port: int, host: str = "127.0.0.1", timeout: float = 20.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.4)
            try:
                s.connect((host, port))
                return True
            except OSError:
                time.sleep(0.2)
    return False


def _patch_frontend_env() -> None:
    """Build was made with a remote REACT_APP_BACKEND_URL; rewrite the
    compiled JS so it points at our local backend instead."""
    static = FRONT_BUILD / "static" / "js"
    if not static.exists():
        return
    needle_pool = [
        "https://the-mycelium.preview.emergentagent.com",
    ]
    replacement = f"http://localhost:{BACK_PORT}"
    for js in static.glob("*.js"):
        try:
            txt = js.read_text(encoding="utf-8")
        except Exception:
            continue
        changed = False
        for needle in needle_pool:
            if needle in txt:
                txt = txt.replace(needle, replacement)
                changed = True
        if changed:
            js.write_text(txt, encoding="utf-8")


def start_backend() -> subprocess.Popen:
    env = os.environ.copy()
    env["MYCELIUM_LOCAL"] = "1"
    env["MYCELIUM_DATA_DIR"] = str(DATA_DIR)
    env.setdefault("DB_NAME", "mycelial_archive")
    env.setdefault("CORS_ORIGINS", f"http://localhost:{FRONT_PORT},http://127.0.0.1:{FRONT_PORT}")
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "server:app",
         "--host", "127.0.0.1", "--port", str(BACK_PORT), "--log-level", "warning"],
        cwd=str(BACKEND_DIR), env=env,
    )


class SPAHandler(http.server.SimpleHTTPRequestHandler):
    """SPA handler: proxies /api/* to the backend; falls back to index.html."""

    def log_message(self, fmt: str, *args) -> None:  # quieter logs
        return

    def _proxy(self) -> None:
        target = f"http://127.0.0.1:{BACK_PORT}{self.path}"
        try:
            body = None
            if self.command in ("POST", "PUT", "DELETE"):
                length = int(self.headers.get("Content-Length", "0") or 0)
                body = self.rfile.read(length) if length else b""
            req = urllib.request.Request(target, data=body, method=self.command)
            for h in ("Content-Type", "Authorization"):
                if h in self.headers:
                    req.add_header(h, self.headers[h])
            with urllib.request.urlopen(req, timeout=30) as resp:
                self.send_response(resp.status)
                for k, v in resp.getheaders():
                    if k.lower() in ("transfer-encoding", "content-encoding", "connection"):
                        continue
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(resp.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(502)
            self.end_headers()
            self.wfile.write(f"backend unavailable: {e}".encode())

    def do_GET(self):  # noqa: N802
        if self.path.startswith("/api"):
            return self._proxy()
        path = self.translate_path(self.path.split("?", 1)[0])
        if not Path(path).is_file():
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self): self._proxy()         # noqa: N802
    def do_PUT(self): self._proxy()          # noqa: N802
    def do_DELETE(self): self._proxy()       # noqa: N802


class ThreadingServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


def start_frontend() -> None:
    if not FRONT_BUILD.exists():
        print(f"\n[!] frontend build not found at {FRONT_BUILD}")
        print("    run: cd frontend && yarn install && yarn build\n")
        sys.exit(1)
    _patch_frontend_env()
    os.chdir(str(FRONT_BUILD))
    httpd = ThreadingServer(("127.0.0.1", FRONT_PORT), SPAHandler)
    url = f"http://localhost:{FRONT_PORT}"
    print(f"\n[mycelium] data dir: {DATA_DIR}")
    print(f"[mycelium] archive blooming at {url}\n")
    threading.Timer(1.2, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        from updater import check_for_updates
        check_for_updates()
    except Exception as e:
        print(f"[updater] skipped: {e}")
    print("[mycelium] starting backend (local JSON storage)…")
    proc = start_backend()
    try:
        if not _wait_port(BACK_PORT, timeout=20):
            print("[!] backend did not start in time"); proc.terminate(); sys.exit(1)
        start_frontend()
    finally:
        proc.terminate()
        try: proc.wait(timeout=3)
        except subprocess.TimeoutExpired: proc.kill()


if __name__ == "__main__":
    main()
