import api from "@/lib/api";

const COLLECTIONS = [
  "spells", "creatures", "diary", "memories", "dreams", "fungi",
  "recipes", "deaths", "resources", "effects", "inventory",
  "themes", "macros", "presets", "ledger",
];

export async function exportCharacterArchive(character) {
  const data = { character, collections: {} };
  for (const c of COLLECTIONS) {
    try { data.collections[c] = await api.get(`/${c}`, { params: { character_id: character.id } }).then((r) => r.data); }
    catch { data.collections[c] = []; }
  }
  data._exported_at = new Date().toISOString();
  data._format = "mycelial-archive/v1";
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(character.name || "archive").toLowerCase().replace(/\s+/g, "-")}.archive.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importCharacterArchive(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (data._format !== "mycelial-archive/v1") throw new Error("Unrecognized archive format");
  // create a new character (fresh id)
  const { id: _oldId, created_at, updated_at, ...charBody } = data.character;
  charBody.name = (charBody.name || "Imported") + " (imported)";
  const newChar = await api.post("/characters", charBody).then((r) => r.data);
  const oldId = _oldId;

  // re-create every doc under new character_id; remap memory connection ids too
  const idMap = {};
  for (const [coll, docs] of Object.entries(data.collections || {})) {
    for (const d of docs) {
      const { id: oldEntryId, _id: _x, character_id: _c, created_at: _a, updated_at: _u, ...rest } = d;
      const payload = { ...rest, character_id: newChar.id };
      const created = await api.post(`/${coll}`, payload).then((r) => r.data);
      idMap[oldEntryId] = created.id;
    }
  }
  // patch memory.connections to remapped ids
  const mems = await api.get(`/memories`, { params: { character_id: newChar.id } }).then((r) => r.data);
  for (const m of mems) {
    if (Array.isArray(m.connections) && m.connections.length) {
      const fixed = m.connections.map((c) => idMap[c]).filter(Boolean);
      if (JSON.stringify(fixed) !== JSON.stringify(m.connections)) {
        await api.put(`/memories/${m.id}`, { ...m, connections: fixed });
      }
    }
  }
  return newChar;
}
