import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch } from "@/lib/api";
import { useCharacter } from "@/contexts/CharacterContext";
import { Search, X } from "lucide-react";

const ROUTES = {
  spells: "/spells", creatures: "/creatures", diary: "/diary", memories: "/memories",
  dreams: "/dreams", fungi: "/fungarium", recipes: "/apothecary", deaths: "/cycle",
  ledger: "/ledger", inventory: "/sheet",
};

export default function CommandPalette({ open, onClose }) {
  const { current } = useCharacter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    if (!open) return;
    setQ("");
    setResults([]);
    const t = setTimeout(() => {
      const el = document.getElementById("cmdk-input");
      if (el) el.focus();
    }, 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || !current) return;
    if (!q) { setResults([]); return; }
    const handle = setTimeout(async () => {
      try {
        const data = await globalSearch(current.id, q);
        setResults(data);
      } catch (e) { /* noop */ }
    }, 120);
    return () => clearTimeout(handle);
  }, [q, current, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] no-print" data-testid="command-palette">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-2xl mx-auto mt-[12vh] organic-card grow-in" style={{ background: "rgba(10,12,10,0.95)" }}>
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <Search size={16} className="text-[var(--accent-spore)]" />
          <input
            id="cmdk-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search memories, spells, creatures…"
            className="!border-0 !bg-transparent !p-0 text-lg font-heading flex-1"
            data-testid="cmdk-input"
          />
          <button onClick={onClose} className="btn-ghost p-1" data-testid="cmdk-close"><X size={14} /></button>
        </div>
        <div className="mt-3 max-h-[50vh] overflow-y-auto">
          {results.length === 0 && q && (
            <p className="text-sm text-[var(--text-tertiary)] py-6 text-center italic">No spores carry that name…</p>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.collection}-${r.id}-${i}`}
              onClick={() => { onClose(); nav(ROUTES[r.collection] || "/"); }}
              data-testid={`cmdk-result-${i}`}
              className="w-full text-left px-3 py-2 hover:bg-white/5 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-base">{r.title || "Untitled"}</span>
                <span className="label-arcane">{r.collection}</span>
              </div>
              {r.snippet && <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-1">{r.snippet}</p>}
            </button>
          ))}
        </div>
        <p className="label-arcane mt-3">Press ESC to close</p>
      </div>
    </div>
  );
}
