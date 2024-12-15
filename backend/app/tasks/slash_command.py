import structlog

from app.exceptions import ApplicationException
from app.repos import (
    FormRepo,
    OrganisationRepo,
)
from app.schemas.tasks import HandleSlashCommandTaskParameters
from app.services.events import Events
from app.services.factories import create_slack_user_service
from app.services.slack.commands.router import SlackCommandRouterService

from .base import BaseTask

logger = structlog.get_logger(logger_name=__name__)


class HandleSlashCommandTask(BaseTask["HandleSlashCommandTaskParameters"]):
    def execute(self, parameters: "HandleSlashCommandTaskParameters"):
        organisation_repo = OrganisationRepo(session=self.session)
        form_repo = FormRepo(session=self.session)
        events = Events()

        organisation = organisation_repo.get_by_slack_team_id(parameters.command.team_id)
        if not organisation:
            raise ApplicationException("Could not find related organisation")

        slack_user_service = create_slack_user_service(session=self.session)

        user = slack_user_service.get_or_create_user_from_slack_id(
            slack_id=parameters.command.user_id, organisation=organisation
        )

        slack_command_service = SlackCommandRouterService(
            organisation=organisation,
            form_repo=form_repo,
            events=events,
        )

        slack_command_service.handle_command(command=parameters.command, user=user)

        self.session.commit()
        events.commit()
