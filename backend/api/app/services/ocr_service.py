# app/services/ocr_service.py

import io
import logging
from typing import Optional
from PIL import Image, UnidentifiedImageError
import pytesseract
import asyncio

logger = logging.getLogger(__name__)


async def ocr_if_needed(
    data: bytes,
    content_type: str,
    lang: str = "eng+mal",
) -> Optional[str]:
    """
    Perform OCR if content type is an image (basic support).
    Optionally extend for PDFs using pdf2image.
    Returns extracted text or None if OCR not applicable.
    """
    if not content_type:
        return None

    if content_type.startswith("image"):
        try:
            img = Image.open(io.BytesIO(data))

            # Run OCR in threadpool (non-blocking for FastAPI)
            text: str = await asyncio.to_thread(
                pytesseract.image_to_string, img, lang=lang
            )
            logger.info("OCR completed for image (%s)", content_type)
            return text.strip()

        except UnidentifiedImageError:
            logger.warning("OCR skipped: invalid image format")
            return None
        except Exception as e:
            logger.exception("OCR failed: %s", e)
            return None

    # TODO: add PDF OCR support with pdf2image if needed
    logger.debug("OCR skipped: unsupported content type %s", content_type)
    return None
