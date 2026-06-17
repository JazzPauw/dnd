import React, { useEffect, useMemo, useState } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";
import { recipes } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";

const CATEGORIES = [
  { key: "known", label: "Known Recipes" },
  { key: "experimental", label: "Experimental" },
  { key: "forbidden", label: "Forbidden" },
];

export default function Apothecary() {
  const { current } = useCharacter();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("known");
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");

  const load = async () => current && setItems(await recipes.list({ character_id: current.id }));
  useEffect(() => { load(); }, [current?.id]);

  const filtered = useMemo(() => items.filter((r) => (r.category || "known") === tab && (!q || `${r.name} ${r.effects}`.toLowerCase().includes(q.toLowerCase()))), [items, tab, q]);

  const create = async () => {
    const out = await recipes.create({ character_id: current.id, name: "Unnamed brew", category: tab, ingredients: "", process: "", effects: "", side_effects: "", success_chance: 50, notes: "" });
    await load(); setEditing(out);
  };
  const save = async () => { await recipes.update(editing.id, editing); await load(); setEditing(null); };
  const remove = async () => { if (window.confirm("Discard?")) { await recipes.remove(editing.id); await load(); setEditing(null); } };

  if (!current) return null;
  return (
    <div data-testid="apothecary-page">
      <PageHeader title="Apothecary" subtitle="Recipes. Tinctures. Things that should not be brewed."
        action={<button className="btn-organic" onClick={create} data-testid="recipe-add"><Plus size={14}/> New Recipe</button>} />

      <div className="flex gap-1 mb-4">
        {CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => setTab(c.key)} data-testid={`apothecary-tab-${c.key}`}
            className={`px-4 py-2 text-sm font-heading tracking-wider border ${tab === c.key ? "border-[var(--accent-glow)] text-[var(--text-magical)]" : "border-white/10 text-[var(--text-secondary)]"} ${c.key === "forbidden" ? "" : ""}`}>
            {c.label}
          </button>
        ))}
      </div>

      <input placeholder="Filter…" className="!w-64 mb-4" value={q} onChange={(e) => setQ(e.target.value)} data-testid="recipe-search" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 && <p className="italic text-[var(--text-tertiary)] text-sm">No recipes recorded in this archive.</p>}
        {filtered.map((r) => (
          <OrganicCard key={r.id} forbidden={r.category === "forbidden"} testid={`recipe-card-${r.id}`} className="cursor-pointer" onClick={() => setEditing(r)}>
            <h3 className="font-arcane text-xl">{r.name}</h3>
            <p className="label-arcane mt-1">success {r.success_chance ?? "?"}%</p>
            <p className="text-xs font-mono mt-2 text-[var(--text-tertiary)] line-clamp-2"><span className="label-arcane">ingr:</span> {r.ingredients}</p>
            <p className="text-sm mt-2 italic line-clamp-3">{r.effects}</p>
            {r.side_effects && <p className="text-xs mt-1 text-[var(--accent-blood)]">⚠ {r.side_effects}</p>}
          </OrganicCard>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto" onClick={() => setEditing(null)}>
          <OrganicCard forbidden={editing.category === "forbidden"} className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-arcane text-2xl mb-3">{editing.name}</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2"><span className="label-arcane">Name</span><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} data-testid="recipe-edit-name" /></label>
              <label><span className="label-arcane">Category</span><select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></label>
              <label><span className="label-arcane">Success chance %</span><input type="number" value={editing.success_chance} onChange={(e) => setEditing({ ...editing, success_chance: Number(e.target.value) })}/></label>
              <label className="col-span-2"><span className="label-arcane">Ingredients</span><textarea rows={3} value={editing.ingredients} onChange={(e) => setEditing({ ...editing, ingredients: e.target.value })} /></label>
              <label className="col-span-2"><span className="label-arcane">Process</span><textarea rows={4} value={editing.process} onChange={(e) => setEditing({ ...editing, process: e.target.value })} /></label>
              <label className="col-span-2"><span className="label-arcane">Effects</span><textarea rows={3} value={editing.effects} onChange={(e) => setEditing({ ...editing, effects: e.target.value })} /></label>
              <label className="col-span-2"><span className="label-arcane">Side effects</span><textarea rows={2} value={editing.side_effects} onChange={(e) => setEditing({ ...editing, side_effects: e.target.value })} /></label>
              <label className="col-span-2"><span className="label-arcane">Notes</span><textarea rows={2} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></label>
            </div>
            <div className="flex justify-between gap-2 mt-4">
              <button className="btn-danger" onClick={remove}><Trash2 size={12}/> Delete</button>
              <div className="flex gap-2"><button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn-organic" onClick={save} data-testid="recipe-save">Save</button></div>
            </div>
          </OrganicCard>
        </div>
      )}
    </div>
  );
}
