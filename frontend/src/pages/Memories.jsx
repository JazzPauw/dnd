import React, { useEffect, useState } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";
import { memories } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";

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
    const out = await memories.create({ character_id: current.id, title: "Untitled memory", date: "", description: "", location: "", characters: "", significance: 3, truth: "certain" });
    await load(); setEditing(out);
  };
  const save = async () => { await memories.update(editing.id, editing); await load(); setEditing(null); };
  const remove = async () => { if (window.confirm("Let this memory drift?")) { await memories.remove(editing.id); await load(); setEditing(null); } };

  if (!current) return null;
  return (
    <div data-testid="memories-page">
      <PageHeader title="Memories" subtitle="Glowing nodes in a network of self. Some pulse brighter than others."
        action={<button className="btn-organic" onClick={create} data-testid="memory-add"><Plus size={14}/> Imprint</button>} />

      {/* Constellation layout */}
      <div className="relative min-h-[500px] bg-black/20 border border-white/5 p-6" data-testid="memory-constellation">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {items.length > 1 && items.map((m, i) => {
            const next = items[(i + 1) % items.length];
            const a = nodePos(i, items.length);
            const b = nodePos((i + 1) % items.length, items.length);
            return (
              <path key={m.id} d={`M ${a.x}% ${a.y}% Q 50% 50% ${b.x}% ${b.y}%`} fill="none" stroke="var(--accent-mycelium)" strokeWidth="0.6" opacity="0.6" />
            );
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
            <OrganicCard key={`l-${m.id}`} testid={`memory-card-${m.id}`} className="cursor-pointer" onClick={() => setEditing(m)}>
              <p className="label-arcane" style={{ color: t.color }}>{t.label}</p>
              <h3 className="font-arcane text-xl mt-1">{m.title}</h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{m.date} · {m.location}</p>
              <p className="text-sm italic mt-2 line-clamp-3">{m.description}</p>
            </OrganicCard>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto" onClick={() => setEditing(null)}>
          <OrganicCard className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-arcane text-2xl mb-3">{editing.title}</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2"><span className="label-arcane">Title</span><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} data-testid="memory-edit-title"/></label>
              <label><span className="label-arcane">Date</span><input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })}/></label>
              <label><span className="label-arcane">Location</span><input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })}/></label>
              <label className="col-span-2"><span className="label-arcane">Characters involved</span><input value={editing.characters} onChange={(e) => setEditing({ ...editing, characters: e.target.value })}/></label>
              <label className="col-span-2"><span className="label-arcane">Description</span><textarea rows={5} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}/></label>
              <label><span className="label-arcane">Emotional significance (1–5)</span><input type="number" min={1} max={5} value={editing.significance} onChange={(e) => setEditing({ ...editing, significance: Number(e.target.value) })}/></label>
              <label><span className="label-arcane">Truth status</span><select value={editing.truth} onChange={(e) => setEditing({ ...editing, truth: e.target.value })}>{TRUTH.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
            </div>
            <div className="flex justify-between gap-2 mt-4">
              <button className="btn-danger" onClick={remove}><Trash2 size={12}/> Forget</button>
              <div className="flex gap-2"><button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn-organic" onClick={save} data-testid="memory-save">Preserve</button></div>
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
