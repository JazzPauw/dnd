// Built-in D&D class theme presets. Each carries a unique palette + particle effect type
// consumed by SporeCanvas to render thematic background motes.
export const CLASS_THEMES = [
  { id: "class-druid",     name: "Druid · Mycelial",   accent_glow: "#9d4cdd", accent_spore: "#b47ee5", bg_base: "#070907", bg_surface: "#101411", text_primary: "#e4dcd3", text_magical: "#c69bf1", font_heading: "'Gloock', serif",          font_body: "'Crimson Text', serif",      animations: true, effect: "spore" },
  { id: "class-ranger",    name: "Ranger · Wildwood",  accent_glow: "#6fa463", accent_spore: "#a8c98f", bg_base: "#0a0d09", bg_surface: "#121610", text_primary: "#e4ddc5", text_magical: "#c2dca0", font_heading: "'Cormorant Garamond', serif", font_body: "'Crimson Text', serif",  animations: true, effect: "leaf" },
  { id: "class-wizard",    name: "Wizard · Arcana",    accent_glow: "#5aa7e6", accent_spore: "#8fc8f0", bg_base: "#06080d", bg_surface: "#0d1018", text_primary: "#dde2ea", text_magical: "#a8c8ff", font_heading: "'Gloock', serif",          font_body: "'Cormorant Garamond', serif", animations: true, effect: "rune" },
  { id: "class-sorcerer",  name: "Sorcerer · Ember",   accent_glow: "#e85c2c", accent_spore: "#f59861", bg_base: "#0a0604", bg_surface: "#150a06", text_primary: "#f0d9c3", text_magical: "#ffb27a", font_heading: "'Gloock', serif",          font_body: "'Crimson Text', serif",      animations: true, effect: "ember" },
  { id: "class-warlock",   name: "Warlock · Voidwhisper", accent_glow: "#7c2bb8", accent_spore: "#ad57f0", bg_base: "#050308", bg_surface: "#0d0716", text_primary: "#d8c8e8", text_magical: "#d29bff", font_heading: "'Gloock', serif",       font_body: "'Crimson Text', serif",      animations: true, effect: "wisp" },
  { id: "class-cleric",    name: "Cleric · Dawnlight", accent_glow: "#e3c66b", accent_spore: "#f3dd9a", bg_base: "#0e0c08", bg_surface: "#191510", text_primary: "#ece2c6", text_magical: "#ffe9a8", font_heading: "'Cormorant Garamond', serif", font_body: "'Crimson Text', serif",  animations: true, effect: "mote" },
  { id: "class-paladin",   name: "Paladin · Oathbound", accent_glow: "#d4a843", accent_spore: "#ffd07a", bg_base: "#0c0a06", bg_surface: "#16110a", text_primary: "#eee0b8", text_magical: "#ffd97a", font_heading: "'Gloock', serif",         font_body: "'Cormorant Garamond', serif", animations: true, effect: "halo" },
  { id: "class-fighter",   name: "Fighter · Forge",    accent_glow: "#c75c3a", accent_spore: "#d97a4b", bg_base: "#0b0807", bg_surface: "#16100d", text_primary: "#e8d3c4", text_magical: "#f0a07a", font_heading: "'Gloock', serif",          font_body: "'Crimson Text', serif",      animations: true, effect: "spark" },
  { id: "class-barbarian", name: "Barbarian · Bloodmoon", accent_glow: "#a32a2a", accent_spore: "#d04c4c", bg_base: "#0a0404", bg_surface: "#1a0808", text_primary: "#e6c8c0", text_magical: "#ff7a7a", font_heading: "'Gloock', serif",      font_body: "'Crimson Text', serif",      animations: true, effect: "blood" },
  { id: "class-bard",      name: "Bard · Crescendo",   accent_glow: "#d04c8c", accent_spore: "#f08fc0", bg_base: "#0c0610", bg_surface: "#18101c", text_primary: "#ecd6e0", text_magical: "#ffa8d8", font_heading: "'Cormorant Garamond', serif", font_body: "'Crimson Text', serif",  animations: true, effect: "note" },
  { id: "class-rogue",     name: "Rogue · Shadowstep", accent_glow: "#3aa28e", accent_spore: "#6fd5c0", bg_base: "#040806", dbg_surface: "#0a120e", text_primary: "#c8d8d2", text_magical: "#86ead4", font_heading: "'Gloock', serif",         font_body: "'Crimson Text', serif",      animations: true, effect: "shadow" },
  { id: "class-monk",      name: "Monk · Ki",          accent_glow: "#5fc8d4", accent_spore: "#9fe2e8", bg_base: "#06090a", bg_surface: "#0d1416", text_primary: "#d6e2e4", text_magical: "#a6e8ee", font_heading: "'Cormorant Garamond', serif", font_body: "'Crimson Text', serif",  animations: true, effect: "ki" },
  { id: "class-artificer", name: "Artificer · Cogwork",accent_glow: "#c89744", accent_spore: "#e8b865", bg_base: "#0a0805", bg_surface: "#14100a", text_primary: "#e6dac0", text_magical: "#f0c878", font_heading: "'JetBrains Mono', monospace", font_body: "'Crimson Text', serif", animations: true, effect: "gear" },
];

export const EFFECT_PALETTE = {
  spore:  { hueRange: [265, 295], shape: "circle", driftY: -0.05 },
  leaf:   { hueRange: [85, 130],  shape: "leaf",   driftY:  0.04 },
  rune:   { hueRange: [200, 230], shape: "rune",   driftY: -0.02 },
  ember:  { hueRange: [10, 35],   shape: "circle", driftY: -0.12, flicker: true },
  wisp:   { hueRange: [275, 305], shape: "circle", driftY: -0.08, sinuous: true },
  mote:   { hueRange: [45, 60],   shape: "circle", driftY: -0.03, soft: true },
  halo:   { hueRange: [40, 55],   shape: "ring",   driftY: -0.04 },
  spark:  { hueRange: [15, 30],   shape: "spark",  driftY: -0.18, flicker: true },
  blood:  { hueRange: [355, 10],  shape: "drop",   driftY:  0.10 },
  note:   { hueRange: [310, 340], shape: "note",   driftY: -0.05, sinuous: true },
  shadow: { hueRange: [160, 185], shape: "dagger", driftY:  0.0,  fast: true },
  ki:     { hueRange: [175, 200], shape: "circle", driftY: -0.04, soft: true },
  gear:   { hueRange: [35, 50],   shape: "gear",   driftY:  0.0,  rotate: true },
};
