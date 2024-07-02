from sqlalchemy.orm import Session

from app.models import Organisation
from app.repos import AnnouncementRepo, IncidentRepo, OrganisationRepo, UserRepo
from app.services.events import Events
from app.services.incident import IncidentService
from app.services.slack.user import SlackUserService


def create_incident_service(
    session: Session, organisation: Organisation, events: Events | None = None
) -> IncidentService:
    """Create a new incident service"""
    incident_repo = IncidentRepo(session=session)

    if not events:
        events = Events()

    announcement_repo = AnnouncementRepo(session=session)
    incident_service = IncidentService(
        organisation=organisation,
        incident_repo=incident_repo,
        announcement_repo=announcement_repo,
        events=events,
    )

    return incident_service


def create_slack_user_service(session: Session) -> SlackUserService:
    return SlackUserService(user_repo=UserRepo(session=session), organisation_repo=OrganisationRepo(session=session))
