import React, { useEffect, useMemo, useState } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";
import { spells } from "@/lib/api";
import { Plus, Trash2, Sparkles } from "lucide-react";

const SCHOOLS = ["Abjuration","Conjuration","Divination","Enchantment","Evocation","Illusion","Necromancy","Transmutation"];

export default function Spells() {
  const { current, updateCurrent } = useCharacter();
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState({ q: "", source: "all", prepared: false, concentration: false, ritual: false, level: "all" });
  const [editing, setEditing] = useState(null);

  const load = async () => current && setList(await spells.list({ character_id: current.id }));
  useEffect(() => { load(); }, [current?.id]);

  const filtered = useMemo(() => {
    return list.filter((s) => {
      if (filter.q && !`${s.name} ${s.description||""}`.toLowerCase().includes(filter.q.toLowerCase())) return false;
      if (filter.source !== "all" && s.source !== filter.source) return false;
      if (filter.prepared && !s.prepared) return false;
      if (filter.concentration && !s.concentration) return false;
      if (filter.ritual && !s.ritual) return false;
      if (filter.level !== "all" && Number(s.level) !== Number(filter.level)) return false;
      return true;
    });
  }, [list, filter]);

  const adjustSlot = async (lvl, delta) => {
    const slots = { ...current.spell_slots };
    const cur = slots[lvl] || { current: 0, max: 0 };
    cur.current = Math.max(0, Math.min(cur.max, cur.current + delta));
    slots[lvl] = cur;
    await updateCurrent({ spell_slots: slots });
  };
  const setSlotMax = async (lvl, max) => {
    const slots = { ...current.spell_slots };
    const cur = slots[lvl] || { current: 0, max: 0 };
    cur.max = Number(max); cur.current = Math.min(cur.current, cur.max);
    slots[lvl] = cur;
    await updateCurrent({ spell_slots: slots });
  };

  const create = async () => {
    const fresh = { character_id: current.id, name: "Unnamed Spell", level: 0, source: "druid", school: "Conjuration", casting_time: "1 action", range: "Self", components: "V, S", duration: "Instantaneous", description: "", concentration: false, ritual: false, prepared: false, notes: "" };
    const out = await spells.create(fresh);
    await load();
    setEditing(out);
  };
  const save = async () => { await spells.update(editing.id, editing); await load(); setEditing(null); };

  if (!current) return null;
  return (
    <div data-testid="spells-page">
      <PageHeader title="Spell Archive" subtitle="Specimens of woven will. Slots are flesh, spells are spores."
        action={<button className="btn-organic" onClick={create} data-testid="add-spell"><Plus size={14}/> Inscribe</button>} />

      {/* Spell slots */}
      <OrganicCard className="mb-6">
        <p className="label-arcane mb-3">Spell Slots</p>
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {Object.entries(current.spell_slots || {}).map(([lvl, s]) => (
            <div key={lvl} className="text-center" data-testid={`slot-lvl-${lvl}`}>
              <p className="label-arcane">Lv {lvl}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <button className="btn-ghost px-1 py-0 text-xs" onClick={() => adjustSlot(lvl, -1)} data-testid={`slot-dec-${lvl}`}>-</button>
                <span className="font-mono text-lg">{s.current}</span>
                <span className="text-[var(--text-tertiary)] font-mono">/</span>
                <input type="number" className="font-mono !w-10 text-center !p-1 text-sm" value={s.max} onChange={(e) => setSlotMax(lvl, e.target.value)} data-testid={`slot-max-${lvl}`} />
                <button className="btn-ghost px-1 py-0 text-xs" onClick={() => adjustSlot(lvl, +1)} data-testid={`slot-inc-${lvl}`}>+</button>
              </div>
            </div>
          ))}
        </div>
      </OrganicCard>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
        <input placeholder="Search…" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} className="!w-48" data-testid="spell-search" />
        <select value={filter.source} onChange={(e) => setFilter({ ...filter, source: e.target.value })}><option value="all">All sources</option><option value="druid">Druid</option><option value="ranger">Ranger</option><option value="other">Other</option></select>
        <select value={filter.level} onChange={(e) => setFilter({ ...filter, level: e.target.value })}><option value="all">All levels</option>{[0,1,2,3,4,5,6,7,8,9].map((l) => <option key={l} value={l}>Lv {l}</option>)}</select>
        <label className="flex items-center gap-1"><input type="checkbox" className="!w-3" checked={filter.prepared} onChange={(e) => setFilter({ ...filter, prepared: e.target.checked })}/> prepared</label>
        <label className="flex items-center gap-1"><input type="checkbox" className="!w-3" checked={filter.concentration} onChange={(e) => setFilter({ ...filter, concentration: e.target.checked })}/> conc.</label>
        <label className="flex items-center gap-1"><input type="checkbox" className="!w-3" checked={filter.ritual} onChange={(e) => setFilter({ ...filter, ritual: e.target.checked })}/> ritual</label>
      </div>

      {/* Spell grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((s) => (
          <OrganicCard key={s.id} testid={`spell-${s.id}`} className="cursor-pointer" onClick={() => setEditing(s)}>
            <div className="flex justify-between items-start">
              <h3 className="font-arcane text-xl">{s.name}</h3>
              <span className="label-arcane">Lv {s.level}</span>
            </div>
            <p className="label-arcane mt-1">{s.school} · {s.source}</p>
            <div className="text-xs font-mono text-[var(--text-tertiary)] mt-2 space-y-0.5">
              <p>cast {s.casting_time} · range {s.range}</p>
              <p>{s.components} · {s.duration}</p>
            </div>
            <p className="text-sm mt-2 line-clamp-2">{s.description}</p>
            <div className="flex gap-2 mt-3 text-[10px] uppercase tracking-wider">
              {s.prepared && <span className="text-[var(--accent-spore)]">●prepared</span>}
              {s.concentration && <span className="text-amber-400">●conc</span>}
              {s.ritual && <span className="text-[var(--text-magical)]">●ritual</span>}
            </div>
          </OrganicCard>
        ))}
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto" onClick={() => setEditing(null)}>
          <OrganicCard className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-arcane text-3xl mb-3"><Sparkles size={16} className="inline mr-2"/> Inscribe Spell</h2>
            <div className="grid grid-cols-2 gap-3">
              <label><span className="label-arcane">Name</span><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} data-testid="spell-edit-name"/></label>
              <label><span className="label-arcane">Level</span><input type="number" value={editing.level} onChange={(e) => setEditing({ ...editing, level: Number(e.target.value) })}/></label>
              <label><span className="label-arcane">Source</span><select value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })}><option value="druid">Druid</option><option value="ranger">Ranger</option><option value="other">Other</option></select></label>
              <label><span className="label-arcane">School</span><select value={editing.school} onChange={(e) => setEditing({ ...editing, school: e.target.value })}>{SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
              <label><span className="label-arcane">Casting time</span><input value={editing.casting_time} onChange={(e) => setEditing({ ...editing, casting_time: e.target.value })}/></label>
              <label><span className="label-arcane">Range</span><input value={editing.range} onChange={(e) => setEditing({ ...editing, range: e.target.value })}/></label>
              <label><span className="label-arcane">Components</span><input value={editing.components} onChange={(e) => setEditing({ ...editing, components: e.target.value })}/></label>
              <label><span className="label-arcane">Duration</span><input value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })}/></label>
            </div>
            <label className="block mt-3"><span className="label-arcane">Description</span><textarea rows={5} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}/></label>
            <label className="block mt-3"><span className="label-arcane">Notes</span><textarea rows={2} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })}/></label>
            <div className="flex gap-4 mt-3">
              <label className="text-sm flex items-center gap-1"><input type="checkbox" className="!w-3" checked={!!editing.prepared} onChange={(e) => setEditing({ ...editing, prepared: e.target.checked })}/> prepared</label>
              <label className="text-sm flex items-center gap-1"><input type="checkbox" className="!w-3" checked={!!editing.concentration} onChange={(e) => setEditing({ ...editing, concentration: e.target.checked })}/> concentration</label>
              <label className="text-sm flex items-center gap-1"><input type="checkbox" className="!w-3" checked={!!editing.ritual} onChange={(e) => setEditing({ ...editing, ritual: e.target.checked })}/> ritual</label>
            </div>
            <div className="flex justify-between gap-2 mt-4">
              <button className="btn-danger" onClick={async () => { await spells.remove(editing.id); await load(); setEditing(null); }} data-testid="spell-delete"><Trash2 size={12}/> Burn</button>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button className="btn-organic" onClick={save} data-testid="spell-save">Preserve</button>
              </div>
            </div>
          </OrganicCard>
        </div>
      )}
    </div>
  );
}
