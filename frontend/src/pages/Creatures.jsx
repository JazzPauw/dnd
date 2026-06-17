import React from "react";
import EntityPage from "@/components/EntityPage";
import { creatures } from "@/lib/api";

const FIELDS = [
  { key: "name", label: "Name", default: "Unknown specimen" },
  { key: "type", label: "Type" },
  { key: "habitat", label: "Habitat" },
  { key: "danger", label: "Danger", type: "select", options: [
    { value: "trivial", label: "Trivial" }, { value: "minor", label: "Minor" },
    { value: "moderate", label: "Moderate" }, { value: "severe", label: "Severe" },
    { value: "lethal", label: "Lethal" }, { value: "apocalyptic", label: "Apocalyptic" },
  ], default: "moderate" },
  { key: "ac", label: "AC", type: "number" },
  { key: "hp", label: "HP", type: "number" },
  { key: "resistances", label: "Resistances", span: 2 },
  { key: "vulnerabilities", label: "Vulnerabilities", span: 2 },
  { key: "behaviors", label: "Behaviors", type: "textarea", span: 2, rows: 3 },
  { key: "observations", label: "Observations (fungal interactions, etc.)", type: "textarea", span: 2, rows: 4 },
  { key: "encounter_history", label: "Encounter history", type: "textarea", span: 2 },
  { key: "image", label: "Image", span: 2, type: "image" },
];

const DANGER_COLOR = {
  trivial: "var(--text-tertiary)", minor: "#7a8b6a", moderate: "#c79a5b",
  severe: "#c75c5c", lethal: "#9e3b3b", apocalyptic: "#5c1a1a",
};

export default function Creatures() {
  return (
    <EntityPage
      title="Creature Journal" subtitle="A bestiary. Pages overgrown with fungi."
      api={creatures} fields={FIELDS} testidPrefix="creature"
      searchFields={["name", "type", "habitat", "behaviors", "observations"]}
      render={(c) => (
        <>
          {c.image && <img src={c.image} alt={c.name} className="w-full h-32 object-cover mb-2 grayscale opacity-80" />}
          <div className="flex justify-between items-start">
            <h3 className="font-arcane text-xl">{c.name}</h3>
            <span className="label-arcane" style={{ color: DANGER_COLOR[c.danger] }}>{c.danger}</span>
          </div>
          <p className="label-arcane mt-1">{c.type} · {c.habitat}</p>
          <div className="text-xs font-mono text-[var(--text-tertiary)] mt-2">AC {c.ac || "?"} · HP {c.hp || "?"}</div>
          <p className="text-sm mt-2 line-clamp-3 italic">{c.observations}</p>
        </>
      )}
    />
  );
}
