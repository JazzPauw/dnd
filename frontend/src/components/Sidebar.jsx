import React from "react";
import { NavLink } from "react-router-dom";
import {
  Heart, BookOpen, Skull, Leaf, Moon, Sparkles, FlaskConical,
  Flower2, Network, Search, ScrollText, Users, Palette, ListTree,
  Backpack, Dice5, Settings as SettingsIcon,
} from "lucide-react";
import { useCharacter } from "@/contexts/CharacterContext";

const NAV = [
  { to: "/", key: "dashboard", label: "Living Body", icon: Heart },
  { to: "/sheet", key: "sheet", label: "Character Sheet", icon: ScrollText },
  { to: "/spells", key: "spells", label: "Spell Archive", icon: Sparkles },
  { to: "/inventory", key: "inventory", label: "Inventory", icon: Backpack },
  { to: "/macros", key: "macros", label: "Roll Macros", icon: Dice5 },
  { to: "/creatures", key: "creatures", label: "Creature Journal", icon: Skull },
  { to: "/diary", key: "diary", label: "Diary", icon: BookOpen },
  { to: "/memories", key: "memories", label: "Memories", icon: Network },
  { to: "/dreams", key: "dreams", label: "Dreams", icon: Moon },
  { to: "/fungarium", key: "fungarium", label: "Fungarium", icon: Leaf },
  { to: "/apothecary", key: "apothecary", label: "Apothecary", icon: FlaskConical },
  { to: "/cycle", key: "cycle", label: "Cycle of Death", icon: Flower2 },
  { to: "/network", key: "network", label: "The Network", icon: Network },
  { to: "/ledger", key: "ledger", label: "Activity Ledger", icon: ListTree },
  { to: "/themes", key: "themes", label: "Themes", icon: Palette },
  { to: "/characters", key: "characters", label: "Characters", icon: Users },
  { to: "/settings", key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ onOpenSearch }) {
  const { current, characters, selectCharacter } = useCharacter();
  const labels = current?.section_labels || {};

  return (
    <aside className="no-print sticky top-0 h-screen w-64 shrink-0 border-r border-white/5 px-6 py-8 flex flex-col" data-testid="sidebar">
      <div className="mb-6">
        <h1 className="font-arcane text-2xl leading-tight glow-text" data-testid="brand-title">
          The Mycelial<br/>Archive
        </h1>
        <p className="label-arcane mt-2">a living wiki</p>
      </div>

      <div className="mb-6">
        <label className="label-arcane block mb-2">Character</label>
        <select
          value={current?.id || ""}
          onChange={(e) => selectCharacter(e.target.value)}
          data-testid="character-switcher"
          className="text-sm"
        >
          {characters.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <button onClick={onOpenSearch} className="btn-organic mb-4 justify-between" data-testid="open-command-palette">
        <span className="flex items-center gap-2"><Search size={14} /> Search</span>
        <kbd className="font-mono text-[10px] opacity-70">⌘K</kbd>
      </button>

      <nav className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-0.5">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === "/"}
            className={({ isActive }) =>
              `mycelium-link group flex items-center gap-3 pl-4 pr-2 py-2 text-sm relative ${isActive ? "active" : ""}`
            }
            data-testid={`nav-${n.key}`}
          >
            <n.icon size={14} strokeWidth={1.4} className="opacity-70 group-hover:opacity-100" />
            <span className="font-heading tracking-wide">{labels[n.key] || n.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-white/5">
        <p className="font-body italic text-xs text-[var(--text-tertiary)] leading-relaxed">
          "The network remembers what flesh forgets."
        </p>
      </div>
    </aside>
  );
}
