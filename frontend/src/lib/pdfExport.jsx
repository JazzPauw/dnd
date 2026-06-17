import React from "react";
import { pdf, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Use @react-pdf built-in fonts only (Times-Roman, Helvetica, Courier).
// No external Font.register => zero network fetches, instant generation, offline-safe.
const FONT_SERIF = "Times-Roman";
const FONT_SERIF_BOLD = "Times-Bold";
const FONT_SERIF_ITALIC = "Times-Italic";
const FONT_SANS = "Helvetica";

// ---- Theme palettes ----
const DARK = {
  bg: "#0b0e0b",
  surface: "#13181a",
  border: "#2a2f2b",
  text: "#e4dcd3",
  textDim: "#a8a29a",
  textFaint: "#6c665f",
  accent: "#c69bf1",
  accentDim: "#9d4cdd",
  rule: "#3a3f37",
};
const LIGHT = {
  bg: "#ffffff",
  surface: "#ffffff",
  border: "#222222",
  text: "#000000",
  textDim: "#222222",
  textFaint: "#555555",
  accent: "#3a1d6e",
  accentDim: "#3a1d6e",
  rule: "#000000",
};

const buildStyles = (P) =>
  StyleSheet.create({
    page: {
      backgroundColor: P.bg,
      color: P.text,
      paddingTop: 56,
      paddingBottom: 64,
      paddingHorizontal: 56,
      fontFamily: FONT_SERIF,
      fontSize: 11,
      lineHeight: 1.55,
    },
    headerBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 0.5,
      borderBottomColor: P.rule,
      paddingBottom: 6,
      marginBottom: 24,
      fontFamily: FONT_SANS,
      fontSize: 8,
      letterSpacing: 3,
      color: P.textFaint,
      textTransform: "uppercase",
    },
    kicker: {
      fontFamily: FONT_SANS,
      fontSize: 9,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: P.accent,
      marginBottom: 6,
    },
    title: {
      fontFamily: FONT_SERIF_BOLD,
      fontSize: 32,
      color: P.text,
      lineHeight: 1.1,
      marginBottom: 6,
    },
    subtitle: {
      fontFamily: FONT_SERIF_ITALIC,
      fontSize: 13,
      color: P.textDim,
      marginBottom: 22,
    },
    rule: {
      height: 0.5,
      backgroundColor: P.rule,
      marginBottom: 20,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 18,
    },
    metaCell: {
      width: "33%",
      marginBottom: 10,
      paddingRight: 8,
    },
    metaLabel: {
      fontFamily: FONT_SANS,
      fontSize: 7.5,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: P.textFaint,
      marginBottom: 2,
    },
    metaValue: {
      fontFamily: FONT_SERIF,
      fontSize: 11,
      color: P.text,
    },
    section: { marginBottom: 16 },
    sectionLabel: {
      fontFamily: FONT_SANS,
      fontSize: 8,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: P.accent,
      marginBottom: 6,
    },
    body: {
      fontFamily: FONT_SERIF,
      fontSize: 11,
      color: P.text,
      lineHeight: 1.6,
    },
    bodyItalic: {
      fontFamily: FONT_SERIF_ITALIC,
      fontSize: 11,
      color: P.textDim,
      lineHeight: 1.6,
    },
    pill: {
      borderWidth: 0.5,
      borderColor: P.border,
      paddingVertical: 2,
      paddingHorizontal: 6,
      marginRight: 4,
      fontSize: 8,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: P.textDim,
    },
    pillsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
    image: {
      width: "100%",
      maxHeight: 220,
      objectFit: "cover",
      marginBottom: 16,
      borderWidth: 0.5,
      borderColor: P.border,
    },
    footer: {
      position: "absolute",
      bottom: 28,
      left: 56,
      right: 56,
      flexDirection: "row",
      justifyContent: "space-between",
      fontFamily: FONT_SANS,
      fontSize: 7.5,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: P.textFaint,
      borderTopWidth: 0.5,
      borderTopColor: P.rule,
      paddingTop: 6,
    },
  });

const fmtDate = () =>
  new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// ---- Per-entity layouts ----
// Each layout returns: { kicker, title, subtitle, meta: [{label,value}], pills: [str], sections: [{label, value, italic?}], image }

const truncate = (v) => (v === undefined || v === null || v === "" ? null : String(v));

const layouts = {
  spell: (s) => ({
    kicker: `Level ${s.level} · ${s.school || "—"}`,
    title: s.name || "Unnamed Spell",
    subtitle: `${(s.source || "spell").toString().toUpperCase()} GRIMOIRE`,
    meta: [
      { label: "Casting Time", value: truncate(s.casting_time) },
      { label: "Range", value: truncate(s.range) },
      { label: "Duration", value: truncate(s.duration) },
      { label: "Components", value: truncate(s.components) },
      { label: "School", value: truncate(s.school) },
      { label: "Source", value: truncate(s.source) },
    ],
    pills: [
      s.always_prepared && "Always Prepared",
      s.prepared && !s.always_prepared && "Prepared",
      s.concentration && "Concentration",
      s.ritual && "Ritual",
    ].filter(Boolean),
    sections: [
      { label: "Description", value: truncate(s.description) },
      { label: "Notes", value: truncate(s.notes), italic: true },
    ],
  }),
  memory: (m) => ({
    kicker: m.truth ? String(m.truth).toUpperCase() : "MEMORY",
    title: m.title || "Untitled memory",
    subtitle: [m.date, m.location].filter(Boolean).join(" · "),
    meta: [
      { label: "Date", value: truncate(m.date) },
      { label: "Location", value: truncate(m.location) },
      { label: "Significance", value: m.significance ? `${m.significance} / 5` : null },
      { label: "Characters", value: truncate(m.characters) },
      { label: "Truth Status", value: truncate(m.truth) },
    ],
    image: m.image,
    sections: [{ label: "Recollection", value: truncate(m.description) }],
  }),
  recipe: (r) => ({
    kicker: r.category ? String(r.category).toUpperCase() : "RECIPE",
    title: r.name || "Unnamed brew",
    subtitle: r.success_chance != null ? `Success chance · ${r.success_chance}%` : "",
    meta: [
      { label: "Category", value: truncate(r.category) },
      { label: "Success", value: r.success_chance != null ? `${r.success_chance}%` : null },
    ],
    sections: [
      { label: "Ingredients", value: truncate(r.ingredients) },
      { label: "Process", value: truncate(r.process) },
      { label: "Effects", value: truncate(r.effects) },
      { label: "Side Effects", value: truncate(r.side_effects), italic: true },
      { label: "Notes", value: truncate(r.notes), italic: true },
    ],
  }),
  death: (d) => ({
    kicker: "CYCLE OF DEATH",
    title: d.name || "Unnamed",
    subtitle: [d.relationship, d.date_of_death].filter(Boolean).join(" · "),
    meta: [
      { label: "Relationship", value: truncate(d.relationship) },
      { label: "Date of Death", value: truncate(d.date_of_death) },
      { label: "Cause", value: truncate(d.cause) },
      { label: "What Grew From Them", value: truncate(d.grew_into) },
    ],
    sections: [
      { label: "Description", value: truncate(d.description) },
      { label: "Personal Thoughts", value: truncate(d.thoughts), italic: true },
    ],
  }),
  diary: (e) => ({
    kicker: "DIARY",
    title: e.title || "Untitled entry",
    subtitle: e.date || "",
    meta: [
      { label: "Date", value: truncate(e.date) },
      { label: "Tags", value: truncate(e.tags) },
    ],
    image: e.image,
    sections: [{ label: "Entry", value: truncate(e.body) }],
  }),
  dream: (e) => ({
    kicker: e.mood ? String(e.mood).toUpperCase() : "DREAM",
    title: e.title || "Unsignified dream",
    subtitle: [e.date, e.was_real && e.was_real !== "unknown" ? (e.was_real === "true" ? "It happened." : "Spore-deception.") : null]
      .filter(Boolean).join(" · "),
    meta: [
      { label: "Date", value: truncate(e.date) },
      { label: "Mood", value: truncate(e.mood) },
      { label: "Characters", value: truncate(e.characters) },
      { label: "Locations", value: truncate(e.locations) },
      { label: "Was It Real?", value: truncate(e.was_real) },
    ],
    sections: [
      { label: "Description", value: truncate(e.description) },
      { label: "Interpretation", value: truncate(e.interpretation), italic: true },
    ],
  }),
  creature: (c) => ({
    kicker: c.danger ? String(c.danger).toUpperCase() : "CREATURE",
    title: c.name || "Unknown specimen",
    subtitle: [c.type, c.habitat].filter(Boolean).join(" · "),
    meta: [
      { label: "Type", value: truncate(c.type) },
      { label: "Habitat", value: truncate(c.habitat) },
      { label: "Danger", value: truncate(c.danger) },
      { label: "AC", value: c.ac != null ? String(c.ac) : null },
      { label: "HP", value: c.hp != null ? String(c.hp) : null },
      { label: "Resistances", value: truncate(c.resistances) },
      { label: "Vulnerabilities", value: truncate(c.vulnerabilities) },
    ],
    image: c.image,
    sections: [
      { label: "Behaviors", value: truncate(c.behaviors) },
      { label: "Observations", value: truncate(c.observations) },
      { label: "Encounter History", value: truncate(c.encounter_history), italic: true },
    ],
  }),
  fungus: (f) => ({
    kicker: f.toxicity ? `TOXICITY · ${String(f.toxicity).toUpperCase()}` : "FUNGARIUM",
    title: f.name || "Unnamed specimen",
    subtitle: f.habitat || "",
    meta: [
      { label: "Habitat", value: truncate(f.habitat) },
      { label: "Toxicity", value: truncate(f.toxicity) },
      { label: "Edible", value: f.edible ? "Yes" : "No" },
      { label: "First Discovered", value: truncate(f.first_discovered) },
    ],
    image: f.image,
    sections: [
      { label: "Description", value: truncate(f.description) },
      { label: "Magical Properties", value: truncate(f.magical_properties) },
      { label: "Medicinal Uses", value: truncate(f.medicinal_uses) },
      { label: "Notes", value: truncate(f.notes), italic: true },
    ],
  }),
};

const LABELS = {
  spell: "Spell Inscription",
  memory: "Memory",
  recipe: "Apothecary Recipe",
  death: "Cycle of Death",
  diary: "Diary Entry",
  dream: "Dream Record",
  creature: "Creature Journal",
  fungus: "Fungarium Specimen",
};

function EntryDocument({ type, data, character, theme = "dark" }) {
  const P = theme === "light" ? LIGHT : DARK;
  const styles = buildStyles(P);
  const build = layouts[type];
  if (!build) return null;
  const L = build(data);
  const sectionLabel = LABELS[type] || "Archive Entry";
  const charName = (character && character.name) || "The Mycelial Archive";

  return (
    <Document title={`${sectionLabel} — ${L.title}`} author={charName}>
      <Page size="A4" style={styles.page}>
        {/* Header strip */}
        <View style={styles.headerBar} fixed>
          <Text>The Mycelial Archive</Text>
          <Text>{sectionLabel}</Text>
        </View>

        {L.kicker ? <Text style={styles.kicker}>{L.kicker}</Text> : null}
        <Text style={styles.title}>{L.title}</Text>
        {L.subtitle ? <Text style={styles.subtitle}>{L.subtitle}</Text> : null}
        <View style={styles.rule} />

        {/* Pills (for spells, etc.) */}
        {L.pills && L.pills.length > 0 && (
          <View style={styles.pillsRow}>
            {L.pills.map((p, i) => (
              <Text key={i} style={styles.pill}>{p}</Text>
            ))}
          </View>
        )}

        {/* Image */}
        {L.image && typeof L.image === "string" && L.image.startsWith("data:image") && (
          <Image src={L.image} style={styles.image} />
        )}

        {/* Meta grid */}
        {L.meta && L.meta.filter((m) => m.value).length > 0 && (
          <View style={styles.metaRow}>
            {L.meta.filter((m) => m.value).map((m, i) => (
              <View key={i} style={styles.metaCell}>
                <Text style={styles.metaLabel}>{m.label}</Text>
                <Text style={styles.metaValue}>{m.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Body sections */}
        {L.sections && L.sections.filter((s) => s.value).map((s, i) => (
          <View key={i} style={styles.section} wrap>
            <Text style={styles.sectionLabel}>{s.label}</Text>
            <Text style={s.italic ? styles.bodyItalic : styles.body}>{s.value}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{charName}</Text>
          <Text>{fmtDate()}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

function sanitizeFilename(s) {
  return String(s || "entry")
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 60);
}

/**
 * Generate and download a PDF for a single entry.
 * @param {string} type   one of: spell, memory, recipe, death, diary, dream, creature, fungus
 * @param {object} data   the entity object
 * @param {object} opts   { character, theme: 'dark' | 'light' (auto via body.print-safe if omitted) }
 */
export async function exportEntryPdf(type, data, opts = {}) {
  const theme =
    opts.theme ||
    (typeof document !== "undefined" && document.body.classList.contains("print-safe")
      ? "light"
      : "dark");
  const doc = <EntryDocument type={type} data={data} character={opts.character} theme={theme} />;
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const name = data?.name || data?.title || type;
  a.href = url;
  a.download = `${type}-${sanitizeFilename(name)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default exportEntryPdf;
