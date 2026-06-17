import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { characters as charApi, themes as themesApi } from "@/lib/api";

const CharacterContext = createContext(null);

import { CLASS_THEMES } from "@/lib/classThemes";

export const DEFAULT_THEME = CLASS_THEMES[0]; // Druid · Mycelial

const applyTheme = (theme) => {
  const t = { ...DEFAULT_THEME, ...(theme || {}) };
  const r = document.documentElement;
  r.style.setProperty("--accent-glow", t.accent_glow);
  r.style.setProperty("--accent-spore", t.accent_spore);
  r.style.setProperty("--bg-base", t.bg_base);
  r.style.setProperty("--bg-surface", t.bg_surface);
  r.style.setProperty("--text-primary", t.text_primary);
  r.style.setProperty("--text-magical", t.text_magical);
  r.style.setProperty("--font-arcane", t.font_heading);
  r.style.setProperty("--font-body", t.font_body);
  r.dataset.animations = t.animations ? "on" : "off";
};

export const CharacterProvider = ({ children }) => {
  const [characters, setCharacters] = useState([]);
  const [current, setCurrent] = useState(null);
  const [themes, setThemes] = useState([DEFAULT_THEME]);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  const refreshCharacters = useCallback(async () => {
    const list = await charApi.list();
    setCharacters(list);
    return list;
  }, []);

  const refreshThemes = useCallback(async () => {
    const list = await themesApi.list();
    setThemes([...CLASS_THEMES, ...list]);
    return list;
  }, []);

  // initial load: ensure at least one character (the Wood Elf)
  useEffect(() => {
    (async () => {
      try {
        let list = await refreshCharacters();
        await refreshThemes();
        if (list.length === 0) {
          const seed = await charApi.create({
            name: "Sylven Mycel",
            race: "Wood Elf",
            classes: "Swarm Ranger / Circle of Spores Druid",
            level: 1,
            backstory:
              "He spent centuries fascinated by fungi and mycelium. He believed mushrooms were nature's hidden intelligence. They recycle death. Preserve memory. Quietly shape ecosystems. At some point he died — and the network reclaimed him. He awoke changed. Sustained by spores, forever connected to an invisible network beneath the earth.",
            hp_current: 12, hp_max: 12, ac: 14, speed: 30, initiative: 2, passive_perception: 14,
          });
          list = [seed];
          setCharacters(list);
        }
        const savedId = localStorage.getItem("mycelium:currentId");
        const chosen = list.find((c) => c.id === savedId) || list[0];
        setCurrent(chosen);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshCharacters, refreshThemes]);

  // apply theme whenever current character or themes change
  useEffect(() => {
    if (!current) return;
    const t = themes.find((x) => x.id === current.theme_id) || DEFAULT_THEME;
    setTheme(t);
    applyTheme(t);
  }, [current, themes]);

  const selectCharacter = useCallback((id) => {
    const c = characters.find((x) => x.id === id);
    if (c) {
      setCurrent(c);
      localStorage.setItem("mycelium:currentId", id);
    }
  }, [characters]);

  const updateCurrent = useCallback(async (patch) => {
    if (!current) return;
    const updated = await charApi.update(current.id, { ...current, ...patch });
    setCurrent(updated);
    setCharacters((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    return updated;
  }, [current]);

  const value = {
    characters, current, theme, themes, loading,
    refreshCharacters, refreshThemes, selectCharacter, updateCurrent, setCurrent,
    applyTheme,
  };
  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
};

export const useCharacter = () => {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("useCharacter must be used within CharacterProvider");
  return ctx;
};
