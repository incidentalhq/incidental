import structlog
from slack_sdk import WebClient

from app.models import Organisation, User
from app.repos import FormRepo
from app.schemas.slack import SlackCommandDataSchema
from app.services.events import Events

# commands
from .assign_lead import AssignLeadCommand
from .assign_role import AssignGenericRoleCommand
from .base import SlackCommandHandlerBase
from .create_incident import CreateIncidentCommand
from .errors import InvalidUsageError
from .update_status import UpdateStatusCommand

logger = structlog.get_logger(logger_name=__name__)


class SlackCommandRouterService:
    def __init__(
        self,
        organisation: Organisation,
        form_repo: FormRepo,
        events: Events,
    ):
        self.organisation = organisation
        self.slack_client = WebClient(token=self.organisation.slack_bot_token)
        self.session = form_repo.session

        self.commands: list[SlackCommandHandlerBase] = [
            CreateIncidentCommand(session=self.session, organisation=self.organisation, events=events),
            AssignLeadCommand(session=self.session, organisation=organisation, events=events),
            AssignGenericRoleCommand(session=self.session, organisation=organisation, events=events),
            UpdateStatusCommand(session=self.session, organisation=organisation, events=events),
        ]

    def handle_command(self, command: SlackCommandDataSchema, user: User):
        for command_handler in self.commands:
            if command_handler.can_trigger(command=command):
                try:
                    logger.info("Running command handler", handler=command_handler.__class__.__name__)
                    return command_handler.execute(command=command)
                except InvalidUsageError as ex:
                    self.show_invalid_usage_error(message=ex.message, command=ex.command)
                    return

        self.show_commands_help(command=command)

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
