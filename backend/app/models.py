"""Database document models and serialization helpers."""

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from bson import ObjectId
from bson.errors import InvalidId


def is_valid_object_id(id_str: str) -> bool:
    """Check if a string is a valid 24-character hexadecimal MongoDB ObjectId."""
    if not isinstance(id_str, str) or len(id_str) != 24:
        return False
    try:
        ObjectId(id_str)
        return True
    except (InvalidId, TypeError, ValueError):
        return False


def to_object_id(id_str: str) -> ObjectId:
    """Convert string to ObjectId, raising ValueError if invalid."""
    if not is_valid_object_id(id_str):
        raise ValueError(f"Invalid contact ID format: '{id_str}'. Must be a 24-character hex string.")
    return ObjectId(id_str)


def serialize_contact_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert MongoDB document with _id and datetimes into API-compatible dictionary."""
    if doc is None:
        return None
    data = dict(doc)
    if "_id" in data:
        data["id"] = str(data.pop("_id"))
    elif "id" in data and isinstance(data["id"], ObjectId):
        data["id"] = str(data["id"])

    # Ensure UTC timezone awareness on datetimes
    for field in ("created_at", "updated_at"):
        val = data.get(field)
        if isinstance(val, datetime):
            if val.tzinfo is None:
                data[field] = val.replace(tzinfo=timezone.utc)
            else:
                data[field] = val.astimezone(timezone.utc)

    return data
