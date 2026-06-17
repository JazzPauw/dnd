import React, { useEffect, useState } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import MushroomDecor from "@/components/MushroomDecor";
import { useCharacter } from "@/contexts/CharacterContext";
import { deaths } from "@/lib/api";
import { Plus, Trash2, Flower2, FileDown } from "lucide-react";
import { exportEntryPdf } from "@/lib/pdfExport";

export default function CycleOfDeath() {
  const { current } = useCharacter();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => current && setItems(await deaths.list({ character_id: current.id }));
  useEffect(() => { load(); }, [current?.id]);

  const create = async () => {
    const out = await deaths.create({ character_id: current.id, name: "Unnamed", date_of_death: "", relationship: "", cause: "", grew_into: "", description: "", thoughts: "" });
    await load(); setEditing(out);
  };
  const save = async () => { await deaths.update(editing.id, editing); await load(); setEditing(null); };
  const remove = async () => { if (window.confirm("Let the soil receive them?")) { await deaths.remove(editing.id); await load(); setEditing(null); } };
  const printEntry = async () => {
    try { await exportEntryPdf("death", editing, { character: current }); }
    catch (err) { console.error("PDF export failed", err); window.alert("PDF export failed: " + (err?.message || err)); }
  };

  if (!current) return null;
  return (
    <div data-testid="cycle-page" className="relative">
      <MushroomDecor position="bottom-left" opacity={0.22} />
      <MushroomDecor position="bottom-right" opacity={0.16} />
      <PageHeader title="Cycle of Death" subtitle="Not a graveyard — a garden. From every death, something grows."
        action={<button className="btn-organic" onClick={create} data-testid="death-add"><Plus size={14}/> New Entry</button>} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.length === 0 && <p className="italic text-[var(--text-tertiary)] text-sm">The garden waits for its first bloom.</p>}
        {items.map((d) => (
          <OrganicCard key={d.id} testid={`death-${d.id}`} className="cursor-pointer relative pl-12" data-print-card="" onClick={() => setEditing(d)}>
            <Flower2 size={28} className="absolute left-3 top-3 text-[var(--accent-spore)] opacity-70" />
            <h3 className="font-arcane text-xl">{d.name}</h3>
            <p className="label-arcane mt-1">{d.relationship || "—"} · {d.date_of_death || "unknown"}</p>
            <p className="text-xs mt-2 text-[var(--text-tertiary)] italic">cause: {d.cause || "unknown"}</p>
            <p className="text-sm mt-2 italic line-clamp-2">{d.description}</p>
            {d.grew_into && <p className="text-xs mt-2 text-[var(--accent-spore)]">→ became: {d.grew_into}</p>}
          </OrganicCard>
        ))}
      </div>

      {editing && (
        <div data-entry-modal-backdrop className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto no-print" onClick={() => setEditing(null)}>
          <OrganicCard className="max-w-2xl w-full" data-entry-modal="death" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-arcane text-2xl mb-3">{editing.name}</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2"><span className="label-arcane">Name</span><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} data-testid="death-edit-name"/></label>
              <label><span className="label-arcane">Date of death</span><input value={editing.date_of_death} onChange={(e) => setEditing({ ...editing, date_of_death: e.target.value })}/></label>
              <label><span className="label-arcane">Relationship</span><input value={editing.relationship} onChange={(e) => setEditing({ ...editing, relationship: e.target.value })}/></label>
              <label className="col-span-2"><span className="label-arcane">Cause</span><input value={editing.cause} onChange={(e) => setEditing({ ...editing, cause: e.target.value })}/></label>
              <label className="col-span-2"><span className="label-arcane">What grew from them</span><input value={editing.grew_into} onChange={(e) => setEditing({ ...editing, grew_into: e.target.value })}/></label>
              <label className="col-span-2"><span className="label-arcane">Description</span><textarea rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}/></label>
              <label className="col-span-2"><span className="label-arcane">Personal thoughts</span><textarea rows={4} value={editing.thoughts} onChange={(e) => setEditing({ ...editing, thoughts: e.target.value })}/></label>
            </div>
            <div className="flex justify-between gap-2 mt-4">
              <button className="btn-danger" onClick={remove}><Trash2 size={12}/> Delete</button>
              <div className="flex gap-2"><button className="btn-ghost" onClick={printEntry} data-testid="death-print-entry"><FileDown size={12}/> Export this entry</button><button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn-organic" onClick={save} data-testid="death-save">Save</button></div>
            </div>
          </OrganicCard>
        </div>
      )}
    </div>
  );
}
