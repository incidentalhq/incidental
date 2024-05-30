import structlog
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from app.repos import OrganisationRepo
from app.schemas.tasks import JoinChannelTaskParameters

from .base import BaseTask

logger = structlog.get_logger(logger_name=__name__)


class JoinChannelTask(BaseTask["JoinChannelTaskParameters"]):
    def execute(self, parameters: "JoinChannelTaskParameters"):
        organisation_repo = OrganisationRepo(session=self.session)
        organisation = organisation_repo.get_by_id_or_raise(parameters.organisation_id)

        client = WebClient(token=organisation.slack_bot_token)
        try:
            client.conversations_join(channel=parameters.slack_channel_id)
        except SlackApiError as e:
            logger.exception("Error joining channel", slack_error_code=e.response.get("error"))
