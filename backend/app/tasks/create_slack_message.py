from slack_sdk import WebClient

from app.repos import OrganisationRepo
from app.schemas.tasks import CreateSlackMessageTaskParameters

from .base import BaseTask


class CreateSlackMessageTask(BaseTask["CreateSlackMessageTaskParameters"]):
    def execute(self, parameters: "CreateSlackMessageTaskParameters"):
        organisation_repo = OrganisationRepo(session=self.session)
        organisation = organisation_repo.get_by_id_or_raise(id=parameters.organisation_id)

        client = WebClient(token=organisation.slack_bot_token)

        client.chat_postMessage(
            channel=parameters.channel_id,
            text=parameters.message,
        )
