import React, { useEffect, useState } from "react";
import OrganicCard from "@/components/OrganicCard";
import PageHeader from "@/components/PageHeader";
import MushroomDecor from "@/components/MushroomDecor";
import { useCharacter } from "@/contexts/CharacterContext";
import { resources, effects, longRest, shortRest } from "@/lib/api";
import { Plus, Trash2, Moon, Sun, Dice5 } from "lucide-react";

const restoreLabel = { never: "Never", short: "Short Rest", long: "Long Rest" };

export default function Dashboard() {
  const { current, updateCurrent } = useCharacter();
  const [resList, setResList] = useState([]);
  const [effList, setEffList] = useState([]);
  const [restMessage, setRestMessage] = useState(null);

  const load = async () => {
    if (!current) return;
    const [r, e] = await Promise.all([resources.list({ character_id: current.id }), effects.list({ character_id: current.id })]);
    setResList(r); setEffList(e);
  };
  useEffect(() => { load(); }, [current?.id]);

  if (!current) return null;
  const hpPct = Math.max(0, Math.min(100, (current.hp_current / Math.max(1, current.hp_max)) * 100));

  const adjustHp = async (delta) => {
    const next = Math.max(0, Math.min(current.hp_max, current.hp_current + delta));
    await updateCurrent({ hp_current: next });
  };
  const updateField = async (k, v) => {
    const num = typeof current[k] === "number" ? Number(v) : v;
    await updateCurrent({ [k]: num });
  };

  const doLongRest = async () => {
    await longRest(current.id);
    setRestMessage(["The Network feeds.", "Flesh restored.", "Memories preserved."]);
    await load();
    setTimeout(() => setRestMessage(null), 3200);
    // refresh character
    window.dispatchEvent(new Event("mycelium:refresh"));
  };
  const doShortRest = async () => {
    await shortRest(current.id);
    setRestMessage(["Spores settle.", "Breath returns."]);
    await load();
    setTimeout(() => setRestMessage(null), 2400);
  };

  const addResource = async () => {
    const name = prompt("Resource name?");
    if (!name) return;
    await resources.create({ character_id: current.id, name, current: 1, maximum: 1, restore_on: "long" });
    load();
  };
  const removeResource = async (id) => { await resources.remove(id); load(); };
  const adjustResource = async (r, delta) => {
    const next = Math.max(0, Math.min(r.maximum, r.current + delta));
    await resources.update(r.id, { ...r, current: next });
    load();
  };

  const addEffect = async () => {
    const name = prompt("Effect name? (e.g. Concentration: Hunter's Mark)");
    if (!name) return;
    await effects.create({ character_id: current.id, name, type: "buff", notes: "" });
    load();
  };
  const removeEffect = async (id) => { await effects.remove(id); load(); };

  return (
    <div className="relative" data-testid="dashboard-page">
      <MushroomDecor position="bottom-right" />
      <PageHeader
        title="The Living Body"
        subtitle={`${current.name} · ${current.race} · ${current.classes}`}
        testid="dashboard-header"
        action={
          <div className="flex gap-2 flex-wrap">
            <button className="btn-organic" onClick={doShortRest} data-testid="short-rest-btn"><Sun size={14}/> Short Rest</button>
            <button className="btn-organic" onClick={doLongRest} data-testid="long-rest-btn"><Moon size={14}/> Long Rest</button>
          </div>
        }
      />

      {restMessage && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center">
            {restMessage.map((line, i) => (
              <p key={i} className="font-arcane text-3xl sm:text-5xl glow-text grow-in" style={{ animationDelay: `${i * 0.45}s` }}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* HP & vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <OrganicCard className="md:col-span-2" testid="hp-card">
          <div className="flex items-center justify-between mb-3">
            <p className="label-arcane">Hit points</p>
            <div className="flex items-center gap-1">
              <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => adjustHp(-1)} data-testid="hp-decrement">-1</button>
              <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => adjustHp(-5)}>-5</button>
              <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => adjustHp(+1)} data-testid="hp-increment">+1</button>
              <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => adjustHp(+5)}>+5</button>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <input className="font-mono !w-24 text-3xl !text-3xl text-center" type="number" value={current.hp_current} onChange={(e) => updateField("hp_current", e.target.value)} data-testid="hp-current-input" />
            <span className="text-[var(--text-tertiary)] font-mono">/</span>
            <input className="font-mono !w-24 text-3xl text-center" type="number" value={current.hp_max} onChange={(e) => updateField("hp_max", e.target.value)} data-testid="hp-max-input" />
            <span className="ml-4 label-arcane">Temp</span>
            <input className="font-mono !w-20" type="number" value={current.hp_temp} onChange={(e) => updateField("hp_temp", e.target.value)} data-testid="hp-temp-input" />
          </div>
          <div className="hp-bar mt-4"><div className="hp-bar-fill" style={{ width: `${hpPct}%` }} /></div>
        </OrganicCard>

        <OrganicCard testid="vitals-card">
          <p className="label-arcane mb-3">Vitals</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ["AC", "ac"], ["Init", "initiative"], ["Spd", "speed"],
              ["DC", "spell_save_dc"], ["Atk", "spell_attack"], ["PP", "passive_perception"],
            ].map(([lbl, k]) => (
              <div key={k}>
                <p className="label-arcane">{lbl}</p>
                <input className="font-mono text-xl text-center" type="number" value={current[k]} onChange={(e) => updateField(k, e.target.value)} data-testid={`vital-${k}`} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="!w-4" checked={!!current.inspiration} onChange={(e) => updateCurrent({ inspiration: e.target.checked })} data-testid="inspiration-toggle" />
              <span>Inspiration</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="label-arcane">Exhaust</span>
              <input className="font-mono !w-14" type="number" value={current.exhaustion} onChange={(e) => updateField("exhaustion", e.target.value)} data-testid="exhaustion-input" />
            </label>
          </div>
        </OrganicCard>
      </div>

      {/* Resources */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-arcane text-2xl">Resources</h2>
          <button className="btn-organic" onClick={addResource} data-testid="add-resource"><Plus size={14}/> New</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {resList.length === 0 && <p className="text-sm italic text-[var(--text-tertiary)]">No bound resources. Wild Shape, Sorcery Points, custom counters belong here.</p>}
          {resList.map((r) => (
            <OrganicCard key={r.id} testid={`resource-${r.id}`}>
              <div className="flex justify-between items-start">
                <input className="!bg-transparent !border-0 !p-0 font-heading text-lg" value={r.name} onChange={(e) => resources.update(r.id, { ...r, name: e.target.value }).then(load)} data-testid={`resource-name-${r.id}`} />
                <button onClick={() => removeResource(r.id)} className="btn-ghost p-1" data-testid={`resource-delete-${r.id}`}><Trash2 size={12}/></button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => adjustResource(r, -1)} data-testid={`resource-dec-${r.id}`}>-</button>
                <span className="font-mono text-2xl">{r.current}</span>
                <span className="text-[var(--text-tertiary)] font-mono">/</span>
                <input className="font-mono !w-14" type="number" value={r.maximum} onChange={(e) => resources.update(r.id, { ...r, maximum: Number(e.target.value) }).then(load)} />
                <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => adjustResource(r, +1)} data-testid={`resource-inc-${r.id}`}>+</button>
              </div>
              <select value={r.restore_on} onChange={(e) => resources.update(r.id, { ...r, restore_on: e.target.value }).then(load)} className="text-xs mt-3" data-testid={`resource-restore-${r.id}`}>
                <option value="never">Never restores</option>
                <option value="short">Short rest</option>
                <option value="long">Long rest</option>
              </select>
            </OrganicCard>
          ))}
        </div>
      </div>

      {/* Effects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-arcane text-2xl">Current Effects</h2>
          <button className="btn-organic" onClick={addEffect} data-testid="add-effect"><Plus size={14}/> New</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {effList.length === 0 && <p className="text-sm italic text-[var(--text-tertiary)]">No active effects. The body is quiet.</p>}
          {effList.map((e) => (
            <OrganicCard key={e.id} testid={`effect-${e.id}`}>
              <div className="flex justify-between items-start gap-2">
                <input value={e.name} className="!bg-transparent !border-0 !p-0 font-heading text-base" onChange={(ev) => effects.update(e.id, { ...e, name: ev.target.value }).then(load)} />
                <button onClick={() => removeEffect(e.id)} className="btn-ghost p-1"><Trash2 size={12}/></button>
              </div>
              <select value={e.type || "buff"} onChange={(ev) => effects.update(e.id, { ...e, type: ev.target.value }).then(load)} className="text-xs mt-2">
                <option value="concentration">Concentration</option>
                <option value="condition">Condition</option>
                <option value="buff">Buff</option>
                <option value="debuff">Debuff</option>
                <option value="summon">Summon</option>
                <option value="custom">Custom</option>
              </select>
              <textarea placeholder="Notes…" value={e.notes || ""} onChange={(ev) => effects.update(e.id, { ...e, notes: ev.target.value }).then(load)} className="text-xs mt-2" />
            </OrganicCard>
          ))}
        </div>
      </div>
    </div>
  );
}
