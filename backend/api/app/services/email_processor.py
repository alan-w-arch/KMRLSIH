# app/services/email_processor.py
import logging
import email
from email.message import Message
from typing import List, Dict, Any, Optional
from datetime import datetime
import re

from app.services.object_store import upload_raw
from app.services.ocr_service import extract_text_with_fallback
from app.services.db import insert_doc_meta

logger = logging.getLogger(__name__)


class EmailProcessor:
    """Process email messages and extract attachments."""
    
    SUPPORTED_ATTACHMENTS = {
        'application/pdf': '.pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/tiff': '.tiff',
        'text/plain': '.txt'
    }
    
    async def process_email(self, msg: Message) -> Dict[str, Any]:
        """
        Process a single email message.
        Returns processing results with metadata.
        """
        try:
            # Extract email metadata
            email_meta = self._extract_email_metadata(msg)
            logger.info(f"Processing email from {email_meta.get('from')} - {email_meta.get('subject')}")
            
            # Process attachments
            attachments_processed = []
            if msg.is_multipart():
                for part in msg.walk():
                    if self._is_attachment(part):
                        result = await self._process_attachment(part, email_meta)
                        if result:
                            attachments_processed.append(result)
            
            # Store email body if no attachments but has content
            if not attachments_processed and email_meta.get('body'):
                body_result = await self._store_email_body(email_meta)
                if body_result:
                    attachments_processed.append(body_result)
            
            return {
                'email_meta': email_meta,
                'attachments_processed': len(attachments_processed),
                'results': attachments_processed,
                'status': 'success'
            }
            
        except Exception as e:
            logger.exception(f"Failed to process email: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'attachments_processed': 0
            }
    
    def _extract_email_metadata(self, msg: Message) -> Dict[str, Any]:
        """Extract metadata from email message."""
        # Get basic headers
        subject = msg.get('Subject', 'No Subject')
        from_addr = msg.get('From', 'Unknown')
        to_addr = msg.get('To', 'Unknown')
        date_str = msg.get('Date', '')
        
        # Parse date
        email_date = None
        if date_str:
            try:
                email_date = email.utils.parsedate_to_datetime(date_str)
            except:
                email_date = datetime.now()
        else:
            email_date = datetime.now()
        
        # Extract body text
        body = self._extract_body_text(msg)
        
        # Detect language (simple heuristic)
        language = self._detect_language(subject + ' ' + (body or ''))
        
        return {
            'subject': subject,
            'from': from_addr,
            'to': to_addr,
            'date': email_date,
            'body': body,
            'language': language,
            'message_id': msg.get('Message-ID', ''),
        }
    
    def _extract_body_text(self, msg: Message) -> Optional[str]:
        """Extract plain text body from email."""
        body_text = ""
        
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    charset = part.get_content_charset() or 'utf-8'
                    try:
                        body_text += part.get_payload(decode=True).decode(charset)
                    except:
                        continue
        else:
            if msg.get_content_type() == "text/plain":
                charset = msg.get_content_charset() or 'utf-8'
                try:
                    body_text = msg.get_payload(decode=True).decode(charset)
                except:
                    body_text = ""
        
        return body_text.strip() if body_text.strip() else None
    
    def _detect_language(self, text: str) -> str:
        """Simple language detection (English vs Malayalam)."""
        if not text:
            return 'unknown'
        
        # Simple heuristic: check for Malayalam unicode range
        malayalam_chars = sum(1 for char in text if '\u0d00' <= char <= '\u0d7f')
        english_chars = sum(1 for char in text if char.isalpha() and ord(char) < 128)
        
        if malayalam_chars > english_chars:
            return 'malayalam'
        elif english_chars > 0:
            return 'english'
        else:
            return 'mixed'
    
    def _is_attachment(self, part: Message) -> bool:
        """Check if message part is an attachment."""
        disposition = part.get('Content-Disposition', '')
        content_type = part.get_content_type()
        
        # Check if it's explicitly marked as attachment
        if 'attachment' in disposition:
            return True
        
        # Check if it has a filename and supported content type
        filename = part.get_filename()
        if filename and content_type in self.SUPPORTED_ATTACHMENTS:
            return True
        
        return False
    
    async def _process_attachment(self, part: Message, email_meta: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process a single attachment."""
        try:
            filename = part.get_filename()
            if not filename:
                filename = f"attachment_{email_meta.get('date', datetime.now()).strftime('%Y%m%d_%H%M%S')}"
            
            content_type = part.get_content_type()
            payload = part.get_payload(decode=True)
            
            if not payload:
                logger.warning(f"Empty attachment: {filename}")
                return None
            
            # Upload to object store
            s3_key = await upload_raw(
                filename=filename,
                data=payload,
                content_type=content_type,
                prefix="email_attachments"
            )
            
            # Run OCR if needed
            extracted_text = await ocr_if_needed(payload, content_type)
            
            # Prepare metadata
            meta = {
                'email_subject': email_meta.get('subject'),
                'email_from': email_meta.get('from'),
                'email_date': email_meta.get('date').isoformat() if email_meta.get('date') else None,
                'content_type': content_type,
                'file_size': len(payload),
                'language': email_meta.get('language', 'unknown'),
                'extraction_method': 'ocr' if extracted_text else 'none'
            }
            
            # Store in database
            doc_id = await insert_doc_meta(
                filename=filename,
                s3_key=s3_key,
                source="email",
                text=extracted_text,
                meta=meta
            )
            
            logger.info(f"Processed attachment: {filename} -> {doc_id}")
            
            return {
                'filename': filename,
                'doc_id': str(doc_id),
                's3_key': s3_key,
                'text_extracted': bool(extracted_text),
                'content_type': content_type
            }
            
        except Exception as e:
            logger.exception(f"Failed to process attachment {filename}: {e}")
            return None
    
    async def _store_email_body(self, email_meta: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Store email body as a document when no attachments are present."""
        try:
            body = email_meta.get('body')
            if not body or len(body.strip()) < 50:  # Skip very short bodies
                return None
            
            subject = email_meta.get('subject', 'No Subject')
            filename = f"email_body_{email_meta.get('date', datetime.now()).strftime('%Y%m%d_%H%M%S')}.txt"
            
            # Upload body as text file
            s3_key = await upload_raw(
                filename=filename,
                data=body.encode('utf-8'),
                content_type="text/plain",
                prefix="email_bodies"
            )
            
            # Prepare metadata
            meta = {
                'email_subject': subject,
                'email_from': email_meta.get('from'),
                'email_date': email_meta.get('date').isoformat() if email_meta.get('date') else None,
                'content_type': 'text/plain',
                'file_size': len(body.encode('utf-8')),
                'language': email_meta.get('language', 'unknown'),
                'extraction_method': 'direct'
            }
            
            # Store in database
            doc_id = await insert_doc_meta(
                filename=filename,
                s3_key=s3_key,
                source="email",
                text=body,
                meta=meta
            )
            
            logger.info(f"Stored email body: {subject} -> {doc_id}")
            
            return {
                'filename': filename,
                'doc_id': str(doc_id),
                's3_key': s3_key,
                'text_extracted': True,
                'content_type': 'text/plain'
            }
            
        except Exception as e:
            logger.exception(f"Failed to store email body: {e}")
            return None
        


        
         