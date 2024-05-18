import structlog
from pydantic import BaseModel
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from app.repos import OrganisationRepo

from .base import BaseTask

logger = structlog.get_logger(logger_name=__name__)


class SetChannelTopicParameters(BaseModel):
    organisation_id: str
    topic: str
    slack_channel_id: str


class SetChannelTopicTask(BaseTask[SetChannelTopicParameters]):
    def execute(self, parameters: SetChannelTopicParameters):
        organisation_repo = OrganisationRepo(session=self.session)
        organisation = organisation_repo.get_by_id_or_raise(parameters.organisation_id)

        client = WebClient(token=organisation.slack_bot_token)
        try:
            client.conversations_setTopic(channel=parameters.slack_channel_id, topic=parameters.topic)
        except SlackApiError as e:
            logger.exception("Error setting slack channel topic", slack_error_code=e.response.get("error"))
