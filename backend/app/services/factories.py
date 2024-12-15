from sqlalchemy.orm import Session

from app.models import Organisation
from app.repos import (
    AnnouncementRepo,
    FieldRepo,
    FormRepo,
    IncidentRepo,
    InviteRepo,
    LifecycleRepo,
    OrganisationRepo,
    SeverityRepo,
    TimestampRepo,
    UserRepo,
)
from app.services.events import Events
from app.services.incident import IncidentService
from app.services.onboarding import OnboardingService
from app.services.slack.user import SlackUserService


def create_incident_service(
    session: Session, organisation: Organisation, events: Events | None = None
) -> IncidentService:
    """Create a new incident service"""
    incident_repo = IncidentRepo(session=session)
    form_repo = FormRepo(session=session)

    if not events:
        events = Events()

    announcement_repo = AnnouncementRepo(session=session)
    incident_service = IncidentService(
        organisation=organisation,
        incident_repo=incident_repo,
        announcement_repo=announcement_repo,
        events=events,
        form_repo=form_repo,
    )

    return incident_service


def create_slack_user_service(session: Session) -> SlackUserService:
    user_repo = UserRepo(session=session)
    organisation_repo = OrganisationRepo(session=session)
    invite_repo = InviteRepo(session=session)

    slack_user_service = SlackUserService(
        user_repo=user_repo,
        organisation_repo=organisation_repo,
        invite_repo=invite_repo,
    )
    return slack_user_service


def create_onboarding_service(session: Session) -> OnboardingService:
    form_repo = FormRepo(session=session)
    severity_repo = SeverityRepo(session=session)
    incident_repo = IncidentRepo(session=session)
    announcement_repo = AnnouncementRepo(session=session)
    timestamp_repo = TimestampRepo(session=session)
    field_repo = FieldRepo(session=session)
    lifecycle_repo = LifecycleRepo(session=session)

    onboarding_service = OnboardingService(
        form_repo=form_repo,
        severity_repo=severity_repo,
        incident_repo=incident_repo,
        announcement_repo=announcement_repo,
        timestamp_repo=timestamp_repo,
        field_repo=field_repo,
        lifecycle_repo=lifecycle_repo,
    )

    return onboarding_service
