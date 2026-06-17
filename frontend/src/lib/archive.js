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
  const incoming = data.character;
  const oldId = incoming.id;
  const { id: _i, _id: _x, created_at, updated_at, ...charBody } = incoming;

  // Does a character with that id already exist? If so → overwrite. Else → restore with same id.
  let target;
  try {
    target = await api.get(`/characters/${oldId}`).then((r) => r.data);
  } catch { target = null; }

  if (target) {
    // overwrite character
    await api.put(`/characters/${oldId}`, { ...target, ...charBody });
    // wipe all owned collections
    const wipe = ["spells","creatures","diary","memories","dreams","fungi","recipes","deaths","resources","effects","inventory","themes","macros","presets","ledger"];
    for (const c of wipe) {
      const docs = await api.get(`/${c}`, { params: { character_id: oldId } }).then((r) => r.data);
      for (const d of docs) await api.delete(`/${c}/${d.id}`);
    }
    target = await api.get(`/characters/${oldId}`).then((r) => r.data);
  } else {
    target = await api.post("/characters", { ...charBody, id: oldId }).then((r) => r.data);
  }

  // re-create every doc under the target character_id, preserving original ids so connections stay valid
  for (const [coll, docs] of Object.entries(data.collections || {})) {
    for (const d of docs) {
      const { _id: _x, character_id: _c, ...rest } = d;
      await api.post(`/${coll}`, { ...rest, character_id: target.id });
    }
  }
  return target;
}
