"""Contact business logic service for MongoDB operations."""

from datetime import datetime, timezone
import re
from typing import Any, Dict, List, Optional
from pymongo import ReturnDocument
from pymongo.asynchronous.collection import AsyncCollection

from app.database import get_contacts_collection
from app.models import serialize_contact_doc, to_object_id
from app.schemas import ContactCreate, ContactUpdate


class ContactService:
    """Service handling contact retrieval, creation, modification, and deletion."""

    def __init__(self, collection: Optional[AsyncCollection] = None):
        self._collection = collection

    @property
    def collection(self) -> AsyncCollection:
        if self._collection is None:
            self._collection = get_contacts_collection()
        return self._collection

    async def get_all_contacts(self, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve contacts, optionally filtered by search across name, email, phone, and company."""
        filter_query: Dict[str, Any] = {}
        if search and search.strip():
            safe_term = re.escape(search.strip())
            regex_condition = {"$regex": safe_term, "$options": "i"}
            filter_query = {
                "$or": [
                    {"name": regex_condition},
                    {"email": regex_condition},
                    {"phone": regex_condition},
                    {"company": regex_condition},
                ]
            }

        cursor = self.collection.find(filter_query).sort([("updated_at", -1), ("_id", -1)])
        results: List[Dict[str, Any]] = []
        async for doc in cursor:
            serialized = serialize_contact_doc(doc)
            if serialized:
                results.append(serialized)
        return results

    async def get_contact_by_id(self, contact_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a single contact by its string ID.

        Raises ValueError if contact_id is malformed.
        """
        oid = to_object_id(contact_id)
        doc = await self.collection.find_one({"_id": oid})
        return serialize_contact_doc(doc)

    async def create_contact(self, contact_in: ContactCreate) -> Dict[str, Any]:
        """Create a new contact in MongoDB Atlas with UTC timestamps."""
        now = datetime.now(timezone.utc)
        doc_data = contact_in.model_dump()
        doc_data["created_at"] = now
        doc_data["updated_at"] = now

        result = await self.collection.insert_one(doc_data)
        doc_data["_id"] = result.inserted_id
        return serialize_contact_doc(doc_data)  # type: ignore

    async def update_contact(self, contact_id: str, contact_update: ContactUpdate) -> Optional[Dict[str, Any]]:
        """Update an existing contact with non-empty fields and refresh updated_at.

        Raises ValueError if contact_id is malformed.
        """
        oid = to_object_id(contact_id)
        update_data = contact_update.model_dump(exclude_unset=True)
        if not update_data:
            # If nothing was provided in the update, return existing contact
            return await self.get_contact_by_id(contact_id)

        update_data["updated_at"] = datetime.now(timezone.utc)

        updated_doc = await self.collection.find_one_and_update(
            {"_id": oid},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        return serialize_contact_doc(updated_doc)

    async def delete_contact(self, contact_id: str) -> bool:
        """Delete a contact by its ID.

        Raises ValueError if contact_id is malformed.
        Returns True if deleted, False if not found.
        """
        oid = to_object_id(contact_id)
        result = await self.collection.delete_one({"_id": oid})
        return result.deleted_count > 0


def get_contact_service() -> ContactService:
    """FastAPI dependency for accessing the contact service."""
    return ContactService()
