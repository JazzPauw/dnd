import React, { useEffect, useState } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";
import { ledger } from "@/lib/api";
import { Trash2 } from "lucide-react";

export default function Ledger() {
  const { current } = useCharacter();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const load = async () => current && setItems(await ledger.list({ character_id: current.id }));
  useEffect(() => { load(); }, [current?.id]);

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category || "misc")))];
  const filtered = items.filter((i) => (cat === "all" || (i.category || "misc") === cat) && (!q || `${i.description}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div data-testid="ledger-page">
      <PageHeader title="Activity Ledger" subtitle="Every rest, every cast, every memory — the network records." />
      <div className="flex gap-2 mb-4">
        <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="!w-64" data-testid="ledger-search"/>
        <select value={cat} onChange={(e) => setCat(e.target.value)} data-testid="ledger-category">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="relative">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-[var(--accent-mycelium)] opacity-50" />
        <div className="space-y-2">
          {filtered.length === 0 && <p className="italic text-[var(--text-tertiary)] text-sm pl-8">The ledger is unmarked. Live, and it will fill.</p>}
          {filtered.map((it) => (
            <div key={it.id} className="pl-8 relative" data-testid={`ledger-entry-${it.id}`}>
              <span className="absolute left-2 top-3 w-3 h-3 rounded-full bg-[var(--accent-spore)] shadow-[0_0_10px_var(--accent-glow)]" />
              <OrganicCard className="!p-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="label-arcane">{new Date(it.timestamp).toLocaleString()} · {it.category}</p>
                    <p className="text-sm mt-1 italic">{it.description}</p>
                  </div>
                  <button className="btn-ghost p-1" onClick={async () => { await ledger.remove(it.id); load(); }} data-testid={`ledger-delete-${it.id}`}><Trash2 size={12}/></button>
                </div>
              </OrganicCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
