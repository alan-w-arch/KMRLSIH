# app/services/object_store.py

import uuid
import logging
import aioboto3
from typing import Optional
from botocore.exceptions import BotoCoreError, ClientError

from app.config import settings

logger = logging.getLogger(__name__)


# Reusable aioboto3 session (don’t recreate each call)
session = aioboto3.Session()


async def upload_raw(
    filename: str,
    data: bytes,
    content_type: str = "application/octet-stream",
    prefix: str = "raw",
) -> str:
    """
    Upload raw file bytes to S3-compatible object storage.
    Returns the generated S3 key.
    """
    key = f"{prefix}/{uuid.uuid4()}_{filename}"

    try:
        async with session.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
        ) as s3:
            await s3.put_object(
                Bucket=settings.S3_BUCKET,
                Key=key,
                Body=data,
                ContentType=content_type,
            )
        logger.info("Uploaded %s (%s) to bucket %s", filename, key, settings.S3_BUCKET)
        return key

    except (BotoCoreError, ClientError) as e:
        logger.exception("S3 upload failed for %s: %s", filename, e)
        raise RuntimeError("Failed to upload file to object store") from e
