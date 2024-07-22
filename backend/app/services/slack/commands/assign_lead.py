import structlog

from app.models import IncidentRoleKind
from app.schemas.slack import SlackCommandDataSchema
from app.schemas.tasks import SyncBookmarksTaskParameters

from .base import SlackCommandHandlerBase
from .errors import InvalidUsageError

logger = structlog.get_logger(logger_name=__name__)


class AssignLeadCommand(SlackCommandHandlerBase):
    """Assign lead for an incident"""

    trigger_word = "lead"
    trigger_in_incident_channel = True

    def execute(self, command: SlackCommandDataSchema):
        params = self.get_params(command=command)
        if not params:
            return

        if len(params.parameters) != 1:
            raise InvalidUsageError("This command expects the name of user, e.g /inc lead @TheUser", command)

        incident = self.incident_repo.get_incident_by_slack_channel_id(command.channel_id)
        if not incident:
            raise RuntimeError("Could not find associated incident")

        role = self.incident_repo.get_incident_role(organisation=self.organisation, kind=IncidentRoleKind.LEAD)
        if not role:
            raise RuntimeError("Could not find lead role for organisation")

        user_tag = params.parameters[0]  # formatted: <@U03E56CEXB2|username>
        slack_user_id = user_tag.split("|")[0].lstrip("<").replace("@", "")

        user = self.slack_user_service.get_or_create_user_from_slack_id(
            slack_id=slack_user_id, organisation=self.organisation
        )
        if not user:
            raise InvalidUsageError(f"Could not find user {slack_user_id}", command)

        self.incident_service.assign_role(incident=incident, user=user, role=role)

        # TODO: send a ephemeral message to the user who has the new role about what the expectations are for the role

        # will add lead info to bookmarks
        self.events.queue_job(
            SyncBookmarksTaskParameters(
                incident_id=incident.id,
            )
        )
