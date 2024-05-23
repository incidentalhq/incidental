from typing import ClassVar, Type

from pydantic import BaseModel
from slack_sdk import WebClient

from app.models.slack_message import SlackMessageKind
from app.repos import IncidentRepo, SlackMessageRepo
from app.services.slack.renderer import IncidentInformationMessageRenderer

from .base import BaseTask


class CreatePinnedMessageTask(BaseTask["CreatePinnedMessageTaskParameters"]):
    def execute(self, parameters: "CreatePinnedMessageTaskParameters"):
        incident_repo = IncidentRepo(session=self.session)
        slack_message_repo = SlackMessageRepo(session=self.session)

        incident = incident_repo.get_incident_by_id(id=parameters.incident_id)
        if not incident:
            raise RuntimeError("could not find incident")

        if not incident.slack_channel_id:
            raise RuntimeError("slack channel id must be set on incident")

        client = WebClient(token=incident.organisation.slack_bot_token)

        renderer = IncidentInformationMessageRenderer(incident=incident)
        blocks = renderer.render()

        response = client.chat_postMessage(
            channel=incident.slack_channel_id,
            blocks=blocks,
        )

        # pin message
        client.pins_add(channel=incident.slack_channel_id, timestamp=response.get("ts"))
        slack_message_repo.create_slack_message(
            organisation=incident.organisation, response=response.data, kind=SlackMessageKind.CHANNEL_PINNED_POST
        )


class CreatePinnedMessageTaskParameters(BaseModel):
    task: ClassVar[Type[CreatePinnedMessageTask]] = CreatePinnedMessageTask
    incident_id: str
