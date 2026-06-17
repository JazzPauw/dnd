import React from "react";
import EntityPage from "@/components/EntityPage";
import { diary } from "@/lib/api";

const today = () => new Date().toISOString().slice(0, 10);

const FIELDS = [
  { key: "title", label: "Title", default: "Untitled entry" },
  { key: "date", label: "Date", default: today() },
  { key: "tags", label: "Tags (comma sep)", span: 2 },
  { key: "body", label: "Entry", type: "textarea", rows: 10, span: 2 },
  { key: "image", label: "Image URL", span: 2 },
];

export default function Diary() {
  return (
    <EntityPage
      title="Diary" subtitle="Chronological. Pages settle like leaf-litter — each one decomposing into the next."
      api={diary} fields={FIELDS} testidPrefix="diary"
      searchFields={["title", "body", "tags"]}
      render={(d) => (
        <>
          <p className="label-arcane">{d.date}</p>
          <h3 className="font-arcane text-xl mt-1">{d.title}</h3>
          <p className="text-sm mt-2 line-clamp-4 italic">{d.body}</p>
          {d.tags && <p className="text-xs mt-2 text-[var(--accent-spore)]">{String(d.tags).split(",").map((t) => `#${t.trim()}`).join(" ")}</p>}
        </>
      )}
    />
  );
}
