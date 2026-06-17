import React from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";

const ATTRS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const SKILLS = [
  ["Acrobatics", "DEX"], ["Animal Handling", "WIS"], ["Arcana", "INT"],
  ["Athletics", "STR"], ["Deception", "CHA"], ["History", "INT"],
  ["Insight", "WIS"], ["Intimidation", "CHA"], ["Investigation", "INT"],
  ["Medicine", "WIS"], ["Nature", "INT"], ["Perception", "WIS"],
  ["Performance", "CHA"], ["Persuasion", "CHA"], ["Religion", "INT"],
  ["Sleight of Hand", "DEX"], ["Stealth", "DEX"], ["Survival", "WIS"],
];

const mod = (score) => Math.floor((Number(score) - 10) / 2);

export default function CharacterSheet() {
  const { current, updateCurrent } = useCharacter();
  if (!current) return null;

  const setField = (k, v) => updateCurrent({ [k]: v });
  const setAttr = (a, field, v) => {
    const attrs = { ...current.attributes, [a]: { ...current.attributes[a], [field]: field === "score" ? Number(v) : v } };
    updateCurrent({ attributes: attrs });
  };
  const setSkill = (s, field, v) => {
    const skills = { ...(current.skills || {}) };
    const cur = skills[s] || { prof: false, expertise: false, custom_mod: 0 };
    cur[field] = field === "custom_mod" ? Number(v) : v;
    skills[s] = cur;
    updateCurrent({ skills });
  };
  const rollSkill = (s, ability) => {
    const sk = (current.skills || {})[s] || {};
    const m = mod(current.attributes[ability]?.score || 10) + (sk.prof ? current.proficiency_bonus : 0) + (sk.expertise ? current.proficiency_bonus : 0) + (sk.custom_mod || 0);
    const die = Math.floor(Math.random() * 20) + 1;
    alert(`${s}: d20(${die}) ${m >= 0 ? "+" : ""}${m} = ${die + m}`);
  };

  return (
    <div data-testid="sheet-page">
      <PageHeader title="Character Sheet" subtitle="Every facet of the vessel — editable, mutable, alive." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <OrganicCard className="lg:col-span-2">
          <p className="label-arcane mb-3">Identity</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Name", "name"], ["Race", "race"], ["Classes", "classes"],
              ["Background", "background"], ["Alignment", "alignment"], ["Portrait URL", "portrait"],
            ].map(([lbl, k]) => (
              <label key={k} className="text-sm">
                <span className="label-arcane block mb-1">{lbl}</span>
                <input value={current[k] || ""} onChange={(e) => setField(k, e.target.value)} data-testid={`identity-${k}`} />
              </label>
            ))}
            <label className="text-sm">
              <span className="label-arcane block mb-1">Level</span>
              <input type="number" value={current.level} onChange={(e) => setField("level", Number(e.target.value))} />
            </label>
            <label className="text-sm">
              <span className="label-arcane block mb-1">Proficiency</span>
              <input type="number" value={current.proficiency_bonus} onChange={(e) => setField("proficiency_bonus", Number(e.target.value))} />
            </label>
          </div>
          <label className="text-sm block mt-3">
            <span className="label-arcane block mb-1">Backstory</span>
            <textarea rows={5} value={current.backstory || ""} onChange={(e) => setField("backstory", e.target.value)} data-testid="backstory-input" />
          </label>
        </OrganicCard>

        <OrganicCard>
          <p className="label-arcane mb-3">Attributes</p>
          <div className="space-y-3">
            {ATTRS.map((a) => {
              const score = current.attributes?.[a]?.score ?? 10;
              const m = mod(score);
              const sp = current.attributes?.[a]?.save_prof;
              const save = m + (sp ? current.proficiency_bonus : 0);
              return (
                <div key={a} className="flex items-center gap-2" data-testid={`attr-${a}`}>
                  <span className="label-arcane w-10">{a}</span>
                  <input className="font-mono !w-16 text-center" type="number" value={score} onChange={(e) => setAttr(a, "score", e.target.value)} />
                  <span className="font-mono text-[var(--accent-spore)] w-8">{m >= 0 ? `+${m}` : m}</span>
                  <label className="text-xs flex items-center gap-1 ml-2">
                    <input type="checkbox" className="!w-3" checked={!!sp} onChange={(e) => setAttr(a, "save_prof", e.target.checked)} />
                    save {save >= 0 ? `+${save}` : save}
                  </label>
                </div>
              );
            })}
          </div>
        </OrganicCard>
      </div>

      <OrganicCard className="mb-6">
        <p className="label-arcane mb-3">Skills (click to roll)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SKILLS.map(([s, ab]) => {
            const sk = (current.skills || {})[s] || {};
            const m = mod(current.attributes?.[ab]?.score || 10) + (sk.prof ? current.proficiency_bonus : 0) + (sk.expertise ? current.proficiency_bonus : 0) + (sk.custom_mod || 0);
            return (
              <div key={s} className="flex items-center gap-2 text-sm py-1 px-2 hover:bg-white/5 rounded-sm">
                <input type="checkbox" title="Proficient" className="!w-3" checked={!!sk.prof} onChange={(e) => setSkill(s, "prof", e.target.checked)} />
                <input type="checkbox" title="Expertise" className="!w-3" checked={!!sk.expertise} onChange={(e) => setSkill(s, "expertise", e.target.checked)} />
                <button onClick={() => rollSkill(s, ab)} className="flex-1 text-left font-heading" data-testid={`skill-${s}`}>{s} <span className="text-[var(--text-tertiary)] text-xs">({ab})</span></button>
                <span className="font-mono text-[var(--accent-spore)]">{m >= 0 ? `+${m}` : m}</span>
              </div>
            );
          })}
        </div>
      </OrganicCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <OrganicCard>
          <p className="label-arcane mb-3">Currency</p>
          <div className="grid grid-cols-5 gap-2">
            {["pp","gp","ep","sp","cp"].map((c) => (
              <label key={c} className="text-center">
                <span className="label-arcane">{c.toUpperCase()}</span>
                <input className="font-mono text-center" type="number" value={(current.currency || {})[c] || 0} onChange={(e) => updateCurrent({ currency: { ...current.currency, [c]: Number(e.target.value) } })} />
              </label>
            ))}
          </div>
        </OrganicCard>
        <OrganicCard>
          <p className="label-arcane mb-3">Hit Dice</p>
          <div className="grid grid-cols-3 gap-2">
            <label><span className="label-arcane">Type</span><input value={current.hit_dice} onChange={(e) => setField("hit_dice", e.target.value)} /></label>
            <label><span className="label-arcane">Current</span><input type="number" value={current.hit_dice_current} onChange={(e) => setField("hit_dice_current", Number(e.target.value))} /></label>
            <label><span className="label-arcane">Max</span><input type="number" value={current.hit_dice_max} onChange={(e) => setField("hit_dice_max", Number(e.target.value))} /></label>
          </div>
        </OrganicCard>
      </div>

      <OrganicCard className="mb-6">
        <p className="label-arcane mb-3">Languages & Proficiencies</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label><span className="label-arcane">Languages (comma separated)</span><input value={(current.languages || []).join(", ")} onChange={(e) => updateCurrent({ languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></label>
          <label><span className="label-arcane">Proficiencies</span><input value={(current.proficiencies || []).join(", ")} onChange={(e) => updateCurrent({ proficiencies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></label>
        </div>
      </OrganicCard>
    </div>
  );
}
