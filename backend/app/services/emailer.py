from abc import abstractmethod

import httpx
import structlog

from app.env import settings

logger = structlog.get_logger(logger_name=__name__)


class EmailerBase:
    @abstractmethod
    def send(
        self,
        to_address: str,
        template_id: str,
        template_vars: dict,
        from_address: str | None = None,
        from_name: str | None = None,
    ):
        raise NotImplementedError()


class SendgridEmailer(EmailerBase):
    """Simple sendgrid emailer"""

    def __init__(self):
        self.client = httpx.Client()
        self.client.headers.update(
            {
                "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
            }
        )

    def send(
        self,
        to_address: str,
        template_id: str,
        template_vars: dict,
        from_address: str | None = None,
        from_name: str | None = None,
    ):
        """Send email"""
        url = "https://api.sendgrid.com/v3/mail/send"
        payload = {
            "from": {
                "email": from_address if from_address else settings.SUPPORT_EMAIL,
                "name": from_name if from_name else settings.SUPPORT_EMAIL_NAME,
            },
            "personalizations": [
                {
                    "to": [
                        {
                            "email": to_address,
                        },
                    ],
                    "dynamic_template_data": template_vars,
                }
            ],
            "template_id": template_id,
        }

        response = self.client.post(url, json=payload)
        if not response.is_success:
            logger.error("There was a problem sending email", err=response.content)
            return None

        logger.info("Email sent", to_address=to_address, template_id=template_id)
