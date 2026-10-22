"""FastAPI routes for contact management and health monitoring."""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response

from app.database import get_db_status, ping_database
from app.schemas import ContactCreate, ContactResponse, ContactUpdate, HealthResponse
from app.services.contact_service import ContactService, get_contact_service

logger = logging.getLogger("contact_manager.routes")

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service and database health check",
    tags=["Health"],
)
async def health_check():
    """Verify backend API service status and MongoDB Atlas connectivity."""
    db_info = get_db_status()
    is_live = await ping_database() if db_info["connected"] else False

    if is_live:
        db_state = "connected"
        detail = "Connected and authenticated to MongoDB Atlas cluster."
    elif db_info.get("error_message"):
        db_state = "disconnected"
        detail = f"MongoDB connection issue: {db_info['error_message']}"
    else:
        db_state = "unconfigured"
        detail = "MongoDB connection string is not configured. See backend/.env.example."

    return HealthResponse(
        status="ok",
        database=db_state,
        database_name=db_info.get("database_name"),
        detail=detail,
    )


@router.get(
    "",
    response_model=List[ContactResponse],
    summary="List or search contacts",
    tags=["Contacts"],
)
async def list_contacts(
    search: Optional[str] = Query(None, description="Search across name, email, phone, and company"),
    service: ContactService = Depends(get_contact_service),
):
    """Retrieve all contacts sorted by most recently updated, with optional search filtering."""
    try:
        return await service.get_all_contacts(search=search)
    except RuntimeError as e:
        logger.error("Database unavailable during list_contacts: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )


@router.get(
    "/{contact_id}",
    response_model=ContactResponse,
    summary="Get contact by ID",
    tags=["Contacts"],
)
async def get_contact(
    contact_id: str,
    service: ContactService = Depends(get_contact_service),
):
    """Retrieve a single contact by its 24-character hexadecimal ObjectId."""
    try:
        contact = await service.get_contact_by_id(contact_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID '{contact_id}' was not found.",
        )
    return contact


@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new contact",
    tags=["Contacts"],
)
async def create_contact(
    contact_in: ContactCreate,
    service: ContactService = Depends(get_contact_service),
):
    """Validate and persist a new contact with automatic UTC timestamps."""
    try:
        return await service.create_contact(contact_in)
    except RuntimeError as e:
        logger.error("Database unavailable during create_contact: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )


@router.put(
    "/{contact_id}",
    response_model=ContactResponse,
    summary="Update an existing contact",
    tags=["Contacts"],
)
async def update_contact(
    contact_id: str,
    contact_update: ContactUpdate,
    service: ContactService = Depends(get_contact_service),
):
    """Update fields on an existing contact and refresh its updated_at timestamp."""
    try:
        updated = await service.update_contact(contact_id, contact_update)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID '{contact_id}' was not found.",
        )
    return updated


@router.delete(
    "/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a contact",
    tags=["Contacts"],
)
async def delete_contact(
    contact_id: str,
    service: ContactService = Depends(get_contact_service),
):
    """Delete a contact by ID. Returns 204 No Content on success."""
    try:
        deleted = await service.delete_contact(contact_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID '{contact_id}' was not found.",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
