import React, { useEffect, useState } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";
import { memories } from "@/lib/api";
import { Plus, Trash2, Printer } from "lucide-react";

import ImageInput from "@/components/ImageInput";

const TRUTH = [
  { value: "certain", label: "Certain", color: "var(--accent-spore)" },
  { value: "fragmented", label: "Fragmented", color: "#c79a5b" },
  { value: "forgotten", label: "Forgotten", color: "var(--text-tertiary)" },
  { value: "altered", label: "Altered by spores", color: "var(--accent-blood)" },
];

export default function Memories() {
  const { current } = useCharacter();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => current && setItems(await memories.list({ character_id: current.id }));
  useEffect(() => { load(); }, [current?.id]);

  const create = async () => {
    const out = await memories.create({ character_id: current.id, title: "Untitled memory", date: "", description: "", location: "", characters: "", significance: 3, truth: "certain", image: "", connections: [] });
    await load(); setEditing(out);
  };
  const save = async () => { await memories.update(editing.id, editing); await load(); setEditing(null); };
  const remove = async () => { if (window.confirm("Let this memory drift?")) { await memories.remove(editing.id); await load(); setEditing(null); } };
  const printEntry = () => {
    document.body.classList.add("print-entry-mode");
    const card = document.querySelector('[data-entry-modal="memory"]');
    if (card) card.classList.add("print-selected");
    setTimeout(() => { window.print(); setTimeout(() => { document.body.classList.remove("print-entry-mode"); if (card) card.classList.remove("print-selected"); }, 500); }, 50);
  };

  if (!current) return null;
  return (
    <div data-testid="memories-page">
      <PageHeader title="Memories" subtitle="Important moments. Click an entry to connect it to others."
        action={<button className="btn-organic" onClick={create} data-testid="memory-add"><Plus size={14}/> New Memory</button>} />

      {/* Constellation layout */}
      <div className="relative min-h-[500px] bg-black/20 border border-white/5 p-6" data-testid="memory-constellation">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 0 }}>
          {items.flatMap((m, i) => {
            const a = nodePos(i, items.length);
            const connIds = m.connections || [];
            return connIds.map((cid) => {
              const j = items.findIndex((x) => x.id === cid);
              if (j === -1) return null;
              const b = nodePos(j, items.length);
              return (
                <path key={`${m.id}-${cid}`} d={`M ${a.x} ${a.y} Q 50 50 ${b.x} ${b.y}`} fill="none" stroke="var(--accent-glow)" strokeWidth="0.25" opacity="0.7" />
              );
            });
          })}
        </svg>
        {items.length === 0 && <p className="italic text-[var(--text-tertiary)] text-sm">No memories. The network forgets quickly.</p>}
        {items.map((m, i) => {
          const p = nodePos(i, Math.max(items.length, 1));
          const t = TRUTH.find((x) => x.value === m.truth) || TRUTH[0];
          const size = 40 + (m.significance || 3) * 8;
          return (
            <button
              key={m.id} onClick={() => setEditing(m)}
              data-testid={`memory-node-${m.id}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: size, height: size, transform: "translate(-50%, -50%)", boxShadow: `0 0 ${size/2}px ${t.color}`, background: `radial-gradient(circle, ${t.color} 0%, transparent 70%)` }}
              className="absolute rounded-full pulse-glow hover:scale-110 transition-transform flex items-center justify-center text-xs font-heading p-2 text-center"
            >
              <span className="line-clamp-2">{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* List view also */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {items.map((m) => {
          const t = TRUTH.find((x) => x.value === m.truth) || TRUTH[0];
          return (
            <OrganicCard key={`l-${m.id}`} testid={`memory-card-${m.id}`} className="cursor-pointer" data-print-card="" onClick={() => setEditing(m)}>
              <p className="label-arcane" style={{ color: t.color }}>{t.label}</p>
              <h3 className="font-arcane text-xl mt-1">{m.title}</h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{m.date} · {m.location}</p>
              <p className="text-sm italic mt-2 line-clamp-3">{m.description}</p>
            </OrganicCard>
          );
        })}
      </div>

      {editing && (
        <div data-entry-modal-backdrop className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto no-print" onClick={() => setEditing(null)}>
          <OrganicCard className="max-w-2xl w-full" data-entry-modal="memory" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-arcane text-2xl mb-3">{editing.title}</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2"><span className="label-arcane">Title</span><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} data-testid="memory-edit-title"/></label>
              <label><span className="label-arcane">Date</span><input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })}/></label>
              <label><span className="label-arcane">Location</span><input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })}/></label>
              <label className="col-span-2"><span className="label-arcane">Characters involved</span><input value={editing.characters} onChange={(e) => setEditing({ ...editing, characters: e.target.value })}/></label>
              <label className="col-span-2"><span className="label-arcane">Description</span><textarea rows={5} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}/></label>
              <label><span className="label-arcane">Emotional significance (1–5)</span><input type="number" min={1} max={5} value={editing.significance} onChange={(e) => setEditing({ ...editing, significance: Number(e.target.value) })}/></label>
              <label><span className="label-arcane">Truth status</span><select value={editing.truth} onChange={(e) => setEditing({ ...editing, truth: e.target.value })}>{TRUTH.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
              <label className="col-span-2"><span className="label-arcane">Image</span><ImageInput value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} testid="memory-image"/></label>
              <div className="col-span-2">
                <span className="label-arcane block mb-1">Connected memories (click to toggle)</span>
                <div className="flex flex-wrap gap-1" data-testid="memory-connections">
                  {items.filter((m) => m.id !== editing.id).map((m) => {
                    const active = (editing.connections || []).includes(m.id);
                    return (
                      <button key={m.id} type="button" onClick={() => {
                        const conn = new Set(editing.connections || []);
                        if (active) conn.delete(m.id); else conn.add(m.id);
                        setEditing({ ...editing, connections: [...conn] });
                      }} className={`text-xs px-2 py-1 border ${active ? "border-[var(--accent-glow)] text-[var(--text-magical)]" : "border-white/10 text-[var(--text-secondary)]"}`}>
                        {m.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-2 mt-4">
              <button className="btn-danger" onClick={remove}><Trash2 size={12}/> Delete</button>
              <div className="flex gap-2"><button className="btn-ghost" onClick={printEntry} data-testid="memory-print-entry"><Printer size={12}/> Export this entry</button><button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn-organic" onClick={save} data-testid="memory-save">Save</button></div>
            </div>
          </OrganicCard>
        </div>
      )}
    </div>
  );
}

function nodePos(i, total) {
  // Distribute nodes on a soft circle in 0–100% space
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
  const r = 32; // radius percent
  return { x: 50 + Math.cos(angle) * r, y: 50 + Math.sin(angle) * r };
}
