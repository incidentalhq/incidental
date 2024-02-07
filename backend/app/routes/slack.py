import structlog
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.env import settings
from app.exceptions import ApplicationException
from app.repos import (
    AnnouncementRepo,
    FormRepo,
    IncidentRepo,
    OrganisationRepo,
    SeverityRepo,
    UserRepo,
)
from app.schemas.actions import OAuth2AuthorizationResultSchema, SlackEventsSchema
from app.schemas.models import UserSchema
from app.schemas.slack import SlackCommandDataSchema, SlackInteractionSchema
from app.services.identity import IdentityService
from app.services.incident import IncidentService
from app.services.oauth_connector import OAuthConnectorService
from app.services.onboarding import OnboardingService
from app.services.slack.command import SlackCommandService
from app.services.slack.interaction import SlackInteractionService
from app.services.slack.user import SlackUserService

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Slack"])
bot_scopes = [
    "app_mentions:read",
    "bookmarks:read",
    "channels:read",
    "chat:write",
    "chat:write.public",
    "commands",
    "files:read",
    "groups:read",
    "groups:write",
    "im:read",
    "pins:read",
    "reactions:read",
    "team:read",
    "usergroups:read",
    "users.profile:read",
    "users:read",
    "users:read.email",
    "channels:join",
    "channels:manage",
]


def _create_openid_connector() -> OAuthConnectorService:
    connector = OAuthConnectorService(
        authorize_url=settings.SLACK_OPENID_AUTHORIZE_URL,
        token_url=settings.SLACK_OPENID_TOKEN_URL,
        client_id=settings.SLACK_CLIENT_ID,
        client_secret=settings.SLACK_CLIENT_SECRET,
    )
    return connector


def _create_oauth_connector() -> OAuthConnectorService:
    connector = OAuthConnectorService(
        authorize_url=settings.SLACK_OAUTH_AUTHORIZE_URL,
        token_url=settings.SLACK_OAUTH_TOKEN_URL,
        client_id=settings.SLACK_CLIENT_ID,
        client_secret=settings.SLACK_CLIENT_SECRET,
    )
    return connector


@router.get("/openid/login")
async def slack_openid_login():
    connector = _create_openid_connector()
    url = connector.create_authorization_url(scopes=["profile", "openid", "email"], state={"mode": "login"})

    return {url}


@router.get("/oauth/install")
async def slack_install_bot():
    """Install the slack"""
    connector = _create_oauth_connector()
    url = connector.create_authorization_url(scopes=bot_scopes, state={"mode": "installation"})

    return {url}


@router.post("/openid/complete", response_model=UserSchema)
async def slack_openid_complete(result: OAuth2AuthorizationResultSchema, session: Session = Depends(get_db)):
    connector = _create_openid_connector()
    token = connector.complete(code=result.code)

    user_repo = UserRepo(session=session)
    organisation_repo = OrganisationRepo(session=session)
    form_repo = FormRepo(session=session)
    severity_repo = SeverityRepo(session=session)
    incident_repo = IncidentRepo(session=session)
    announcement_repo = AnnouncementRepo(session=session)

    identity_service = IdentityService(session=session, user_repo=user_repo, organisation_repo=organisation_repo)
    create_result = identity_service.get_or_create_from_slack_credentials(credentials=token)

    onboarding_service = OnboardingService(
        form_repo=form_repo,
        severity_repo=severity_repo,
        incident_repo=incident_repo,
        announcement_repo=announcement_repo,
    )
    if create_result.is_new_organisation:
        onboarding_service.setup_organisation(organisation=create_result.organisation)

    session.commit()

    return create_result.user


@router.post("/oauth/complete")
async def slack_oauth_complete(result: OAuth2AuthorizationResultSchema, session: Session = Depends(get_db)):
    connector = _create_oauth_connector()
    token = connector.complete(code=result.code)
    logger.info("token", token=token)

    organisation_repo = OrganisationRepo(session=session)
    organisation = organisation_repo.get_by_slack_team_id(token.original_data["team"]["id"])
    if not organisation:
        raise ApplicationException("Could not find associated organization")

    organisation.slack_bot_token = token.access_token

    session.commit()

    return "ok"


@router.post("/events")
async def slack_events(slack_event: SlackEventsSchema):
    logger.info("request", body=slack_event)

    return {"challenge": slack_event.challenge}


@router.post("/slash/inc")
async def slack_slash_inc(
    command: SlackCommandDataSchema = Depends(SlackCommandDataSchema.as_form), session: Session = Depends(get_db)
):
    logger.info("slash command", cmd=command)

    user_repo = UserRepo(session=session)
    organisation_repo = OrganisationRepo(session=session)
    form_repo = FormRepo(session=session)
    severity_repo = SeverityRepo(session=session)
    incident_repo = IncidentRepo(session=session)

    organisation = organisation_repo.get_by_slack_team_id(command.team_id)
    if not organisation:
        raise ApplicationException("Could not find related organisation")

    user = user_repo.get_by_slack_user_id(command.user_id)
    if not user:
        # create a new user
        pass

    slack_command_service = SlackCommandService(
        organisation=organisation, form_repo=form_repo, severity_repo=severity_repo, incident_repo=incident_repo
    )

    try:
        slack_command_service.handle_command(command=command)
    except Exception:
        logger.exception("There was an error sending slack message")

    return Response(status_code=status.HTTP_200_OK)


@router.post("/interaction")
def slack_interaction(
    session: Session = Depends(get_db), interaction: SlackInteractionSchema = Depends(SlackInteractionSchema.as_form)
):
    logger.info("Received interaction", payload=interaction.payload)

    organisation_repo = OrganisationRepo(session=session)
    form_repo = FormRepo(session=session)
    incident_repo = IncidentRepo(session=session)
    user_repo = UserRepo(session=session)
    announcement_repo = AnnouncementRepo(session=session)

    organisation = organisation_repo.get_by_slack_team_id(interaction.payload["team"]["id"])
    if not organisation:
        logger.error("Unhandled interaction event for team", team_id=interaction.payload["team"]["id"])
        return Response(status_code=status.HTTP_200_OK)

    incident_service = IncidentService(
        organisation=organisation, incident_repo=incident_repo, announcement_repo=announcement_repo
    )
    slack_user_service = SlackUserService(
        bot_token=organisation.slack_bot_token, user_repo=user_repo, organisation_repo=organisation_repo
    )
    slack_interaction_service = SlackInteractionService(
        form_repo=form_repo,
        incident_repo=incident_repo,
        slack_user_service=slack_user_service,
        incident_service=incident_service,
    )
    slack_interaction_service.handle_interaction(interaction=interaction, organisation=organisation)

    session.commit()

    return Response(status_code=status.HTTP_200_OK)
