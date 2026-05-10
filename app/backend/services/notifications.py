import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for sending confirmation notifications"""

    @staticmethod
    async def send_consultation_confirmation(data: Dict[str, Any]) -> Dict[str, Any]:
        """Send confirmation for consultation request"""
        try:
            name = data.get("name", "")
            email = data.get("email", "")
            consultation_type = data.get("consultation_type", "عامة")

            type_labels = {
                "engineering": "استشارة هندسية",
                "government": "استشارة حكومية",
                "other": "أخرى",
            }
            type_label = type_labels.get(consultation_type, "عامة")

            logger.info(
                f"Consultation confirmation sent to {email} for {name}, type: {type_label}"
            )

            return {
                "success": True,
                "message": f"تم إرسال تأكيد طلب الاستشارة إلى {email}",
                "notification": {
                    "recipient": email,
                    "recipient_name": name,
                    "type": "consultation_confirmation",
                    "consultation_type": type_label,
                },
            }
        except Exception as e:
            logger.error(f"Failed to send consultation confirmation: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    async def send_contact_confirmation(data: Dict[str, Any]) -> Dict[str, Any]:
        """Send confirmation for contact message"""
        try:
            name = data.get("name", "")
            email = data.get("email", "")
            subject = data.get("subject", "رسالة تواصل")

            logger.info(
                f"Contact confirmation sent to {email} for {name}, subject: {subject}"
            )

            return {
                "success": True,
                "message": f"تم إرسال تأكيد استلام الرسالة إلى {email}",
                "notification": {
                    "recipient": email,
                    "recipient_name": name,
                    "type": "contact_confirmation",
                    "subject": subject,
                },
            }
        except Exception as e:
            logger.error(f"Failed to send contact confirmation: {e}")
            return {"success": False, "message": str(e)}