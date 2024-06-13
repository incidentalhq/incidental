import structlog
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from app.models.slack_message import SlackMessageKind
from app.repos import IncidentRepo, SlackMessageRepo, UserRepo
from app.schemas.tasks import CreateIncidentUpdateParameters
from app.services.slack.renderer import IncidentUpdateRenderer

from .base import BaseTask

logger = structlog.get_logger(logger_name=__name__)


class CreateIncidentUpdateTask(BaseTask["CreateIncidentUpdateParameters"]):
    """Called when an incident update is created"""

    def execute(self, parameters: "CreateIncidentUpdateParameters"):
        incident_repo = IncidentRepo(session=self.session)
        user_repo = UserRepo(session=self.session)
        slack_message_repo = SlackMessageRepo(session=self.session)

        incident = incident_repo.get_incident_by_id(id=parameters.incident_id)
        if not incident:
            raise RuntimeError("could not find incident")

        incident_update = incident_repo.get_incident_update_by_id(parameters.incident_update_id)
        if not incident_update:
            raise RuntimeError("could not find incident update")

        creator = user_repo.get_by_id(parameters.creator_id)
        if not creator:
            raise RuntimeError("could not find user id")

        client = WebClient(token=incident.organisation.slack_bot_token)

        renderer = IncidentUpdateRenderer(
            creator=creator,
            summary=incident_update.summary,
            incident_update=incident_update,
        )
        blocks = renderer.render()

        if not incident.slack_channel_id:
            raise RuntimeError("channel id must be set on incident before posting an incident update in slack")

        try:
            posted_message_response = client.chat_postMessage(
                channel=incident.slack_channel_id, blocks=blocks, text="A new incident update has been shared"
            )

            return slack_message_repo.create_slack_message(
                organisation=incident.organisation,
                response=posted_message_response.data,  # type: ignore
                kind=SlackMessageKind.INCIDENT_UPDATE,
            )
        except SlackApiError as e:
            if e.response.get("error") == "is_archived":
                return None
            else:
                raise
