import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Heart, BookOpen, Skull, Leaf, Moon, Sparkles, FlaskConical,
  Flower2, Network, Search, ScrollText, Users, Palette, ListTree,
} from "lucide-react";
import { useCharacter } from "@/contexts/CharacterContext";

const NAV = [
  { to: "/", label: "Living Body", icon: Heart, testid: "nav-dashboard" },
  { to: "/sheet", label: "Character Sheet", icon: ScrollText, testid: "nav-sheet" },
  { to: "/spells", label: "Spell Archive", icon: Sparkles, testid: "nav-spells" },
  { to: "/creatures", label: "Creature Journal", icon: Skull, testid: "nav-creatures" },
  { to: "/diary", label: "Diary", icon: BookOpen, testid: "nav-diary" },
  { to: "/memories", label: "Memories", icon: Network, testid: "nav-memories" },
  { to: "/dreams", label: "Dreams", icon: Moon, testid: "nav-dreams" },
  { to: "/fungarium", label: "Fungarium", icon: Leaf, testid: "nav-fungarium" },
  { to: "/apothecary", label: "Apothecary", icon: FlaskConical, testid: "nav-apothecary" },
  { to: "/cycle", label: "Cycle of Death", icon: Flower2, testid: "nav-cycle" },
  { to: "/network", label: "The Network", icon: Network, testid: "nav-network" },
  { to: "/ledger", label: "Activity Ledger", icon: ListTree, testid: "nav-ledger" },
  { to: "/themes", label: "Themes", icon: Palette, testid: "nav-themes" },
  { to: "/characters", label: "Characters", icon: Users, testid: "nav-characters" },
];

export default function Sidebar({ onOpenSearch }) {
  const { current, characters, selectCharacter } = useCharacter();
  const nav = useNavigate();

  return (
    <aside className="no-print sticky top-0 h-screen w-64 shrink-0 border-r border-white/5 px-6 py-8 flex flex-col" data-testid="sidebar">
      <div className="mb-6">
        <h1 className="font-arcane text-2xl leading-tight glow-text" data-testid="brand-title">
          The Mycelial<br/>Archive
        </h1>
        <p className="label-arcane mt-2">a living wiki</p>
      </div>

      {/* Character switcher */}
      <div className="mb-6">
        <label className="label-arcane block mb-2">Vessel</label>
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

      <button
        onClick={onOpenSearch}
        className="btn-organic mb-4 justify-between"
        data-testid="open-command-palette"
      >
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
            data-testid={n.testid}
          >
            <n.icon size={14} strokeWidth={1.4} className="opacity-70 group-hover:opacity-100" />
            <span className="font-heading tracking-wide">{n.label}</span>
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
