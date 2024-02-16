import structlog

from app.env import settings
from app.models import Organisation
from app.repos import IncidentRepo, OrganisationRepo, UserRepo
from app.schemas.slack import SlackEventCallbackSchema
from app.schemas.slack_events import CatchAllEventType, MemberJoinedChannelEvenType

from .user import SlackUserService, UserIsABotError

logger = structlog.get_logger(logger_name=__name__)


class SlackEventsService:

    def __init__(
        self,
        organisation: Organisation,
        organisation_repo: OrganisationRepo,
        user_repo: UserRepo,
        slack_user_service: SlackUserService,
        incident_repo: IncidentRepo,
    ) -> None:
        self.organisation = organisation
        self.organisation_repo = organisation_repo
        self.user_repo = user_repo
        self.slack_user_service = slack_user_service
        self.incident_repo = incident_repo

    def verify_token(self, token: str) -> bool:
        if settings.SLACK_VERIFICATION_TOKEN == token:
            return True
        else:
            return False

    def handle_event(self, event: SlackEventCallbackSchema):
        logger.info("handling slack event", slack_event=event)

        organisation = self.organisation_repo.get_by_slack_team_id(slack_team_id=event.team_id)
        if not organisation:
            logger.warning("Unable to find slack team", team_id=event.team_id)
            return

        if isinstance(event.event, MemberJoinedChannelEvenType):
            self.handle_member_join(event.event)
        elif isinstance(event.event, CatchAllEventType):
            self.handle_catch_all(event.event)

    def handle_member_join(self, event_type: MemberJoinedChannelEvenType):
        try:
            user = self.slack_user_service.get_or_create_user_from_slack_id(
                slack_id=event_type.user, organisation=self.organisation
            )
        except UserIsABotError:
            logger.info("User is a bot; ignoring")
            return

        incident = self.incident_repo.get_incident_by_slack_channel_id(event_type.channel)
        if not incident:
            return

        logger.info("member joined an incident channel", u=user, incident=incident)

    def handle_catch_all(self, event_type: CatchAllEventType):
        """Catch all event"""
        logger.info("Fallback event detected", e=event_type)
