# app/models/document.py

import uuid
from sqlalchemy import Column, String, Text, JSON, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Document(Base):
    """
    ORM model for storing metadata and text extracted from uploaded documents.
    """

    __tablename__ = "documents"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        unique=True,
    )
    filename = Column(String(255), nullable=False, index=True)
    s3_key = Column(String(512), unique=True, nullable=False, index=True)
    source = Column(String(100), nullable=False, index=True)  # e.g. email, upload, api
    detected_text = Column(Text, nullable=True)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<Document id={self.id} filename={self.filename} source={self.source}>"
