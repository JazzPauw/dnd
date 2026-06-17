import React from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";

const SECTIONS = [
  ["dashboard", "Living Body"],
  ["sheet", "Character Sheet"],
  ["spells", "Spell Archive"],
  ["creatures", "Creature Journal"],
  ["diary", "Diary"],
  ["memories", "Memories"],
  ["dreams", "Dreams"],
  ["fungarium", "Fungarium"],
  ["apothecary", "Apothecary"],
  ["cycle", "Cycle of Death"],
  ["inventory", "Inventory"],
  ["macros", "Roll Macros"],
  ["network", "The Network"],
  ["ledger", "Activity Ledger"],
];

export default function Settings() {
  const { current, updateCurrent } = useCharacter();
  if (!current) return null;
  const labels = current.section_labels || {};
  const setLabel = (k, v) => updateCurrent({ section_labels: { ...labels, [k]: v } });

  return (
    <div data-testid="settings-page">
      <PageHeader title="Settings" subtitle={`Per-character options · ${current.name}`} />
      <OrganicCard>
        <h3 className="font-arcane text-xl mb-3">Section Names</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4 italic">Each PC can rename sections — Fungarium → "Herbalist's Kit", Apothecary → "Workshop", etc.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SECTIONS.map(([k, defaultLabel]) => (
            <label key={k}>
              <span className="label-arcane block mb-1">{defaultLabel}</span>
              <input
                value={labels[k] || ""}
                placeholder={defaultLabel}
                onChange={(e) => setLabel(k, e.target.value)}
                data-testid={`settings-label-${k}`}
              />
            </label>
          ))}
        </div>
        <button className="btn-ghost mt-4 text-xs" onClick={() => updateCurrent({ section_labels: {} })} data-testid="settings-reset">Reset to defaults</button>
      </OrganicCard>
    </div>
  );
}
