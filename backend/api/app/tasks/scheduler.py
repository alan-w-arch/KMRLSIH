# app/tasks/scheduler.py
import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.connectors.email_connector import EmailConnector
from app.services.email_processor import EmailProcessor

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

async def process_emails():
    """Async job to process emails and attachments."""
    try:
        # Poll emails
        ec = EmailConnector()
        msgs = ec.poll_unseen()
        
        if msgs:
            logger.info(f'Fetched {len(msgs)} email messages')
            
            # Process each email
            processor = EmailProcessor()
            for msg in msgs:
                result = await processor.process_email(msg)
                if result['status'] == 'success':
                    logger.info(f"Processed email: {result['attachments_processed']} attachments")
                else:
                    logger.error(f"Failed to process email: {result.get('error')}")
        
    except Exception as e:
        logger.exception(f"Email processing job failed: {e}")

async def start_scheduler():
    # Schedule email processing every 5 minutes
    scheduler.add_job(
        process_emails,
        'interval', 
        minutes=5,  # Changed from 60 seconds to 5 minutes
        id='email_poll'
    )
    scheduler.start()
    logger.info("Email processing scheduler started")

async def shutdown_scheduler():
    scheduler.shutdown()