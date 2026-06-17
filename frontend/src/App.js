import React, { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CharacterProvider, useCharacter } from "@/contexts/CharacterContext";
import SporeCanvas from "@/components/SporeCanvas";
import Sidebar from "@/components/Sidebar";
import CommandPalette from "@/components/CommandPalette";
import Dashboard from "@/pages/Dashboard";
import CharacterSheet from "@/pages/CharacterSheet";
import Spells from "@/pages/Spells";
import Creatures from "@/pages/Creatures";
import Diary from "@/pages/Diary";
import Memories from "@/pages/Memories";
import Dreams from "@/pages/Dreams";
import Fungarium from "@/pages/Fungarium";
import Apothecary from "@/pages/Apothecary";
import CycleOfDeath from "@/pages/CycleOfDeath";
import Network from "@/pages/Network";
import Ledger from "@/pages/Ledger";
import Themes from "@/pages/Themes";
import Characters from "@/pages/Characters";
import Inventory from "@/pages/Inventory";
import Macros from "@/pages/Macros";
import Settings from "@/pages/Settings";
import { Toaster } from "sonner";
import { Printer } from "lucide-react";

function Shell() {
  const { loading, theme } = useCharacter();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setPaletteOpen((v) => !v);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-arcane text-2xl glow-text">awakening…</div>;

  const animations = theme?.animations !== false;

  return (
    <>
      {animations && <SporeCanvas />}
      <div className="app-shell flex">
        <Sidebar onOpenSearch={() => setPaletteOpen(true)} />
        <main className="flex-1 p-8 max-w-[1400px] mx-auto" data-testid="main-content">
          <div className="flex justify-end mb-2 no-print gap-2">
            <button onClick={() => window.print()} className="btn-ghost text-xs" data-testid="export-pdf-btn"><Printer size={12}/> Export this page</button>
          </div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sheet" element={<CharacterSheet />} />
            <Route path="/spells" element={<Spells />} />
            <Route path="/creatures" element={<Creatures />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/dreams" element={<Dreams />} />
            <Route path="/fungarium" element={<Fungarium />} />
            <Route path="/apothecary" element={<Apothecary />} />
            <Route path="/cycle" element={<CycleOfDeath />} />
            <Route path="/network" element={<Network />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/themes" element={<Themes />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/macros" element={<Macros />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <CharacterProvider>
          <Shell />
        </CharacterProvider>
      </BrowserRouter>
    </div>
  );
}
