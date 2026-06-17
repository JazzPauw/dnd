"""Local JSON-backed async DB shim — drop-in for motor for The Mycelial Archive.

Implements only the methods the app actually uses:
- db[collection].find(query, projection).to_list(n)
- db.collection.find_one(query, projection)
- db.collection.insert_one(doc)
- db.collection.update_one(query, {"$set": payload})
- db.collection.delete_one(query)
- db.collection.delete_many(query)

Data is persisted as JSON files under DATA_DIR (env or ~/.mycelial-archive).
Atomic writes via temp-file rename. Single-process, single-user.
"""
from __future__ import annotations

import asyncio
import json
import os
import tempfile
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional


def _default_dir() -> Path:
    return Path(os.environ.get("MYCELIUM_DATA_DIR") or (Path.home() / ".mycelial-archive"))


class _Cursor:
    def __init__(self, docs: List[Dict[str, Any]], projection: Optional[Dict[str, int]] = None):
        self._docs = docs
        self._projection = projection or {}

    async def to_list(self, n: int) -> List[Dict[str, Any]]:
        out = []
        for d in self._docs[:n]:
            out.append(self._apply_projection(d))
        return out

    def _apply_projection(self, d: Dict[str, Any]) -> Dict[str, Any]:
        if not self._projection:
            return dict(d)
        # only exclusion of _id used in app
        if self._projection.get("_id") == 0:
            d = {k: v for k, v in d.items() if k != "_id"}
        return dict(d)


def _match(doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
    for k, v in query.items():
        if k == "$or":
            if not any(_match(doc, sub) for sub in v):
                return False
            continue
        if isinstance(v, dict) and "$exists" in v:
            present = k in doc
            if v["$exists"] is False and present:
                return False
            if v["$exists"] is True and not present:
                return False
            continue
        if doc.get(k) != v:
            return False
    return True


class _Collection:
    def __init__(self, store: "_Store", name: str):
        self._store = store
        self._name = name

    def find(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, int]] = None) -> _Cursor:
        query = query or {}
        with self._store.lock:
            docs = [d for d in self._store.data.get(self._name, []) if _match(d, query)]
        return _Cursor(docs, projection)

    async def find_one(self, query: Dict[str, Any], projection: Optional[Dict[str, int]] = None):
        with self._store.lock:
            for d in self._store.data.get(self._name, []):
                if _match(d, query):
                    if projection and projection.get("_id") == 0:
                        return {k: v for k, v in d.items() if k != "_id"}
                    return dict(d)
        return None

    async def insert_one(self, doc: Dict[str, Any]):
        with self._store.lock:
            self._store.data.setdefault(self._name, []).append({k: v for k, v in doc.items() if k != "_id"})
            self._store._dirty()
        return type("Res", (), {"inserted_id": doc.get("id")})()

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        matched = 0
        with self._store.lock:
            for d in self._store.data.get(self._name, []):
                if _match(d, query):
                    if "$set" in update:
                        d.update(update["$set"])
                    matched = 1
                    break
            self._store._dirty()
        return type("Res", (), {"matched_count": matched, "modified_count": matched})()

    async def delete_one(self, query: Dict[str, Any]):
        deleted = 0
        with self._store.lock:
            arr = self._store.data.get(self._name, [])
            for i, d in enumerate(arr):
                if _match(d, query):
                    arr.pop(i)
                    deleted = 1
                    break
            self._store._dirty()
        return type("Res", (), {"deleted_count": deleted})()

    async def delete_many(self, query: Dict[str, Any]):
        with self._store.lock:
            arr = self._store.data.get(self._name, [])
            kept = [d for d in arr if not _match(d, query)]
            n = len(arr) - len(kept)
            self._store.data[self._name] = kept
            self._store._dirty()
        return type("Res", (), {"deleted_count": n})()


class _Store:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.lock = threading.RLock()
        self.data: Dict[str, List[Dict[str, Any]]] = {}
        self._dirty_flag = False
        if self.path.exists():
            try:
                self.data = json.loads(self.path.read_text(encoding="utf-8")) or {}
            except Exception:
                self.data = {}
        # start background writer
        self._writer_thread = threading.Thread(target=self._writer_loop, daemon=True)
        self._writer_thread.start()

    def _dirty(self):
        self._dirty_flag = True

    def _writer_loop(self):
        import time
        while True:
            time.sleep(0.5)
            if self._dirty_flag:
                self._flush()

    def _flush(self):
        with self.lock:
            tmp_fd, tmp_path = tempfile.mkstemp(dir=str(self.path.parent), prefix=".mycelium.", suffix=".tmp")
            try:
                with os.fdopen(tmp_fd, "w", encoding="utf-8") as f:
                    json.dump(self.data, f, ensure_ascii=False, indent=2)
                os.replace(tmp_path, self.path)
            finally:
                if os.path.exists(tmp_path):
                    try: os.unlink(tmp_path)
                    except OSError: pass
            self._dirty_flag = False


class LocalDB:
    """Behaves like motor.AsyncIOMotorClient[db_name]."""
    def __init__(self, store: _Store):
        self._store = store
        self._cols: Dict[str, _Collection] = {}

    def __getitem__(self, name: str) -> _Collection:
        if name not in self._cols:
            self._cols[name] = _Collection(self._store, name)
        return self._cols[name]

    def __getattr__(self, name: str) -> _Collection:
        return self[name]


class LocalClient:
    """Behaves like motor.AsyncIOMotorClient."""
    def __init__(self, data_dir: Optional[Path] = None):
        data_dir = data_dir or _default_dir()
        data_dir.mkdir(parents=True, exist_ok=True)
        self._dir = data_dir

    def __getitem__(self, db_name: str) -> LocalDB:
        store = _Store(self._dir / f"{db_name}.json")
        return LocalDB(store)

    def close(self):
        pass
