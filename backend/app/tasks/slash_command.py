import structlog

from app.exceptions import ApplicationException
from app.repos import (
    AnnouncementRepo,
    FormRepo,
    IncidentRepo,
    OrganisationRepo,
    SeverityRepo,
    UserRepo,
)
from app.schemas.tasks import HandleSlashCommandTaskParameters
from app.services.events import Events
from app.services.incident import IncidentService
from app.services.slack.command import SlackCommandService
from app.services.slack.user import SlackUserService

from .base import BaseTask

logger = structlog.get_logger(logger_name=__name__)


class HandleSlashCommandTask(BaseTask["HandleSlashCommandTaskParameters"]):
    def execute(self, parameters: "HandleSlashCommandTaskParameters"):
        user_repo = UserRepo(session=self.session)
        organisation_repo = OrganisationRepo(session=self.session)
        form_repo = FormRepo(session=self.session)
        severity_repo = SeverityRepo(session=self.session)
        incident_repo = IncidentRepo(session=self.session)
        user_repo = UserRepo(session=self.session)
        announcement_repo = AnnouncementRepo(session=self.session)
        events = Events()

        organisation = organisation_repo.get_by_slack_team_id(parameters.command.team_id)
        if not organisation:
            raise ApplicationException("Could not find related organisation")

        slack_user_service = SlackUserService(
            user_repo=user_repo,
            organisation_repo=organisation_repo,
        )
        incident_service = IncidentService(
            organisation=organisation, incident_repo=incident_repo, announcement_repo=announcement_repo, events=events
        )

        user = slack_user_service.get_or_create_user_from_slack_id(
            slack_id=parameters.command.user_id, organisation=organisation
        )

        slack_command_service = SlackCommandService(
            organisation=organisation,
            form_repo=form_repo,
            severity_repo=severity_repo,
            incident_repo=incident_repo,
            user_repo=user_repo,
            slack_user_service=slack_user_service,
            incident_service=incident_service,
            events=events,
        )

        slack_command_service.handle_command(command=parameters.command, user=user)

        self.session.commit()
        events.commit()
