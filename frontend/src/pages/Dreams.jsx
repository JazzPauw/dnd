import React from "react";
import EntityPage from "@/components/EntityPage";
import { dreams } from "@/lib/api";

const FIELDS = [
  { key: "title", label: "Title", default: "Unsignified dream" },
  { key: "date", label: "Date" },
  { key: "mood", label: "Mood", type: "select", options: [
    { value: "eerie", label: "Eerie" }, { value: "longing", label: "Longing" },
    { value: "terror", label: "Terror" }, { value: "warm", label: "Warm" },
    { value: "prophetic", label: "Prophetic" }, { value: "fragmented", label: "Fragmented" },
  ], default: "eerie" },
  { key: "description", label: "Description", type: "textarea", rows: 6, span: 2 },
  { key: "interpretation", label: "Interpretation", type: "textarea", rows: 3, span: 2 },
  { key: "characters", label: "Characters" },
  { key: "locations", label: "Locations" },
  { key: "was_real", label: "Was it real?", type: "select", options: [
    { value: "unknown", label: "Unknown" }, { value: "true", label: "True" }, { value: "false", label: "False" },
  ], default: "unknown" },
];

export default function Dreams() {
  return (
    <EntityPage
      title="Dreams" subtitle="Visions filtered through spore-haze. Not all of them were dreams."
      api={dreams} fields={FIELDS} testidPrefix="dream"
      searchFields={["title", "description", "interpretation", "mood"]}
      render={(d) => (
        <>
          <p className="label-arcane">{d.date} · <span className="text-[var(--accent-spore)]">{d.mood}</span></p>
          <h3 className="font-arcane text-xl mt-1">{d.title || "Untitled"}</h3>
          <p className="text-sm italic mt-2 line-clamp-4 text-[var(--text-secondary)]">{d.description}</p>
          {d.was_real && d.was_real !== "unknown" && (
            <p className="text-xs mt-2"><span className="label-arcane">verdict:</span> <span className={d.was_real === "true" ? "text-[var(--accent-spore)]" : "text-[var(--text-tertiary)]"}>{d.was_real === "true" ? "It happened." : "A spore-deception."}</span></p>
          )}
        </>
      )}
    />
  );
}
