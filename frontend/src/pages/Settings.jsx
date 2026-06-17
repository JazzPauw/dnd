import React, { useRef } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";
import { exportCharacterArchive, importCharacterArchive } from "@/lib/archive";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

const SECTIONS = [
  ["dashboard", "Living Body"], ["sheet", "Character Sheet"], ["spells", "Spell Archive"],
  ["creatures", "Creature Journal"], ["diary", "Diary"], ["memories", "Memories"],
  ["dreams", "Dreams"], ["fungarium", "Fungarium"], ["apothecary", "Apothecary"],
  ["cycle", "Cycle of Death"], ["inventory", "Inventory"], ["macros", "Roll Macros"],
  ["network", "The Network"], ["ledger", "Activity Ledger"],
];

export default function Settings() {
  const { current, updateCurrent, refreshCharacters, selectCharacter } = useCharacter();
  const fileRef = useRef(null);
  if (!current) return null;
  const labels = current.section_labels || {};
  const setLabel = (k, v) => updateCurrent({ section_labels: { ...labels, [k]: v } });

  const doExport = async () => {
    await exportCharacterArchive(current);
    toast.success("Archive exported");
  };
  const doImport = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const c = await importCharacterArchive(f);
      const list = await refreshCharacters();
      selectCharacter(c.id);
      toast.success(`Imported as "${c.name}"`);
    } catch (err) {
      toast.error("Import failed: " + err.message);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div data-testid="settings-page">
      <PageHeader title="Settings" subtitle={`Per-character options · ${current.name}`} />

      <OrganicCard className="mb-4">
        <h3 className="font-arcane text-xl mb-3">Backup & Share</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4 italic">Export the current character as a single .archive.json file (includes spells, creatures, memories, themes, everything). Import to restore on another machine or share with a friend.</p>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-organic" onClick={doExport} data-testid="export-archive"><Download size={14}/> Export character</button>
          <button className="btn-organic" onClick={() => fileRef.current?.click()} data-testid="import-archive-btn"><Upload size={14}/> Import character</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={doImport} className="hidden" data-testid="import-archive-file"/>
        </div>
      </OrganicCard>

      <OrganicCard>
        <h3 className="font-arcane text-xl mb-3">Section Names</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4 italic">Each character can rename sections — Fungarium → "Herbalist's Kit", Apothecary → "Workshop", etc.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SECTIONS.map(([k, defaultLabel]) => (
            <label key={k}>
              <span className="label-arcane block mb-1">{defaultLabel}</span>
              <input value={labels[k] || ""} placeholder={defaultLabel} onChange={(e) => setLabel(k, e.target.value)} data-testid={`settings-label-${k}`}/>
            </label>
          ))}
        </div>
        <button className="btn-ghost mt-4 text-xs" onClick={() => updateCurrent({ section_labels: {} })} data-testid="settings-reset">Reset to defaults</button>
      </OrganicCard>
    </div>
  );
}
