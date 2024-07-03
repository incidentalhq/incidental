import structlog

from app.schemas.slack import SlackCommandDataSchema

from .base import SlackCommandHandlerBase
from .errors import InvalidUsageError

logger = structlog.get_logger(logger_name=__name__)


class AssignGenericRoleCommand(SlackCommandHandlerBase):
    """Assign any role for user"""

    trigger_word = "role"
    trigger_in_incident_channel = True

    def execute(self, command: SlackCommandDataSchema):
        _, params = self.get_params(command=command)
        if len(params) != 2:
            raise InvalidUsageError("use /inc role role_name @user", command=command)

        # get incident
        incident = self.incident_repo.get_incident_by_slack_channel_id(command.channel_id)
        if not incident:
            raise RuntimeError("Could not find associated incident")

        # find and validate role name
        role_name = params[0]
        role = self.incident_repo.get_incident_role_by_slack_reference(
            organisation=self.organisation, slack_reference=role_name
        )
        if not role:
            valid_roles = self.incident_repo.get_all_incident_roles(organisation=self.organisation)
            roles_str = ", ".join([role.slack_reference for role in valid_roles])
            raise InvalidUsageError(f"Could not find that role, valid roles are: {roles_str}", command=command)

        # find user, or create user
        user_tag = params[1]  # formatted: <@U03E56CEXB2|username>
        slack_user_id = user_tag.split("|")[0].lstrip("<").replace("@", "")

        user = self.slack_user_service.get_or_create_user_from_slack_id(
            slack_id=slack_user_id, organisation=self.organisation
        )
        if not user:
            raise InvalidUsageError(f"Could not find user {params[1]}", command)

        self.incident_service.assign_role(incident=incident, user=user, role=role)
