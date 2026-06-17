"""Backend smoke + CRUD tests for The Mycelial Archive."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://b9835bcf-f934-4279-a94f-e4e10b13310e.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def character_id(s):
    # Use existing or create a TEST character
    r = s.get(f"{API}/characters", timeout=15)
    assert r.status_code == 200
    chars = r.json()
    test_char = next((c for c in chars if c.get("name", "").startswith("TEST_")), None)
    if test_char:
        return test_char["id"]
    r = s.post(f"{API}/characters", json={"name": "TEST_Mycelium"}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["id"]


# Root smoke
def test_root(s):
    r = s.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "The Mycelial Archive"
    assert data["status"] == "alive"


# Parametrised CRUD for the resources required by review
@pytest.mark.parametrize("resource,payload", [
    ("spells", {"name": "TEST_Spell", "level": 1, "always_prepared": True}),
    ("memories", {"title": "TEST_Memory", "description": "x"}),
    ("recipes", {"name": "TEST_Recipe", "category": "known"}),
    ("deaths", {"name": "TEST_Death"}),
    ("diary", {"title": "TEST_Diary", "body": "y"}),
    ("dreams", {"description": "TEST_Dream"}),
    ("creatures", {"name": "TEST_Creature"}),
    ("fungi", {"name": "TEST_Fungus"}),
])
def test_crud(s, character_id, resource, payload):
    payload = {**payload, "character_id": character_id}

    # CREATE
    r = s.post(f"{API}/{resource}", json=payload, timeout=15)
    assert r.status_code == 200, f"create {resource}: {r.status_code} {r.text}"
    created = r.json()
    assert "id" in created
    item_id = created["id"]

    # LIST and verify persistence
    r = s.get(f"{API}/{resource}", params={"character_id": character_id}, timeout=15)
    assert r.status_code == 200
    listed = r.json()
    assert any(it["id"] == item_id for it in listed), f"{resource} not in list"

    # UPDATE
    update_field = "name" if "name" in payload else ("title" if "title" in payload else "description")
    r = s.put(f"{API}/{resource}/{item_id}", json={update_field: "TEST_updated"}, timeout=15)
    assert r.status_code == 200, r.text
    assert r.json()[update_field] == "TEST_updated"

    # DELETE (cleanup)
    r = s.delete(f"{API}/{resource}/{item_id}", timeout=15)
    assert r.status_code == 200


def test_spell_always_prepared_persists(s, character_id):
    r = s.post(f"{API}/spells", json={
        "character_id": character_id, "name": "TEST_AlwaysSpell", "always_prepared": True
    }, timeout=15)
    assert r.status_code == 200
    sid = r.json()["id"]
    try:
        r = s.get(f"{API}/spells", params={"character_id": character_id}, timeout=15)
        found = next(x for x in r.json() if x["id"] == sid)
        assert found.get("always_prepared") is True
    finally:
        s.delete(f"{API}/spells/{sid}", timeout=15)
