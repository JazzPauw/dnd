import React from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";
import { characters as charApi } from "@/lib/api";
import { Plus, Copy, Trash2 } from "lucide-react";

export default function Characters() {
  const { characters, refreshCharacters, selectCharacter, current } = useCharacter();

  const create = async () => {
    const name = prompt("Name of new vessel?", "New Vessel");
    if (!name) return;
    await charApi.create({ name });
    await refreshCharacters();
  };
  const duplicate = async (id) => { await charApi.duplicate(id); await refreshCharacters(); };
  const remove = async (id) => {
    if (characters.length <= 1) { alert("At least one vessel must remain."); return; }
    if (!window.confirm("Delete this character and all their archives?")) return;
    await charApi.remove(id);
    const list = await refreshCharacters();
    if (current?.id === id) selectCharacter(list[0].id);
  };

  return (
    <div data-testid="characters-page">
      <PageHeader title="Characters" subtitle="Multiple vessels. Switch between them at the speed of thought."
        action={<button className="btn-organic" onClick={create} data-testid="character-add"><Plus size={14}/> New Character</button>} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {characters.map((c) => (
          <OrganicCard key={c.id} testid={`character-${c.id}`} className="cursor-pointer" onClick={() => selectCharacter(c.id)}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-arcane text-xl">{c.name}</h3>
                <p className="label-arcane mt-1">{c.race} · level {c.level}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">{c.classes}</p>
              </div>
              {current?.id === c.id && <span className="label-arcane text-[var(--accent-spore)]">● active</span>}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={(e) => { e.stopPropagation(); duplicate(c.id); }} className="btn-ghost text-xs" data-testid={`character-duplicate-${c.id}`}><Copy size={12}/> Duplicate</button>
              <button onClick={(e) => { e.stopPropagation(); remove(c.id); }} className="btn-danger text-xs" data-testid={`character-delete-${c.id}`}><Trash2 size={12}/> Delete</button>
            </div>
          </OrganicCard>
        ))}
      </div>
    </div>
  );
}
