import React, { useEffect, useMemo, useState } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import MushroomDecor from "@/components/MushroomDecor";
import { useCharacter } from "@/contexts/CharacterContext";
import { Plus, Trash2, Pencil } from "lucide-react";
import ImageInput from "@/components/ImageInput";

/**
 * EntityPage — reusable list+modal CRUD page.
 * @param {object} props
 *   title, subtitle, api (resourceApi), fields (array of {key, label, type, options, rows, span})
 *   render(item) returns the card body
 *   testidPrefix
 *   forbiddenKey: optional key on item that flips card to forbidden style
 *   searchFields: keys to filter on
 */
export default function EntityPage({ title, subtitle, api, fields, render, testidPrefix, forbiddenKey, searchFields = ["name", "title", "description"], decorPosition = "bottom-right", emptyText = "Nothing yet. Plant a seed." }) {
  const { current } = useCharacter();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");

  const load = async () => current && setItems(await api.list({ character_id: current.id }));
  useEffect(() => { load(); }, [current?.id]);

  const filtered = useMemo(() => {
    if (!q) return items;
    const n = q.toLowerCase();
    return items.filter((it) => searchFields.some((f) => String(it[f] || "").toLowerCase().includes(n)));
  }, [items, q, searchFields]);

  const create = async () => {
    const init = { character_id: current.id };
    fields.forEach((f) => { if (f.default !== undefined) init[f.key] = f.default; });
    const out = await api.create(init);
    await load();
    setEditing(out);
  };
  const save = async () => { await api.update(editing.id, editing); await load(); setEditing(null); };
  const remove = async () => { if (window.confirm("Let this entry return to the network?")) { await api.remove(editing.id); await load(); setEditing(null); } };

  if (!current) return null;
  return (
    <div data-testid={`${testidPrefix}-page`} className="relative">
      <MushroomDecor position={decorPosition} />
      <PageHeader title={title} subtitle={subtitle}
        action={<button className="btn-organic" onClick={create} data-testid={`${testidPrefix}-add`}><Plus size={14}/> Add</button>} />

      <input placeholder="Filter…" className="!w-64 mb-4" value={q} onChange={(e) => setQ(e.target.value)} data-testid={`${testidPrefix}-search`} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 && <p className="italic text-[var(--text-tertiary)] text-sm">{emptyText}</p>}
        {filtered.map((it) => (
          <OrganicCard key={it.id} forbidden={forbiddenKey && it[forbiddenKey] === "forbidden"} testid={`${testidPrefix}-card-${it.id}`} className="cursor-pointer" onClick={() => setEditing(it)}>
            {render(it)}
            <button onClick={(e) => { e.stopPropagation(); setEditing(it); }} className="btn-ghost p-1 absolute top-2 right-2" data-testid={`${testidPrefix}-edit-${it.id}`}><Pencil size={12}/></button>
          </OrganicCard>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto no-print" onClick={() => setEditing(null)}>
          <OrganicCard forbidden={forbiddenKey && editing[forbiddenKey] === "forbidden"} className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-arcane text-2xl mb-3">{editing[fields[0].key] || "New entry"}</h2>
            <div className="grid grid-cols-2 gap-3">
              {fields.map((f) => (
                <label key={f.key} className={`block ${f.span === 2 ? "col-span-2" : ""}`} data-testid={`${testidPrefix}-field-${f.key}`}>
                  <span className="label-arcane block mb-1">{f.label}</span>
                  {f.type === "textarea" ? (
                    <textarea rows={f.rows || 3} value={editing[f.key] || ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />
                  ) : f.type === "image" ? (
                    <ImageInput value={editing[f.key]} onChange={(v) => setEditing({ ...editing, [f.key]: v })} testid={`${testidPrefix}-image`}/>
                  ) : f.type === "select" ? (
                    <select value={editing[f.key] || ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}>
                      {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === "number" ? (
                    <input type="number" value={editing[f.key] ?? 0} onChange={(e) => setEditing({ ...editing, [f.key]: Number(e.target.value) })} />
                  ) : f.type === "checkbox" ? (
                    <input type="checkbox" checked={!!editing[f.key]} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })} className="!w-4" />
                  ) : (
                    <input value={editing[f.key] || ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />
                  )}
                </label>
              ))}
            </div>
            <div className="flex justify-between gap-2 mt-4">
              <button className="btn-danger" onClick={remove} data-testid={`${testidPrefix}-delete`}><Trash2 size={12}/> Delete</button>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button className="btn-organic" onClick={save} data-testid={`${testidPrefix}-save`}>Save</button>
              </div>
            </div>
          </OrganicCard>
        </div>
      )}
    </div>
  );
}
