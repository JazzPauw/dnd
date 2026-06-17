"""The Mycelial Archive - Backend API.

A local-first FastAPI service for the immersive D&D companion. All data is
keyed by character_id (UUID strings) so multiple characters live side-by-side.
"""
from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Storage: local JSON files (no MongoDB) when MYCELIUM_LOCAL=1, else MongoDB.
if os.environ.get("MYCELIUM_LOCAL") == "1":
    from local_db import LocalClient
    client = LocalClient()
    db = client[os.environ.get("DB_NAME", "mycelial_archive")]
else:
    mongo_url = os.environ["MONGO_URL"]
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ["DB_NAME"]]

app = FastAPI(title="The Mycelial Archive")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mycelium")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


# ============================================================
# Generic helpers
# ============================================================


async def _list(collection: str, character_id: Optional[str] = None) -> List[Dict[str, Any]]:
    q: Dict[str, Any] = {}
    if character_id:
        q["character_id"] = character_id
    docs = await db[collection].find(q, {"_id": 0}).to_list(5000)
    return docs


async def _get(collection: str, item_id: str) -> Dict[str, Any]:
    doc = await db[collection].find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, f"{collection} {item_id} not found")
    return doc


async def _create(collection: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    payload.setdefault("id", new_id())
    payload.setdefault("created_at", now_iso())
    payload["updated_at"] = now_iso()
    await db[collection].insert_one(payload.copy())
    payload.pop("_id", None)
    return payload


async def _update(collection: str, item_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    payload["updated_at"] = now_iso()
    payload.pop("id", None)
    payload.pop("_id", None)
    res = await db[collection].update_one({"id": item_id}, {"$set": payload})
    if res.matched_count == 0:
        raise HTTPException(404, f"{collection} {item_id} not found")
    return await _get(collection, item_id)


async def _delete(collection: str, item_id: str) -> Dict[str, Any]:
    res = await db[collection].delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(404, f"{collection} {item_id} not found")
    return {"ok": True, "deleted": item_id}


async def _log_ledger(character_id: str, category: str, description: str) -> None:
    entry = {
        "id": new_id(),
        "character_id": character_id,
        "timestamp": now_iso(),
        "category": category,
        "description": description,
    }
    await db.ledger.insert_one(entry.copy())


# ============================================================
# Characters
# ============================================================


class Character(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    name: str = "Unnamed"
    race: str = "Wood Elf"
    classes: str = "Swarm Ranger / Circle of Spores Druid"
    level: int = 1
    background: str = ""
    alignment: str = ""
    portrait: str = ""
    theme_id: Optional[str] = None
    backstory: str = ""
    # Combat
    hp_current: int = 10
    hp_max: int = 10
    hp_temp: int = 0
    ac: int = 10
    initiative: int = 0
    speed: int = 30
    spell_save_dc: int = 10
    spell_attack: int = 0
    passive_perception: int = 10
    inspiration: bool = False
    exhaustion: int = 0
    hit_dice: str = "1d8"
    hit_dice_current: int = 1
    hit_dice_max: int = 1
    # Attributes (score only; modifier derived client-side)
    attributes: Dict[str, Dict[str, Any]] = Field(
        default_factory=lambda: {
            "STR": {"score": 10, "save_prof": False},
            "DEX": {"score": 10, "save_prof": False},
            "CON": {"score": 10, "save_prof": False},
            "INT": {"score": 10, "save_prof": False},
            "WIS": {"score": 10, "save_prof": False},
            "CHA": {"score": 10, "save_prof": False},
        }
    )
    skills: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    proficiency_bonus: int = 2
    currency: Dict[str, int] = Field(
        default_factory=lambda: {"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}
    )
    languages: List[str] = Field(default_factory=list)
    proficiencies: List[str] = Field(default_factory=list)
    traits: List[Dict[str, str]] = Field(default_factory=list)
    feats: List[Dict[str, str]] = Field(default_factory=list)
    spell_slots: Dict[str, Dict[str, int]] = Field(
        default_factory=lambda: {
            str(i): {"current": 0, "max": 0} for i in range(1, 10)
        }
    )
    custom_fields: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


@api.get("/characters")
async def list_characters():
    return await _list("characters")


@api.post("/characters")
async def create_character(payload: Dict[str, Any]):
    char = Character(**payload).model_dump()
    await db.characters.insert_one(char.copy())
    await _log_ledger(char["id"], "character", f"Character '{char['name']}' awakened")
    char.pop("_id", None)
    return char


@api.get("/characters/{cid}")
async def get_character(cid: str):
    return await _get("characters", cid)


@api.put("/characters/{cid}")
async def update_character(cid: str, payload: Dict[str, Any]):
    return await _update("characters", cid, payload)


@api.delete("/characters/{cid}")
async def delete_character(cid: str):
    # cascade delete related data
    for coll in [
        "spells", "creatures", "diary", "memories", "dreams",
        "fungi", "recipes", "deaths", "ledger", "resources", "effects",
        "themes",
    ]:
        await db[coll].delete_many({"character_id": cid})
    return await _delete("characters", cid)


@api.post("/characters/{cid}/duplicate")
async def duplicate_character(cid: str):
    src = await _get("characters", cid)
    src["id"] = new_id()
    src["name"] = src.get("name", "Unnamed") + " (copy)"
    src["created_at"] = now_iso()
    src["updated_at"] = now_iso()
    await db.characters.insert_one(src.copy())
    src.pop("_id", None)
    return src


# ============================================================
# Resources (per character)
# ============================================================


@api.get("/resources")
async def list_resources(character_id: str):
    return await _list("resources", character_id)


@api.post("/resources")
async def create_resource(payload: Dict[str, Any]):
    payload.setdefault("current", 0)
    payload.setdefault("maximum", 0)
    payload.setdefault("restore_on", "long")  # never|short|long
    return await _create("resources", payload)


@api.put("/resources/{rid}")
async def update_resource(rid: str, payload: Dict[str, Any]):
    return await _update("resources", rid, payload)


@api.delete("/resources/{rid}")
async def delete_resource(rid: str):
    return await _delete("resources", rid)


# ============================================================
# Effects (concentration, conditions, buffs, debuffs)
# ============================================================


@api.get("/effects")
async def list_effects(character_id: str):
    return await _list("effects", character_id)


@api.post("/effects")
async def create_effect(payload: Dict[str, Any]):
    return await _create("effects", payload)


@api.put("/effects/{eid}")
async def update_effect(eid: str, payload: Dict[str, Any]):
    return await _update("effects", eid, payload)


@api.delete("/effects/{eid}")
async def delete_effect(eid: str):
    return await _delete("effects", eid)


# ============================================================
# Inventory items
# ============================================================


@api.get("/inventory")
async def list_inventory(character_id: str):
    return await _list("inventory", character_id)


@api.post("/inventory")
async def create_inventory(payload: Dict[str, Any]):
    return await _create("inventory", payload)


@api.put("/inventory/{iid}")
async def update_inventory(iid: str, payload: Dict[str, Any]):
    return await _update("inventory", iid, payload)


@api.delete("/inventory/{iid}")
async def delete_inventory(iid: str):
    return await _delete("inventory", iid)


# ============================================================
# Spells
# ============================================================


@api.get("/spells")
async def list_spells(character_id: str):
    return await _list("spells", character_id)


@api.post("/spells")
async def create_spell(payload: Dict[str, Any]):
    return await _create("spells", payload)


@api.put("/spells/{sid}")
async def update_spell(sid: str, payload: Dict[str, Any]):
    return await _update("spells", sid, payload)


@api.delete("/spells/{sid}")
async def delete_spell(sid: str):
    return await _delete("spells", sid)


# ============================================================
# Creatures (Bestiary)
# ============================================================


@api.get("/creatures")
async def list_creatures(character_id: str):
    return await _list("creatures", character_id)


@api.post("/creatures")
async def create_creature(payload: Dict[str, Any]):
    return await _create("creatures", payload)


@api.put("/creatures/{cid}")
async def update_creature(cid: str, payload: Dict[str, Any]):
    return await _update("creatures", cid, payload)


@api.delete("/creatures/{cid}")
async def delete_creature(cid: str):
    return await _delete("creatures", cid)


# ============================================================
# Diary
# ============================================================


@api.get("/diary")
async def list_diary(character_id: str):
    return await _list("diary", character_id)


@api.post("/diary")
async def create_diary(payload: Dict[str, Any]):
    return await _create("diary", payload)


@api.put("/diary/{did}")
async def update_diary(did: str, payload: Dict[str, Any]):
    return await _update("diary", did, payload)


@api.delete("/diary/{did}")
async def delete_diary(did: str):
    return await _delete("diary", did)


# ============================================================
# Memories
# ============================================================


@api.get("/memories")
async def list_memories(character_id: str):
    return await _list("memories", character_id)


@api.post("/memories")
async def create_memory(payload: Dict[str, Any]):
    return await _create("memories", payload)


@api.put("/memories/{mid}")
async def update_memory(mid: str, payload: Dict[str, Any]):
    return await _update("memories", mid, payload)


@api.delete("/memories/{mid}")
async def delete_memory(mid: str):
    return await _delete("memories", mid)


# ============================================================
# Dreams
# ============================================================


@api.get("/dreams")
async def list_dreams(character_id: str):
    return await _list("dreams", character_id)


@api.post("/dreams")
async def create_dream(payload: Dict[str, Any]):
    return await _create("dreams", payload)


@api.put("/dreams/{did}")
async def update_dream(did: str, payload: Dict[str, Any]):
    return await _update("dreams", did, payload)


@api.delete("/dreams/{did}")
async def delete_dream(did: str):
    return await _delete("dreams", did)


# ============================================================
# Fungi
# ============================================================


@api.get("/fungi")
async def list_fungi(character_id: str):
    return await _list("fungi", character_id)


@api.post("/fungi")
async def create_fungus(payload: Dict[str, Any]):
    return await _create("fungi", payload)


@api.put("/fungi/{fid}")
async def update_fungus(fid: str, payload: Dict[str, Any]):
    return await _update("fungi", fid, payload)


@api.delete("/fungi/{fid}")
async def delete_fungus(fid: str):
    return await _delete("fungi", fid)


# ============================================================
# Recipes (Apothecary)
# ============================================================


@api.get("/recipes")
async def list_recipes(character_id: str):
    return await _list("recipes", character_id)


@api.post("/recipes")
async def create_recipe(payload: Dict[str, Any]):
    return await _create("recipes", payload)


@api.put("/recipes/{rid}")
async def update_recipe(rid: str, payload: Dict[str, Any]):
    return await _update("recipes", rid, payload)


@api.delete("/recipes/{rid}")
async def delete_recipe(rid: str):
    return await _delete("recipes", rid)


# ============================================================
# Cycle of Death
# ============================================================


@api.get("/deaths")
async def list_deaths(character_id: str):
    return await _list("deaths", character_id)


@api.post("/deaths")
async def create_death(payload: Dict[str, Any]):
    return await _create("deaths", payload)


@api.put("/deaths/{did}")
async def update_death(did: str, payload: Dict[str, Any]):
    return await _update("deaths", did, payload)


@api.delete("/deaths/{did}")
async def delete_death(did: str):
    return await _delete("deaths", did)


# ============================================================
# Ledger
# ============================================================


@api.get("/ledger")
async def list_ledger(character_id: str):
    docs = await _list("ledger", character_id)
    docs.sort(key=lambda d: d.get("timestamp", ""), reverse=True)
    return docs


@api.post("/ledger")
async def create_ledger(payload: Dict[str, Any]):
    payload.setdefault("timestamp", now_iso())
    return await _create("ledger", payload)


@api.put("/ledger/{lid}")
async def update_ledger(lid: str, payload: Dict[str, Any]):
    return await _update("ledger", lid, payload)


@api.delete("/ledger/{lid}")
async def delete_ledger(lid: str):
    return await _delete("ledger", lid)


# ============================================================
# Themes
# ============================================================


@api.get("/themes")
async def list_themes(character_id: Optional[str] = None):
    q = {}
    if character_id:
        # global themes (no character_id) + this character's themes
        docs = await db.themes.find(
            {"$or": [{"character_id": character_id}, {"character_id": None}, {"character_id": {"$exists": False}}]},
            {"_id": 0},
        ).to_list(1000)
        return docs
    return await _list("themes")


@api.post("/themes")
async def create_theme(payload: Dict[str, Any]):
    return await _create("themes", payload)


@api.put("/themes/{tid}")
async def update_theme(tid: str, payload: Dict[str, Any]):
    return await _update("themes", tid, payload)


@api.delete("/themes/{tid}")
async def delete_theme(tid: str):
    return await _delete("themes", tid)


# ============================================================
# Rest endpoints
# ============================================================


@api.post("/rest/long/{cid}")
async def long_rest(cid: str):
    char = await _get("characters", cid)
    # restore HP to max
    await db.characters.update_one(
        {"id": cid},
        {"$set": {
            "hp_current": char.get("hp_max", 0),
            "hp_temp": 0,
            "updated_at": now_iso(),
            # restore all spell slots
            "spell_slots": {
                lvl: {"current": v.get("max", 0), "max": v.get("max", 0)}
                for lvl, v in char.get("spell_slots", {}).items()
            },
            # restore half hit dice (D&D rule), at least 1
            "hit_dice_current": min(
                char.get("hit_dice_max", 1),
                char.get("hit_dice_current", 0) + max(1, char.get("hit_dice_max", 1) // 2),
            ),
        }},
    )
    # restore resources configured for long or short
    resources = await _list("resources", cid)
    for r in resources:
        if r.get("restore_on") in ("long", "short"):
            await db.resources.update_one(
                {"id": r["id"]}, {"$set": {"current": r.get("maximum", 0)}}
            )
    # clear concentration effects
    await db.effects.delete_many({"character_id": cid, "type": "concentration"})
    await _log_ledger(cid, "rest", "Long Rest — the Network feeds. Flesh restored.")
    return {"ok": True}


@api.post("/rest/short/{cid}")
async def short_rest(cid: str):
    resources = await _list("resources", cid)
    for r in resources:
        if r.get("restore_on") == "short":
            await db.resources.update_one(
                {"id": r["id"]}, {"$set": {"current": r.get("maximum", 0)}}
            )
    await _log_ledger(cid, "rest", "Short Rest — spores settle, breath returns.")
    return {"ok": True}


# ============================================================
# Global search
# ============================================================


@api.get("/search")
async def search(character_id: str, q: str):
    if not q or len(q) < 1:
        return []
    needle = q.lower()
    results: List[Dict[str, Any]] = []
    collections = {
        "spells": ["name", "description", "school"],
        "creatures": ["name", "type", "habitat", "notes", "behaviors"],
        "diary": ["title", "body", "tags"],
        "memories": ["title", "description", "location"],
        "dreams": ["description", "interpretation", "mood"],
        "fungi": ["name", "description", "habitat", "magical_properties"],
        "recipes": ["name", "ingredients", "effects"],
        "deaths": ["name", "description", "relationship"],
        "ledger": ["description", "category"],
        "inventory": ["name", "notes"],
    }
    for coll, fields in collections.items():
        docs = await db[coll].find({"character_id": character_id}, {"_id": 0}).to_list(2000)
        for d in docs:
            for f in fields:
                v = d.get(f, "")
                if isinstance(v, list):
                    v = " ".join(str(x) for x in v)
                if isinstance(v, str) and needle in v.lower():
                    results.append({
                        "collection": coll,
                        "id": d.get("id"),
                        "title": d.get("name") or d.get("title") or d.get("description", "")[:60],
                        "snippet": (v[:140] if isinstance(v, str) else ""),
                    })
                    break
    return results


# ============================================================
# Roll Macros
# ============================================================


@api.get("/macros")
async def list_macros(character_id: str):
    return await _list("macros", character_id)


@api.post("/macros")
async def create_macro(payload: Dict[str, Any]):
    return await _create("macros", payload)


@api.put("/macros/{mid}")
async def update_macro(mid: str, payload: Dict[str, Any]):
    return await _update("macros", mid, payload)


@api.delete("/macros/{mid}")
async def delete_macro(mid: str):
    return await _delete("macros", mid)


# ============================================================
# Spell Presets (prepared loadouts)
# ============================================================


@api.get("/presets")
async def list_presets(character_id: str):
    return await _list("presets", character_id)


@api.post("/presets")
async def create_preset(payload: Dict[str, Any]):
    return await _create("presets", payload)


@api.put("/presets/{pid}")
async def update_preset(pid: str, payload: Dict[str, Any]):
    return await _update("presets", pid, payload)


@api.delete("/presets/{pid}")
async def delete_preset(pid: str):
    return await _delete("presets", pid)


@api.post("/presets/{pid}/apply")
async def apply_preset(pid: str):
    """Sets `prepared=True` on spells listed in preset.spell_ids, False on others (of same character)."""
    preset = await _get("presets", pid)
    cid = preset.get("character_id")
    spell_ids = set(preset.get("spell_ids", []))
    spells_list = await db.spells.find({"character_id": cid}, {"_id": 0}).to_list(5000)
    for sp in spells_list:
        # always_prepared spells stay prepared regardless
        if sp.get("always_prepared"):
            continue
        await db.spells.update_one(
            {"id": sp["id"]},
            {"$set": {"prepared": sp["id"] in spell_ids, "updated_at": now_iso()}},
        )
    await _log_ledger(cid, "preset", f"Loaded preset '{preset.get('name', 'preset')}'")
    return {"ok": True}


@api.get("/")
async def root():
    return {"name": "The Mycelial Archive", "status": "alive"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
