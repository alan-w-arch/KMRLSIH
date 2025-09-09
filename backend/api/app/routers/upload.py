# app/routers/upload.py

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.services.object_store import upload_raw
from app.services.ocr_service import ocr_if_needed
from app.services.db import insert_doc_meta

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ingest", tags=["ingestion"])


class UploadResponse(BaseModel):
    filename: str
    s3_key: str
    message: str = "Upload successful"


MAX_FILE_SIZE_MB = 20  # example limit


@router.post("/upload", response_model=UploadResponse)
async def upload(file: UploadFile = File(...)):
    """
    Upload a file, store it in object storage, optionally run OCR,
    and persist metadata to the database.
    """

    try:
        data = await file.read()

        # --- Validation ---
        size_mb = len(data) / (1024 * 1024)
        if size_mb > MAX_FILE_SIZE_MB:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds {MAX_FILE_SIZE_MB} MB limit.",
            )

        content_type = file.content_type or "application/octet-stream"
        logger.info("Received file: %s (%s, %.2f MB)", file.filename, content_type, size_mb)

        # --- Upload to object store ---
        try:
            s3_key = await upload_raw(file.filename, data, content_type)
        except Exception as e:
            logger.exception("Object store upload failed: %s", e)
            raise HTTPException(status_code=500, detail="Failed to upload to object store.")

        # --- OCR step ---
        try:
            text = await ocr_if_needed(data, content_type)
        except Exception as e:
            logger.warning("OCR failed for %s: %s", file.filename, e)
            text = None

        # --- DB insert ---
        try:
            await insert_doc_meta(
                file.filename,
                s3_key,
                source="upload",
                text=text,
                meta={"content_type": content_type, "size_mb": size_mb},
            )
        except Exception as e:
            logger.exception("DB insert failed: %s", e)
            raise HTTPException(status_code=500, detail="Failed to save document metadata.")

        return UploadResponse(filename=file.filename, s3_key=s3_key)

    except HTTPException:
        raise  # re-raise known errors
    except Exception as e:
        logger.exception("Unexpected error during upload: %s", e)
        raise HTTPException(status_code=500, detail="Unexpected error during upload.")
    await insert_doc_meta(
                file.filename,
                s3_key,
                source="upload",
                text=text,
                meta={
                    "content_type": content_type, 
                    "size_mb": size_mb,
                    "extraction_method": extraction_method
                },
            )
