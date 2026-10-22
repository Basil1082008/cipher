"""Automated tests for Contact Manager REST API endpoints."""

from datetime import datetime, timezone
import os
from typing import Any, Dict, List, Optional
from bson import ObjectId
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models import serialize_contact_doc, to_object_id
from app.schemas import ContactCreate, ContactUpdate
from app.services.contact_service import ContactService, get_contact_service


class InMemoryContactService(ContactService):
    """In-memory implementation of ContactService for offline isolated testing."""

    def __init__(self):
        super().__init__(collection=None)
        self.store: Dict[str, Dict[str, Any]] = {}

    async def get_all_contacts(self, search: Optional[str] = None) -> List[Dict[str, Any]]:
        contacts = list(self.store.values())
        if search and search.strip():
            term = search.strip().lower()
            contacts = [
                c
                for c in contacts
                if (term in (c.get("name") or "").lower())
                or (term in (c.get("email") or "").lower())
                or (term in (c.get("phone") or "").lower())
                or (term in (c.get("company") or "").lower())
            ]
        # Sort by updated_at desc
        contacts.sort(key=lambda x: x["updated_at"], reverse=True)
        return [serialize_contact_doc(c) for c in contacts]  # type: ignore

    async def get_contact_by_id(self, contact_id: str) -> Optional[Dict[str, Any]]:
        to_object_id(contact_id)  # Validates ObjectId format
        doc = self.store.get(contact_id)
        return serialize_contact_doc(doc) if doc else None

    async def create_contact(self, contact_in: ContactCreate) -> Dict[str, Any]:
        oid = str(ObjectId())
        now = datetime.now(timezone.utc)
        doc = contact_in.model_dump()
        doc["_id"] = oid
        doc["created_at"] = now
        doc["updated_at"] = now
        self.store[oid] = doc
        return serialize_contact_doc(doc)  # type: ignore

    async def update_contact(self, contact_id: str, contact_update: ContactUpdate) -> Optional[Dict[str, Any]]:
        to_object_id(contact_id)
        if contact_id not in self.store:
            return None
        doc = self.store[contact_id]
        update_data = contact_update.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            doc[k] = v
        doc["updated_at"] = datetime.now(timezone.utc)
        return serialize_contact_doc(doc)

    async def delete_contact(self, contact_id: str) -> bool:
        to_object_id(contact_id)
        if contact_id in self.store:
            del self.store[contact_id]
            return True
        return False


@pytest.fixture
def mock_service():
    """Fixture providing a fresh in-memory contact store for each test."""
    service = InMemoryContactService()
    app.dependency_overrides[get_contact_service] = lambda: service
    yield service
    app.dependency_overrides.pop(get_contact_service, None)


@pytest.fixture
def client(mock_service):
    """TestClient instance configured with mocked service dependencies."""
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


def test_health_endpoint(client):
    """Test health check endpoint reports service status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "database" in data
    assert "database_name" in data


def test_create_contact_success(client):
    """Test creating a valid contact returns 201 and valid response schema."""
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+91 9876543210",
        "company": "Example Technologies",
        "job_title": "Software Engineer",
        "address": "Kochi, Kerala",
        "notes": "Met at a tech conference",
    }
    response = client.post("/api/contacts", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert len(data["id"]) == 24
    assert data["name"] == "Jane Doe"
    assert data["email"] == "jane@example.com"
    assert data["phone"] == "+91 9876543210"
    assert data["company"] == "Example Technologies"
    assert "created_at" in data
    assert "updated_at" in data


def test_create_contact_required_name_missing(client):
    """Test creating contact without name or with empty name fails with 422."""
    # Missing name
    res1 = client.post("/api/contacts", json={"email": "alice@example.com"})
    assert res1.status_code == 422

    # Whitespace-only name
    res2 = client.post("/api/contacts", json={"name": "   ", "email": "alice@example.com"})
    assert res2.status_code == 422


def test_create_contact_invalid_email(client):
    """Test creating contact with malformed email fails with 422."""
    payload = {
        "name": "Bob Smith",
        "email": "not-an-email",
    }
    response = client.post("/api/contacts", json=payload)
    assert response.status_code == 422


def test_get_all_contacts(client):
    """Test fetching all contacts returns list ordered by updated_at."""
    client.post("/api/contacts", json={"name": "Alice"})
    client.post("/api/contacts", json={"name": "Bob"})

    response = client.get("/api/contacts")
    assert response.status_code == 200
    contacts = response.json()
    assert isinstance(contacts, list)
    assert len(contacts) == 2
    names = [c["name"] for c in contacts]
    assert "Alice" in names
    assert "Bob" in names


def test_get_individual_contact(client):
    """Test retrieving contact by ID returns full data."""
    create_res = client.post(
        "/api/contacts",
        json={"name": "Charlie", "email": "charlie@example.com", "company": "Acme Inc"},
    )
    contact_id = create_res.json()["id"]

    get_res = client.get(f"/api/contacts/{contact_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == contact_id
    assert data["name"] == "Charlie"
    assert data["company"] == "Acme Inc"


def test_get_individual_contact_not_found(client):
    """Test missing contact returns 404."""
    non_existent_id = "507f1f77bcf86cd799439011"
    response = client.get(f"/api/contacts/{non_existent_id}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_contact_malformed_id(client):
    """Test malformed contact ID returns 400 Bad Request."""
    response = client.get("/api/contacts/invalid-short-id")
    assert response.status_code == 400
    assert "invalid" in response.json()["detail"].lower()


def test_update_contact_success(client):
    """Test updating existing contact returns 200 with updated fields."""
    create_res = client.post("/api/contacts", json={"name": "Original Name", "phone": "123"})
    contact_id = create_res.json()["id"]

    update_payload = {"name": "Updated Name", "phone": "999"}
    update_res = client.put(f"/api/contacts/{contact_id}", json=update_payload)
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["name"] == "Updated Name"
    assert data["phone"] == "999"


def test_update_contact_not_found(client):
    """Test updating non-existent contact returns 404."""
    non_existent_id = "507f1f77bcf86cd799439011"
    response = client.put(
        f"/api/contacts/{non_existent_id}",
        json={"name": "Ghost User"},
    )
    assert response.status_code == 404


def test_update_contact_malformed_id(client):
    """Test updating contact with malformed ID returns 400."""
    response = client.put("/api/contacts/not-an-oid", json={"name": "Test"})
    assert response.status_code == 400


def test_delete_contact_success(client):
    """Test deleting contact returns 204 and record is removed."""
    create_res = client.post("/api/contacts", json={"name": "To Be Deleted"})
    contact_id = create_res.json()["id"]

    del_res = client.delete(f"/api/contacts/{contact_id}")
    assert del_res.status_code == 204

    # Verify subsequent GET returns 404
    get_res = client.get(f"/api/contacts/{contact_id}")
    assert get_res.status_code == 404


def test_delete_contact_not_found(client):
    """Test deleting non-existent contact returns 404."""
    non_existent_id = "507f1f77bcf86cd799439011"
    response = client.delete(f"/api/contacts/{non_existent_id}")
    assert response.status_code == 404


def test_delete_contact_malformed_id(client):
    """Test deleting with malformed ID returns 400."""
    response = client.delete("/api/contacts/12345")
    assert response.status_code == 400


def test_search_contacts(client):
    """Test search functionality across name, email, phone, and company."""
    client.post(
        "/api/contacts",
        json={"name": "Alice Johnson", "email": "alice@alpha.com", "phone": "111222", "company": "Alpha Corp"},
    )
    client.post(
        "/api/contacts",
        json={"name": "Bob Smith", "email": "bob@beta.com", "phone": "333444", "company": "Beta LLC"},
    )

    # Search by name
    res_name = client.get("/api/contacts?search=Johnson")
    assert len(res_name.json()) == 1
    assert res_name.json()[0]["name"] == "Alice Johnson"

    # Search by email
    res_email = client.get("/api/contacts?search=beta.com")
    assert len(res_email.json()) == 1
    assert res_email.json()[0]["name"] == "Bob Smith"

    # Search by phone
    res_phone = client.get("/api/contacts?search=111")
    assert len(res_phone.json()) == 1
    assert res_phone.json()[0]["name"] == "Alice Johnson"

    # Search by company
    res_company = client.get("/api/contacts?search=Beta")
    assert len(res_company.json()) == 1
    assert res_company.json()[0]["name"] == "Bob Smith"

    # Search with no matches
    res_none = client.get("/api/contacts?search=nonexistentterm123")
    assert len(res_none.json()) == 0


@pytest.mark.skipif(
    not os.getenv("MONGODB_URL"),
    reason="Requires active MongoDB Atlas cluster with MONGODB_URL configured in environment.",
)
def test_real_mongodb_atlas_integration():
    """Live integration test against MongoDB Atlas (run only when MONGODB_URL is provided)."""
    import asyncio
    from app.config import get_settings
    from app.database import init_db, close_db, get_contacts_collection

    async def _run_live():
        settings = get_settings()
        await init_db(settings)
        try:
            col = get_contacts_collection()
            test_doc = {"name": "Atlas Live Test", "created_at": datetime.now(timezone.utc)}
            result = await col.insert_one(test_doc)
            assert result.inserted_id is not None
            await col.delete_one({"_id": result.inserted_id})
        finally:
            await close_db()

    asyncio.run(_run_live())
