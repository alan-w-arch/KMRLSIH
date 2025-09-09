# app/services/db.py
import uuid
import logging
from typing import Optional

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import insert
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.models.document import Document

logger = logging.getLogger(__name__)

# --- Engine & Session Setup ---
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # set True for debugging SQL
    pool_pre_ping=True,  # detect dropped connections
    future=True,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


# --- Dependency (for FastAPI DI) ---
from typing import AsyncGenerator

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a DB session."""
    async with AsyncSessionLocal() as session:
        yield session


# --- Insert Function ---
async def insert_doc_meta(
    filename: str,
    s3_key: str,
    source: str,
    text: Optional[str] = None,
    meta: Optional[dict] = None,
) -> uuid.UUID:
    """
    Insert document metadata into DB.
    Returns the generated UUID for the inserted document.
    """
    doc_id = uuid.uuid4()

    async with AsyncSessionLocal() as session:
        try:
            stmt = (
                insert(Document)
                .values(
                    id=doc_id,
                    filename=filename,
                    s3_key=s3_key,
                    source=source,
                    detected_text=text,
                    meta=meta,
                )
                .returning(Document.id)
            )
            result = await session.execute(stmt)
            await session.commit()

            logger.info("Inserted document %s (%s)", filename, doc_id)
            return result.scalar_one()

        except SQLAlchemyError as e:
            logger.exception("DB insert failed for file %s: %s", filename, e)
            await session.rollback()
            raise
