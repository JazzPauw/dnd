import React, { useEffect, useState } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";
import api from "@/lib/api";
import { Plus, Trash2, Copy, Dice5 } from "lucide-react";
import { toast } from "sonner";

const macrosApi = {
  list: (p) => api.get("/macros", { params: p }).then((r) => r.data),
  create: (d) => api.post("/macros", d).then((r) => r.data),
  update: (id, d) => api.put(`/macros/${id}`, d).then((r) => r.data),
  remove: (id) => api.delete(`/macros/${id}`).then((r) => r.data),
};

export default function Macros() {
  const { current } = useCharacter();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  const load = async () => current && setItems(await macrosApi.list({ character_id: current.id }));
  useEffect(() => { load(); }, [current?.id]);

  const create = async () => {
    await macrosApi.create({ character_id: current.id, name: "New macro", formula: "/roll 1d20", notes: "", category: "attack" });
    load();
  };
  const update = async (m, patch) => { await macrosApi.update(m.id, { ...m, ...patch }); load(); };
  const remove = async (id) => { await macrosApi.remove(id); load(); };

  const copy = async (m) => {
    await navigator.clipboard.writeText(m.formula || "");
    toast.success(`Copied: ${m.formula}`);
  };

  const filtered = items.filter((m) => !q || `${m.name} ${m.formula} ${m.category}`.toLowerCase().includes(q.toLowerCase()));

  if (!current) return null;
  return (
    <div data-testid="macros-page">
      <PageHeader title="Roll Macros" subtitle="Roll20-style formulas. One click to copy."
        action={<button className="btn-organic" onClick={create} data-testid="macro-add"><Plus size={14}/> New Macro</button>} />
      <input placeholder="Filter…" className="!w-64 mb-4" value={q} onChange={(e) => setQ(e.target.value)} data-testid="macro-search"/>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.length === 0 && <p className="italic text-[var(--text-tertiary)] text-sm">No macros yet. Add one like "/roll 1d20 + 4 + 1d6".</p>}
        {filtered.map((m) => (
          <OrganicCard key={m.id} testid={`macro-${m.id}`}>
            <div className="flex gap-2 items-start">
              <Dice5 size={20} className="text-[var(--accent-spore)] mt-1"/>
              <div className="flex-1 space-y-2">
                <input value={m.name} onChange={(e) => update(m, { name: e.target.value })} className="font-arcane text-lg !bg-transparent !border-0 !p-0" data-testid={`macro-name-${m.id}`}/>
                <input value={m.formula || ""} onChange={(e) => update(m, { formula: e.target.value })} placeholder="/roll 1d20 + 4 + 1d6" className="font-mono text-sm" data-testid={`macro-formula-${m.id}`}/>
                <div className="flex gap-2 items-center">
                  <input value={m.category || ""} onChange={(e) => update(m, { category: e.target.value })} placeholder="category" className="!w-32 text-xs"/>
                  <input value={m.notes || ""} onChange={(e) => update(m, { notes: e.target.value })} placeholder="notes" className="text-xs"/>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button className="btn-organic !py-1 !px-2 text-xs" onClick={() => copy(m)} data-testid={`macro-copy-${m.id}`}><Copy size={12}/> Copy</button>
                <button className="btn-ghost p-1" onClick={() => remove(m.id)} data-testid={`macro-delete-${m.id}`}><Trash2 size={12}/></button>
              </div>
            </div>
          </OrganicCard>
        ))}
      </div>
    </div>
  );
}
