"""Backend tests for The Mycelial Archive."""
import os
import pytest
import requests

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE:
    # fallback to frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def cid(s):
    r = s.post(f"{API}/characters", json={"name": "TEST_Char", "hp_max": 20, "hp_current": 20,
                                          "spell_slots": {"1": {"current": 2, "max": 2}, "2": {"current": 0, "max": 0}}})
    assert r.status_code == 200, r.text
    c = r.json()
    yield c["id"]
    s.delete(f"{API}/characters/{c['id']}")


# Character CRUD
def test_root(s):
    assert s.get(f"{API}/").status_code == 200


def test_list_characters(s):
    r = s.get(f"{API}/characters")
    assert r.status_code == 200 and isinstance(r.json(), list)


def test_get_character(s, cid):
    r = s.get(f"{API}/characters/{cid}")
    assert r.status_code == 200
    assert r.json()["name"] == "TEST_Char"


def test_update_character(s, cid):
    r = s.put(f"{API}/characters/{cid}", json={"name": "TEST_Char2", "hp_current": 15})
    assert r.status_code == 200
    g = s.get(f"{API}/characters/{cid}").json()
    assert g["name"] == "TEST_Char2" and g["hp_current"] == 15


def test_duplicate_character(s, cid):
    r = s.post(f"{API}/characters/{cid}/duplicate")
    assert r.status_code == 200
    new_id = r.json()["id"]
    assert new_id != cid
    assert "(copy)" in r.json()["name"]
    s.delete(f"{API}/characters/{new_id}")


# Generic CRUD test for resource-like collections
@pytest.mark.parametrize("coll,extra", [
    ("spells", {"name": "TEST_Spell", "level": 1, "school": "Necromancy"}),
    ("creatures", {"name": "TEST_Creature", "type": "fungal"}),
    ("diary", {"title": "TEST_Entry", "body": "spores fell"}),
    ("memories", {"title": "TEST_Mem", "description": "old grove"}),
    ("dreams", {"description": "TEST_Dream", "mood": "eerie"}),
    ("fungi", {"name": "TEST_Fungus", "habitat": "log"}),
    ("recipes", {"name": "TEST_Recipe", "ingredients": ["spore"]}),
    ("deaths", {"name": "TEST_Death", "description": "fell"}),
    ("inventory", {"name": "TEST_Item"}),
    ("effects", {"name": "TEST_Effect", "type": "buff"}),
])
def test_crud_collection(s, cid, coll, extra):
    payload = {"character_id": cid, **extra}
    r = s.post(f"{API}/{coll}", json=payload)
    assert r.status_code == 200, f"{coll} create failed: {r.text}"
    iid = r.json()["id"]
    lst = s.get(f"{API}/{coll}", params={"character_id": cid})
    assert lst.status_code == 200 and any(x["id"] == iid for x in lst.json())
    u = s.put(f"{API}/{coll}/{iid}", json={"character_id": cid, "note": "upd"})
    assert u.status_code == 200
    d = s.delete(f"{API}/{coll}/{iid}")
    assert d.status_code == 200


def test_resources_crud_and_long_rest(s, cid):
    r = s.post(f"{API}/resources", json={"character_id": cid, "name": "TEST_Res",
                                          "current": 0, "maximum": 3, "restore_on": "long"})
    assert r.status_code == 200
    rid = r.json()["id"]
    # short rest should NOT restore (it's long)
    s.post(f"{API}/rest/short/{cid}")
    cur = next(x for x in s.get(f"{API}/resources", params={"character_id": cid}).json() if x["id"] == rid)
    assert cur["current"] == 0
    # long rest restores
    lr = s.post(f"{API}/rest/long/{cid}")
    assert lr.status_code == 200
    cur = next(x for x in s.get(f"{API}/resources", params={"character_id": cid}).json() if x["id"] == rid)
    assert cur["current"] == 3
    # verify hp restored and spell slots restored
    ch = s.get(f"{API}/characters/{cid}").json()
    assert ch["hp_current"] == ch["hp_max"]
    assert ch["spell_slots"]["1"]["current"] == ch["spell_slots"]["1"]["max"]
    # ledger entry logged
    led = s.get(f"{API}/ledger", params={"character_id": cid}).json()
    assert any(e["category"] == "rest" for e in led)
    s.delete(f"{API}/resources/{rid}")


def test_short_rest_restores_short(s, cid):
    r = s.post(f"{API}/resources", json={"character_id": cid, "name": "TEST_ShortRes",
                                          "current": 0, "maximum": 2, "restore_on": "short"})
    rid = r.json()["id"]
    s.post(f"{API}/rest/short/{cid}")
    cur = next(x for x in s.get(f"{API}/resources", params={"character_id": cid}).json() if x["id"] == rid)
    assert cur["current"] == 2
    s.delete(f"{API}/resources/{rid}")


def test_long_rest_clears_concentration(s, cid):
    e = s.post(f"{API}/effects", json={"character_id": cid, "name": "TEST_Conc", "type": "concentration"}).json()
    s.post(f"{API}/rest/long/{cid}")
    effects = s.get(f"{API}/effects", params={"character_id": cid}).json()
    assert not any(x["id"] == e["id"] for x in effects)


def test_search(s, cid):
    sp = s.post(f"{API}/spells", json={"character_id": cid, "name": "TEST_UniqueSporeBolt",
                                        "description": "fungal magic"}).json()
    r = s.get(f"{API}/search", params={"character_id": cid, "q": "UniqueSporeBolt"})
    assert r.status_code == 200
    matches = r.json()
    assert any(m["collection"] == "spells" and m["id"] == sp["id"] for m in matches)
    s.delete(f"{API}/spells/{sp['id']}")


def test_themes_crud(s):
    t = s.post(f"{API}/themes", json={"name": "TEST_Theme", "vars": {"--bg": "#000"}}).json()
    r = s.get(f"{API}/themes")
    assert any(x["id"] == t["id"] for x in r.json())
    s.delete(f"{API}/themes/{t['id']}")


def test_cascade_delete(s):
    c = s.post(f"{API}/characters", json={"name": "TEST_CascadeChar"}).json()
    cid2 = c["id"]
    s.post(f"{API}/spells", json={"character_id": cid2, "name": "TEST_Cas"})
    s.delete(f"{API}/characters/{cid2}")
    spells = s.get(f"{API}/spells", params={"character_id": cid2}).json()
    assert spells == []


def test_404s(s):
    assert s.get(f"{API}/characters/nope").status_code == 404
    assert s.put(f"{API}/spells/nope", json={}).status_code == 404
    assert s.delete(f"{API}/dreams/nope").status_code == 404
