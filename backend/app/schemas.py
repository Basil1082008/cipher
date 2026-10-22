"""Pydantic schemas for request and response validation."""

from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


def _strip_and_normalize(value: Optional[str]) -> Optional[str]:
    """Strip whitespace and normalize empty strings to None."""
    if value is None:
        return None
    stripped = value.strip()
    return stripped if stripped else None


class ContactBase(BaseModel):
    """Base contact fields shared across create and update schemas."""

    name: str = Field(..., description="Full name of the contact", min_length=1, max_length=120)
    email: Optional[EmailStr] = Field(None, description="Optional email address")
    phone: Optional[str] = Field(None, description="Optional phone number", max_length=50)
    company: Optional[str] = Field(None, description="Optional company or organization name", max_length=120)
    job_title: Optional[str] = Field(None, description="Optional job title or role", max_length=120)
    address: Optional[str] = Field(None, description="Optional physical address", max_length=250)
    notes: Optional[str] = Field(None, description="Optional notes about the contact", max_length=1000)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        stripped = v.strip() if v else ""
        if not stripped:
            raise ValueError("Contact name cannot be empty or only whitespace")
        return stripped

    @field_validator("phone", "company", "job_title", "address", "notes", mode="before")
    @classmethod
    def normalize_optional_fields(cls, v: Optional[str]) -> Optional[str]:
        return _strip_and_normalize(v)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: Optional[str]) -> Optional[str]:
        val = _strip_and_normalize(v)
        return val.lower() if val else None


class ContactCreate(ContactBase):
    """Schema for creating a new contact."""
    pass


class ContactUpdate(BaseModel):
    """Schema for updating an existing contact. All fields optional."""

    name: Optional[str] = Field(None, description="Full name of the contact", min_length=1, max_length=120)
    email: Optional[EmailStr] = Field(None, description="Optional email address")
    phone: Optional[str] = Field(None, description="Optional phone number", max_length=50)
    company: Optional[str] = Field(None, description="Optional company or organization name", max_length=120)
    job_title: Optional[str] = Field(None, description="Optional job title or role", max_length=120)
    address: Optional[str] = Field(None, description="Optional physical address", max_length=250)
    notes: Optional[str] = Field(None, description="Optional notes about the contact", max_length=1000)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        stripped = v.strip()
        if not stripped:
            raise ValueError("Contact name cannot be empty or only whitespace")
        return stripped

    @field_validator("phone", "company", "job_title", "address", "notes", mode="before")
    @classmethod
    def normalize_optional_fields(cls, v: Optional[str]) -> Optional[str]:
        return _strip_and_normalize(v)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: Optional[str]) -> Optional[str]:
        val = _strip_and_normalize(v)
        return val.lower() if val else None


class ContactResponse(BaseModel):
    """Schema for contact responses returned by the API."""

    id: str = Field(..., description="String representation of MongoDB ObjectId")
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field("ok", description="FastAPI service status")
    database: str = Field(..., description="MongoDB connection status: connected, disconnected, or unconfigured")
    database_name: Optional[str] = None
    detail: Optional[str] = None
