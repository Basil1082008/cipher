"""MongoDB Atlas database connection management using PyMongo Async API."""

import logging
from typing import Any, Dict, Optional
from pymongo import AsyncMongoClient
from pymongo.asynchronous.collection import AsyncCollection
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import ConnectionFailure, PyMongoError

from app.config import Settings, get_settings

logger = logging.getLogger("contact_manager.database")

# Global container holding the shared client, db, and collection
_db_context: Dict[str, Any] = {
    "client": None,
    "database": None,
    "contacts_collection": None,
    "connected": False,
    "error_message": None,
}


async def init_db(settings: Optional[Settings] = None) -> None:
    """Initialize the PyMongo AsyncMongoClient and verify Atlas connectivity."""
    if settings is None:
        settings = get_settings()

    try:
        connection_url = settings.validate_mongodb_url()
    except ValueError as e:
        _db_context["connected"] = False
        _db_context["error_message"] = str(e)
        logger.warning("MongoDB not configured: %s", e)
        return

    try:
        logger.info("Connecting to MongoDB Atlas database '%s'...", settings.database_name)
        client: AsyncMongoClient = AsyncMongoClient(
            connection_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )

        # Ping the deployment to verify authorization and cluster status
        await client.admin.command("ping")

        database: AsyncDatabase = client[settings.database_name]
        contacts_collection: AsyncCollection = database["contacts"]

        _db_context["client"] = client
        _db_context["database"] = database
        _db_context["contacts_collection"] = contacts_collection
        _db_context["connected"] = True
        _db_context["error_message"] = None
        logger.info("Successfully connected and pinged MongoDB Atlas cluster.")

    except (ConnectionFailure, PyMongoError) as err:
        _db_context["connected"] = False
        _db_context["error_message"] = f"Failed to connect to MongoDB: {type(err).__name__}"
        logger.error(
            "MongoDB Atlas connection check failed: %s. "
            "Please check your cluster URL, credentials, and network access list in MongoDB Atlas.",
            type(err).__name__,
        )
    except Exception as err:
        _db_context["connected"] = False
        _db_context["error_message"] = str(err)
        logger.error("Unexpected error during MongoDB initialization: %s", err)


async def close_db() -> None:
    """Close the MongoDB client connection cleanly during shutdown."""
    client: Optional[AsyncMongoClient] = _db_context.get("client")
    if client is not None:
        try:
            await client.close()
            logger.info("MongoDB client connection closed cleanly.")
        except Exception as e:
            logger.warning("Error while closing MongoDB client: %s", e)
    _db_context["client"] = None
    _db_context["database"] = None
    _db_context["contacts_collection"] = None
    _db_context["connected"] = False


async def ping_database() -> bool:
    """Perform a live ping against the MongoDB database."""
    client: Optional[AsyncMongoClient] = _db_context.get("client")
    if client is None:
        return False
    try:
        await client.admin.command("ping")
        _db_context["connected"] = True
        return True
    except Exception:
        _db_context["connected"] = False
        return False


def get_contacts_collection() -> AsyncCollection:
    """Dependency / accessor to get the contacts collection.

    Raises RuntimeError if database is not connected.
    """
    col = _db_context.get("contacts_collection")
    if col is None:
        err = _db_context.get("error_message") or "Database connection is not initialized."
        raise RuntimeError(
            f"Cannot perform database operation: {err} "
            "Ensure MONGODB_URL is configured in backend/.env and MongoDB Atlas allows your IP."
        )
    return col


def get_db_status() -> Dict[str, Any]:
    """Get the current database connection state and diagnostics."""
    return {
        "connected": bool(_db_context.get("connected")),
        "database_name": get_settings().database_name,
        "error_message": _db_context.get("error_message"),
    }
