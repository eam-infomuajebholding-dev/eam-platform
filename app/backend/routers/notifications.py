import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.notifications import NotificationService
from services.consultations import ConsultationsService
from services.contact_messages import Contact_messagesService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


class ConsultationSubmitRequest(BaseModel):
    name: str
    email: str
    phone: str = ""
    consultation_type: str = ""
    message: str


class ContactSubmitRequest(BaseModel):
    name: str
    email: str
    phone: str = ""
    subject: str = ""
    message: str


class SubmitResponse(BaseModel):
    success: bool
    message: str
    record_id: int = None


@router.post("/submit-consultation", response_model=SubmitResponse)
async def submit_consultation(
    data: ConsultationSubmitRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit consultation request, save to DB, and send confirmation"""
    try:
        # Save to database
        service = ConsultationsService(db)
        record = await service.create(
            {
                "name": data.name,
                "email": data.email,
                "phone": data.phone,
                "consultation_type": data.consultation_type,
                "message": data.message,
                "status": "pending",
            }
        )

        # Send confirmation notification
        await NotificationService.send_consultation_confirmation(
            {
                "name": data.name,
                "email": data.email,
                "consultation_type": data.consultation_type,
            }
        )

        return SubmitResponse(
            success=True,
            message="تم إرسال طلب الاستشارة بنجاح وسيتم التواصل معك قريباً",
            record_id=record.id if record else None,
        )
    except Exception as e:
        logger.error(f"Failed to submit consultation: {e}")
        raise HTTPException(status_code=500, detail=f"حدث خطأ: {str(e)}")


@router.post("/submit-contact", response_model=SubmitResponse)
async def submit_contact(
    data: ContactSubmitRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit contact message, save to DB, and send confirmation"""
    try:
        # Save to database
        service = Contact_messagesService(db)
        record = await service.create(
            {
                "name": data.name,
                "email": data.email,
                "phone": data.phone,
                "subject": data.subject,
                "message": data.message,
                "status": "unread",
            }
        )

        # Send confirmation notification
        await NotificationService.send_contact_confirmation(
            {
                "name": data.name,
                "email": data.email,
                "subject": data.subject,
            }
        )

        return SubmitResponse(
            success=True,
            message="تم إرسال رسالتك بنجاح وسيتم الرد عليك قريباً",
            record_id=record.id if record else None,
        )
    except Exception as e:
        logger.error(f"Failed to submit contact message: {e}")
        raise HTTPException(status_code=500, detail=f"حدث خطأ: {str(e)}")