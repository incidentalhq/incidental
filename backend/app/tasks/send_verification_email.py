from urllib.parse import urlencode

import structlog

from app.env import settings
from app.repos import UserRepo
from app.schemas.tasks import SendVerificationEmailParameters
from app.services.emailer import SendgridEmailer
from app.services.security import SecurityService

from .base import BaseTask

logger = structlog.getLogger(logger_name=__name__)


class SendVerificationEmailTask(BaseTask["SendVerificationEmailParameters"]):
    def execute(self, parameters: "SendVerificationEmailParameters"):
        user_repo = UserRepo(session=self.session)
        user = user_repo.get_by_id_or_raise(id=parameters.user_id)

        security_service = SecurityService(session=self.session)
        emailer = SendgridEmailer()
        template_id = "d-0e522385acec47dd89f106e184b4f331"
        code = security_service.generate_otp_code(user)
        url_params = urlencode(
            {
                "code": code,
                "email": user.email_address,
            }
        )
        data = {
            "url": f"{settings.FRONTEND_URL}/verify?{url_params}",
            "name": user.name,
        }
        emailer.send(to_address=user.email_address, template_id=template_id, template_vars=data)

        return None
