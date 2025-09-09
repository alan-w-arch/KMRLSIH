# app/main.py

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.services.db import engine
from app.models.document import Base
from app.routers.upload import router as upload_router
from app.tasks.scheduler import start_scheduler, shutdown_scheduler

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """App startup/shutdown lifecycle manager."""
    try:
        # Initialize DB schema (replace with Alembic migrations in real prod)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema initialized")

        # Start background scheduler
        await start_scheduler()
        logger.info("Scheduler started")

        yield

    except SQLAlchemyError as db_err:
        logger.exception("Database initialization failed: %s", db_err)
        raise
    except Exception as e:
        logger.exception("Unexpected error during startup: %s", e)
        raise
    finally:
        try:
            await shutdown_scheduler()
            logger.info("Scheduler shutdown complete")
        except Exception as e:
            logger.warning("Scheduler shutdown failed: %s", e)


# --- FastAPI app ---
app = FastAPI(
    title="KMRL Ingestion Service",
    version="0.2.0",
    description="Service for ingestion, OCR, and metadata management",
    lifespan=lifespan,
)


# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Routers ---
app.include_router(upload_router)


# --- Health Check ---
@app.get("/health")
async def health():
    """Lightweight health check endpoint."""
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        return {"status": "ok", "db": "up", "scheduler": "running"}
    except Exception:
        return {"status": "degraded", "db": "down", "scheduler": "unknown"}
