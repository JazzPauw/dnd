import React, { useState } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter, DEFAULT_THEME } from "@/contexts/CharacterContext";
import { themes as themeApi } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";

export default function Themes() {
  const { themes, current, refreshThemes, updateCurrent, applyTheme } = useCharacter();
  const [editing, setEditing] = useState(null);

  const create = async () => {
    const fresh = { ...DEFAULT_THEME, name: "New Theme", id: undefined };
    delete fresh.id;
    const out = await themeApi.create(fresh);
    await refreshThemes();
    setEditing(out);
  };
  const save = async () => {
    if (editing.id === DEFAULT_THEME.id) { alert("Default theme is immutable."); return; }
    await themeApi.update(editing.id, editing);
    await refreshThemes();
    applyTheme(editing);
    setEditing(null);
  };
  const remove = async () => {
    if (editing.id === DEFAULT_THEME.id) return;
    if (window.confirm("Delete this theme?")) {
      await themeApi.remove(editing.id);
      await refreshThemes();
      setEditing(null);
    }
  };
  const assign = async (t) => {
    if (!current) return;
    await updateCurrent({ theme_id: t.id });
    applyTheme(t);
  };

  return (
    <div data-testid="themes-page">
      <PageHeader title="Themes" subtitle="Each vessel wears its own light."
        action={<button className="btn-organic" onClick={create} data-testid="theme-add"><Plus size={14}/> New Theme</button>} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {themes.map((t) => (
          <OrganicCard key={t.id} testid={`theme-${t.id}`} className="cursor-pointer" onClick={() => setEditing(t)}>
            <div className="flex justify-between items-center">
              <h3 className="font-arcane text-xl">{t.name}</h3>
              {current?.theme_id === t.id && <span className="label-arcane text-[var(--accent-spore)]">● active</span>}
            </div>
            <div className="flex gap-2 mt-3">
              {[t.bg_base, t.bg_surface, t.accent_glow, t.accent_spore, t.text_primary, t.text_magical].map((c, i) => (
                <span key={i} className="w-7 h-7 border border-white/10" style={{ background: c }} />
              ))}
            </div>
            <button onClick={(e) => { e.stopPropagation(); assign(t); }} className="btn-ghost mt-3 text-xs" data-testid={`theme-assign-${t.id}`}>Wear</button>
          </OrganicCard>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto" onClick={() => setEditing(null)}>
          <OrganicCard className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-arcane text-2xl mb-3">{editing.name}</h2>
            {editing.id === DEFAULT_THEME.id && <p className="text-xs italic text-[var(--text-tertiary)] mb-3">Default theme is read-only.</p>}
            <div className="grid grid-cols-2 gap-3">
              <label><span className="label-arcane">Name</span><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}/></label>
              <label><span className="label-arcane">Accent glow</span><input type="color" value={editing.accent_glow} onChange={(e) => setEditing({ ...editing, accent_glow: e.target.value })}/></label>
              <label><span className="label-arcane">Spore</span><input type="color" value={editing.accent_spore} onChange={(e) => setEditing({ ...editing, accent_spore: e.target.value })}/></label>
              <label><span className="label-arcane">Background</span><input type="color" value={editing.bg_base} onChange={(e) => setEditing({ ...editing, bg_base: e.target.value })}/></label>
              <label><span className="label-arcane">Surface</span><input type="color" value={editing.bg_surface} onChange={(e) => setEditing({ ...editing, bg_surface: e.target.value })}/></label>
              <label><span className="label-arcane">Primary text</span><input type="color" value={editing.text_primary} onChange={(e) => setEditing({ ...editing, text_primary: e.target.value })}/></label>
              <label><span className="label-arcane">Magical text</span><input type="color" value={editing.text_magical} onChange={(e) => setEditing({ ...editing, text_magical: e.target.value })}/></label>
              <label className="col-span-2"><span className="label-arcane">Heading font (CSS)</span><input value={editing.font_heading} onChange={(e) => setEditing({ ...editing, font_heading: e.target.value })}/></label>
              <label className="col-span-2"><span className="label-arcane">Body font (CSS)</span><input value={editing.font_body} onChange={(e) => setEditing({ ...editing, font_body: e.target.value })}/></label>
              <label className="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" className="!w-4" checked={!!editing.animations} onChange={(e) => setEditing({ ...editing, animations: e.target.checked })}/> Enable animations & spores</label>
            </div>
            <div className="flex justify-between gap-2 mt-4">
              {editing.id !== DEFAULT_THEME.id ? <button className="btn-danger" onClick={remove}><Trash2 size={12}/> Delete</button> : <span/>}
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button className="btn-organic" onClick={save} disabled={editing.id === DEFAULT_THEME.id} data-testid="theme-save">Preserve</button>
              </div>
            </div>
          </OrganicCard>
        </div>
      )}
    </div>
  );
}
