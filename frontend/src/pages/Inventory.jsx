import React, { useEffect, useState } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";
import { inventory } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";

const FIELDS = [
  ["name", "Name", "text"],
  ["quantity", "Qty", "number"],
  ["weight", "Weight", "number"],
  ["charges", "Charges", "text"],
  ["attunement", "Attuned", "check"],
  ["equipped", "Equipped", "check"],
  ["category", "Category", "text"],
  ["notes", "Notes", "textarea"],
];

export default function Inventory() {
  const { current } = useCharacter();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);

  const load = async () => current && setItems(await inventory.list({ character_id: current.id }));
  useEffect(() => { load(); }, [current?.id]);

  const create = async () => {
    const out = await inventory.create({ character_id: current.id, name: "New item", quantity: 1, weight: 0, charges: "", attunement: false, equipped: false, category: "gear", notes: "" });
    await load(); setEditing(out);
  };
  const save = async () => { await inventory.update(editing.id, editing); await load(); setEditing(null); };
  const remove = async () => { if (window.confirm("Delete this item?")) { await inventory.remove(editing.id); await load(); setEditing(null); } };

  const filtered = items.filter((it) => !q || `${it.name} ${it.notes} ${it.category}`.toLowerCase().includes(q.toLowerCase()));
  const totalWeight = items.reduce((s, it) => s + (Number(it.weight) || 0) * (Number(it.quantity) || 1), 0);

  if (!current) return null;
  return (
    <div data-testid="inventory-page">
      <PageHeader title={current.section_labels?.inventory || "Inventory"} subtitle={`Total weight: ${totalWeight.toFixed(1)}`}
        action={<button className="btn-organic" onClick={create} data-testid="inv-add"><Plus size={14}/> New Item</button>} />
      <input placeholder="Filter…" className="!w-64 mb-4" value={q} onChange={(e) => setQ(e.target.value)} data-testid="inv-search" />
      <OrganicCard className="!p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-tertiary)] border-b border-white/5">
              {["Name","Qty","Wt","Charges","Attuned","Equipped","Category",""].map((h) => <th key={h} className="text-left p-2 label-arcane font-normal">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan="8" className="p-4 italic text-[var(--text-tertiary)]">Empty satchel.</td></tr>}
            {filtered.map((it) => (
              <tr key={it.id} onClick={() => setEditing(it)} className="border-b border-white/5 hover:bg-white/5 cursor-pointer" data-testid={`inv-row-${it.id}`}>
                <td className="p-2 font-heading">{it.name}</td>
                <td className="p-2 font-mono">{it.quantity}</td>
                <td className="p-2 font-mono">{it.weight}</td>
                <td className="p-2 font-mono">{it.charges}</td>
                <td className="p-2">{it.attunement ? "●" : ""}</td>
                <td className="p-2">{it.equipped ? "●" : ""}</td>
                <td className="p-2 text-[var(--text-tertiary)]">{it.category}</td>
                <td className="p-2 text-right">→</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OrganicCard>

      {editing && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto" onClick={() => setEditing(null)}>
          <OrganicCard className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()} data-testid="inv-modal">
            <h2 className="font-arcane text-2xl mb-3">{editing.name}</h2>
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map(([k, label, type]) => (
                <label key={k} className={type === "textarea" ? "col-span-2" : ""}>
                  <span className="label-arcane block mb-1">{label}</span>
                  {type === "textarea" ? (
                    <textarea rows={3} value={editing[k] || ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })}/>
                  ) : type === "number" ? (
                    <input type="number" value={editing[k] ?? 0} onChange={(e) => setEditing({ ...editing, [k]: Number(e.target.value) })}/>
                  ) : type === "check" ? (
                    <input type="checkbox" className="!w-4" checked={!!editing[k]} onChange={(e) => setEditing({ ...editing, [k]: e.target.checked })}/>
                  ) : (
                    <input value={editing[k] || ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })}/>
                  )}
                </label>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <button className="btn-danger" onClick={remove} data-testid="inv-delete"><Trash2 size={12}/> Delete</button>
              <div className="flex gap-2"><button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn-organic" onClick={save} data-testid="inv-save">Save</button></div>
            </div>
          </OrganicCard>
        </div>
      )}
    </div>
  );
}
