from typing import TypedDict

import structlog
from slack_sdk import WebClient

from app.env import settings
from app.models import IncidentRoleKind, Organisation, User
from app.models.form import FormType
from app.repos import FormRepo, IncidentRepo, SeverityRepo, UserRepo
from app.schemas.slack import SlackCommandDataSchema
from app.services.incident import IncidentService
from app.services.slack.forms.update_incident import UpdateIncidentForm
from app.services.slack.renderer.form import FormRenderer
from app.services.slack.user import SlackUserService

logger = structlog.get_logger(logger_name=__name__)


class CommandError(Exception):
    pass


class InvalidUsageError(CommandError):
    def __init__(self, message: str, command: SlackCommandDataSchema, *args: object) -> None:
        super().__init__(*args)

        self.message = message
        self.command = command


class SubCommandType(TypedDict):
    sub_command: str
    handler: str


class SlackCommandService:
    sub_commands: list[SubCommandType] = [
        {
            "sub_command": "lead",
            "handler": "assign_lead",
        },
        {
            "sub_command": "status",
            "handler": "update_status",
        },
    ]

    def __init__(
        self,
        organisation: Organisation,
        form_repo: FormRepo,
        severity_repo: SeverityRepo,
        incident_repo: IncidentRepo,
        user_repo: UserRepo,
        slack_user_service: SlackUserService,
        incident_service: IncidentService,
    ):
        self.severity_repo = severity_repo
        self.incident_repo = incident_repo
        self.organisation = organisation
        self.form_repo = form_repo
        self.slack_client = WebClient(token=self.organisation.slack_bot_token)
        self.user_repo = user_repo
        self.slack_user_service = slack_user_service
        self.incident_service = incident_service

    def handle_command(self, command: SlackCommandDataSchema, user: User):
        try:
            if self.is_incident_channel(command.channel_id):
                self.handle_incident_channel_command(command)
            else:
                self.handle_create_incident(command)
        except InvalidUsageError as ex:
            self.show_invalid_usage_error(message=ex.message, command=ex.command)

    def is_incident_channel(self, channel_id: str) -> bool:
        incidents = self.incident_repo.get_all_incidents(organisation=self.organisation)
        channel_ids = set([it.slack_channel_id for it in incidents])

        if channel_id in channel_ids:
            return True

        return False

    def handle_create_incident(self, command: SlackCommandDataSchema):
        """Launch the create incident form"""
        create_incident_form = self.form_repo.get_form(
            organisation=self.organisation, form_type=FormType.CREATE_INCIDENT
        )
        if not create_incident_form:
            raise RuntimeError("Could not find create incident form")

        form_renderer = FormRenderer(
            severities=self.severity_repo.get_all(organisation=self.organisation),
            incident_types=self.incident_repo.get_all_incident_types(self.organisation),
            incident_statuses=self.incident_repo.get_all_incident_statuses(self.organisation),
        )
        rendered_form_view = form_renderer.render(form=create_incident_form)
        self.slack_client.views_open(trigger_id=command.trigger_id, view=rendered_form_view)

    def handle_incident_channel_command(self, command: SlackCommandDataSchema) -> None:
        """When command is issued within an incident channel"""
        if not command.text:
            self.show_commands_help(command=command)
            return

        parts = list(map(lambda it: it.strip(), command.text.split(" ")))
        sub_command = parts[0]

        handler_descriptor = next(filter(lambda it: it["sub_command"] == sub_command, self.sub_commands), None)
        if not handler_descriptor:
            raise InvalidUsageError(f"{sub_command} is not a valid command. To get help use /inc", command)

        handler = getattr(self, handler_descriptor["handler"])
        handler(command, parts[1:])

    def assign_lead(self, command: SlackCommandDataSchema, params: list[str]):
        """Assign lead role to a user"""

        if len(params) != 1:
            raise InvalidUsageError("This command expects the name of user, e.g /inc lead @TheUser", command)

        incident = self.incident_repo.get_incident_by_slack_channel_id(command.channel_id)
        if not incident:
            raise RuntimeError("Could not find associated incident")

        role = self.incident_repo.get_incident_role(organisation=self.organisation, kind=IncidentRoleKind.LEAD)
        if not role:
            raise RuntimeError("Could not find lead role for organisation")

        user_tag = params[0]  # formatted: <@U03E56CEXB2|username>
        slack_user_id = user_tag.split("|")[0].lstrip("<").replace("@", "")

        user = self.slack_user_service.get_or_create_user_from_slack_id(
            slack_id=slack_user_id, organisation=self.organisation
        )
        if not user:
            raise InvalidUsageError(f"Could not find user {params[0]}", command)

        self.incident_repo.assign_role(incident=incident, role=role, user=user)
        logger.info("Assigned role", role=IncidentRoleKind.LEAD, user=user.id)

        public_message = f"<@{user.slack_user_id}> has been assigned as {role.name} for this incident"
        self.slack_client.chat_postMessage(channel=command.channel_id, user=user.slack_user_id, text=public_message)

        # TODO: send a ephemeral message to the user who has the new role about what the expectations are for the role

        # add lead to bookmarks
        bookmarks_response = self.slack_client.bookmarks_list(channel_id=command.channel_id)
        has_lead_bookmark = False

        for bookmark in bookmarks_response.get("bookmarks", []):
            if bookmark["title"].startswith("Lead:"):
                has_lead_bookmark = True
                break

        if not has_lead_bookmark:
            lead_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
            self.slack_client.bookmarks_add(
                channel_id=incident.slack_channel_id,
                title=f"Lead: {user.name}",
                link=lead_url,
                emoji=":firefighter:",
                type="link",
            )

    def update_status(self, command: SlackCommandDataSchema, params: list[str]):
        """Show the update status form"""
        logger.info("Opening update status form")
        update_incident_form_model = self.form_repo.get_form(
            organisation=self.organisation, form_type=FormType.UPDATE_INCIDENT
        )
        if not update_incident_form_model:
            raise RuntimeError("Could not find update incident status form")

        incident = self.incident_repo.get_incident_by_slack_channel_id(command.channel_id)
        if not incident:
            raise RuntimeError("Could not find associated incident")

        form_renderer = FormRenderer(
            severities=self.severity_repo.get_all(organisation=self.organisation),
            incident_types=self.incident_repo.get_all_incident_types(self.organisation),
            incident_statuses=self.incident_repo.get_all_incident_statuses(self.organisation),
        )
        update_incident_form = UpdateIncidentForm(
            form=update_incident_form_model,
            incident=incident,
            form_renderer=form_renderer,
            incident_repo=self.incident_repo,
            incident_service=self.incident_service,
        )
        rendered_form_view = update_incident_form.render()
        self.slack_client.views_open(trigger_id=command.trigger_id, view=rendered_form_view)

    def show_commands_help(self, command: SlackCommandDataSchema):
        help_message = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Available commands are: `status`, `lead @username`",
                },
            }
        ]
        self.slack_client.chat_postEphemeral(channel=command.channel_id, user=command.user_id, blocks=help_message)

    def show_invalid_usage_error(self, message: str, command: SlackCommandDataSchema):
        self.slack_client.chat_postEphemeral(channel=command.channel_id, user=command.user_id, text=message)
