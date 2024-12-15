import structlog

from app.env import settings
from app.repos import InviteRepo
from app.schemas.tasks import SendInviteTaskParameters
from app.services.emailer import SendgridEmailer

from .base import BaseTask

logger = structlog.getLogger(logger_name=__name__)


class SendInviteEmailTask(BaseTask["SendInviteTaskParameters"]):
    def execute(self, parameters: "SendInviteTaskParameters") -> None:
        invite_repo = InviteRepo(session=self.session)
        invite = invite_repo.get_by_id_or_raise(id=parameters.invite_id)

        emailer = SendgridEmailer()
        template_id = "d-c60b57b5941b44c2b3c95624c3a43159"
        data = {
            "url": f"{settings.FRONTEND_URL}/login",
            "inviter": invite.inviter.name,
            "organisation_name": invite.organisation.name,
        }
        emailer.send(to_address=invite.email_address, template_id=template_id, template_vars=data)

        return None
