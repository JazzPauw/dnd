import React from "react";
import EntityPage from "@/components/EntityPage";
import { fungi } from "@/lib/api";

const FIELDS = [
  { key: "name", label: "Species name", default: "Unnamed specimen" },
  { key: "habitat", label: "Habitat" },
  { key: "toxicity", label: "Toxicity", type: "select", options: [
    { value: "none", label: "None" }, { value: "mild", label: "Mild" }, { value: "severe", label: "Severe" }, { value: "lethal", label: "Lethal" },
  ], default: "none" },
  { key: "edible", label: "Edible", type: "checkbox" },
  { key: "magical_properties", label: "Magical properties", type: "textarea", span: 2 },
  { key: "medicinal_uses", label: "Medicinal uses", type: "textarea", span: 2 },
  { key: "description", label: "Description", type: "textarea", rows: 4, span: 2 },
  { key: "first_discovered", label: "First discovered" },
  { key: "image", label: "Image URL" },
  { key: "notes", label: "Notes", type: "textarea", span: 2 },
];

export default function Fungarium() {
  return (
    <EntityPage
      title="Fungarium" subtitle="Pressed and preserved. Each specimen still whispers."
      api={fungi} fields={FIELDS} testidPrefix="fungus"
      searchFields={["name", "habitat", "description", "magical_properties"]}
      render={(f) => (
        <>
          {f.image && <img src={f.image} alt={f.name} className="w-full h-28 object-cover mb-2 opacity-90" />}
          <h3 className="font-arcane text-xl">{f.name}</h3>
          <p className="label-arcane mt-1">{f.habitat}</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span>tox: <span className="font-mono text-[var(--accent-spore)]">{f.toxicity}</span></span>
            <span>{f.edible ? "edible" : "inedible"}</span>
          </div>
          <p className="text-sm italic mt-2 line-clamp-3">{f.description}</p>
        </>
      )}
    />
  );
}
