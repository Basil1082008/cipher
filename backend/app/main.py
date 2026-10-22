"""Main FastAPI application entry point with lifespan, CORS, and routing."""

from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import close_db, init_db
from app.routes.contacts import router as contacts_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("contact_manager")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown lifecycles."""
    logger.info("Initializing Contact Manager application...")
    settings = get_settings()
    await init_db(settings)
    yield
    logger.info("Shutting down Contact Manager application...")
    await close_db()


app = FastAPI(
    title="Contact Manager REST API",
    description="Full-stack Contact Manager backend using FastAPI and MongoDB Atlas Free Tier.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS for Vite frontend
settings = get_settings()
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if settings.frontend_origin and settings.frontend_origin not in origins:
    origins.append(settings.frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(item) for item in err.get("loc", []) if item != "body")
        msg = err.get("msg", "Invalid value")
        errors.append({"field": loc or "body", "message": msg})
    return JSONResponse(
        status_code=getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422),
        content={"detail": "Validation error", "errors": errors},
    )


# Exception handler for unhandled exceptions (avoids leaking stack traces)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error processing %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# Include contact routes under /api/contacts
app.include_router(contacts_router, prefix="/api/contacts")

# Also expose /api/health at the root api level for convenience
from app.routes.contacts import health_check

app.add_api_route("/api/health", health_check, methods=["GET"], tags=["Health"], include_in_schema=True)
app.add_api_route("/health", health_check, methods=["GET"], tags=["Health"], include_in_schema=False)


@app.get("/", include_in_schema=False)
async def root():
    return {
        "message": "Contact Manager API is running",
        "documentation": "/docs",
        "health": "/api/health",
        "contacts": "/api/contacts",
    }
