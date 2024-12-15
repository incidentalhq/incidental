import structlog
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import CurrentUser, EventsService
from app.env import settings
from app.repos import FormRepo, IncidentRepo, OrganisationRepo, SeverityRepo, UserRepo
from app.schemas.actions import OAuth2AuthorizationResultSchema
from app.schemas.models import OrganisationSchema, UserSchema
from app.schemas.slack import (
    SlackCommandDataSchema,
    SlackEventCallbackSchema,
    SlackEventSchema,
    SlackInteractionSchema,
    SlackUrlVerificationHandshakeSchema,
)
from app.schemas.tasks import HandleSlashCommandTaskParameters
from app.services.factories import create_incident_service, create_onboarding_service, create_slack_user_service
from app.services.oauth_connector import OAuthConnectorService
from app.services.slack.events import SlackEventsService
from app.services.slack.interaction import SlackInteractionService

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Slack"])
bot_scopes = [
    "bookmarks:read",
    "bookmarks:write",
    "channels:join",
    "channels:manage",
    "channels:read",
    "chat:write",
    "commands",
    "files:read",
    "groups:read",
    "groups:write",
    "im:read",
    "pins:read",
    "pins:write",
    "team:read",
    "users.profile:read",
    "users:read",
    "users:read.email",
]


def _create_openid_connector() -> OAuthConnectorService:
    connector = OAuthConnectorService(
        authorize_url=settings.SLACK_OPENID_AUTHORIZE_URL,
        token_url=settings.SLACK_OPENID_TOKEN_URL,
        client_id=settings.SLACK_CLIENT_ID,
        client_secret=settings.SLACK_CLIENT_SECRET,
        redirect_uri=f"{settings.FRONTEND_URL}/oauth/complete",
    )
    return connector


def _create_oauth_connector() -> OAuthConnectorService:
    connector = OAuthConnectorService(
        authorize_url=settings.SLACK_OAUTH_AUTHORIZE_URL,
        token_url=settings.SLACK_OAUTH_TOKEN_URL,
        client_id=settings.SLACK_CLIENT_ID,
        client_secret=settings.SLACK_CLIENT_SECRET,
        redirect_uri=f"{settings.FRONTEND_URL}/slack/install/complete",
    )
    return connector


@router.get("/openid/login")
async def slack_openid_login():
    """Login with slack oauth2"""
    connector = _create_openid_connector()
    url = connector.create_authorization_url(scopes=["profile", "openid", "email"])

    return {"url": url}


@router.get("/oauth/install")
async def slack_install_bot():
    """Install the slack app"""
    connector = _create_oauth_connector()
    url = connector.create_authorization_url(scopes=bot_scopes)

    return {"url": url}


@router.post("/openid/complete", response_model=UserSchema)
async def slack_openid_complete(result: OAuth2AuthorizationResultSchema, session: Session = Depends(get_db)):
    """Complete sign-in using slack"""
    connector = _create_openid_connector()
    credentials = connector.complete(code=result.code)

    slack_user_service = create_slack_user_service(session=session)
    create_result = slack_user_service.complete_slack_login(token=credentials.access_token)

    onboarding_service = create_onboarding_service(session=session)
    if create_result.is_new_organisation:
        onboarding_service.setup_organisation(organisation=create_result.organisation)

    session.commit()

    return create_result.user


@router.post("/oauth/complete", response_model=OrganisationSchema)
async def slack_oauth_complete(
    result: OAuth2AuthorizationResultSchema, user: CurrentUser, session: Session = Depends(get_db)
):
    """Complete installation of slack app."""
    connector = _create_oauth_connector()
    token = connector.complete(code=result.code)

    onboarding_service = create_onboarding_service(session=session)
    slack_user_service = create_slack_user_service(session=session)
    creation_result = slack_user_service.complete_slack_app_install(user=user, credentials=token)

    if creation_result.is_new_organisation:
        onboarding_service.setup_organisation(organisation=creation_result.organisation)

    session.commit()

    return creation_result.organisation


@router.post("/events")
async def slack_events(slack_event: SlackEventSchema, session: Session = Depends(get_db)):
    """This handles events from slack, which are things like user joining a channel, message sent to channel, etc.."""

    # initial verification for this endpoint
    if isinstance(slack_event, SlackUrlVerificationHandshakeSchema):
        return {"challenge": slack_event.challenge}

    # otherwise handle events from slack
    elif isinstance(slack_event, SlackEventCallbackSchema):
        organisation_repo = OrganisationRepo(session=session)
        user_repo = UserRepo(session=session)
        incident_repo = IncidentRepo(session=session)

        organisation = organisation_repo.get_by_slack_team_id(slack_team_id=slack_event.team_id)
        if not organisation:
            logger.warning("Organisation not found", slack_team_id=slack_event.team_id)
            return

        slack_user_service = create_slack_user_service(session=session)

        slack_events_service = SlackEventsService(
            organisation=organisation,
            organisation_repo=organisation_repo,
            user_repo=user_repo,
            slack_user_service=slack_user_service,
            incident_repo=incident_repo,
        )

        if not slack_events_service.verify_token(slack_event.token):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token is invalid")

        slack_events_service.handle_event(slack_event)

    return Response(status_code=status.HTTP_202_ACCEPTED)


@router.post("/slash-command")
async def slack_slash_command(
    events: EventsService,
    command: SlackCommandDataSchema = Depends(SlackCommandDataSchema.as_form),
    session: Session = Depends(get_db),
):
    """Main endpoint to handle slack slash command /inc and /incident"""
    events.queue_job(HandleSlashCommandTaskParameters(command=command))
    return Response(status_code=status.HTTP_200_OK)


@router.post("/interaction")
def slack_interaction(
    events: EventsService,
    session: Session = Depends(get_db),
    interaction: SlackInteractionSchema = Depends(SlackInteractionSchema.as_form),
):
    """This handles user interaction with UI elements created within Slack"""
    organisation_repo = OrganisationRepo(session=session)
    form_repo = FormRepo(session=session)
    incident_repo = IncidentRepo(session=session)
    severity_repo = SeverityRepo(session=session)

    organisation = organisation_repo.get_by_slack_team_id(interaction.payload["team"]["id"])
    if not organisation:
        logger.error("Unhandled interaction event for team", team_id=interaction.payload["team"]["id"])
        return Response(status_code=status.HTTP_200_OK)

    incident_service = create_incident_service(session=session, organisation=organisation, events=events)
    slack_user_service = create_slack_user_service(session=session)
    user = slack_user_service.get_or_create_user_from_slack_id(
        slack_id=interaction.payload["user"]["id"], organisation=organisation
    )

    slack_interaction_service = SlackInteractionService(
        form_repo=form_repo,
        incident_repo=incident_repo,
        slack_user_service=slack_user_service,
        incident_service=incident_service,
        severity_repo=severity_repo,
    )

    slack_interaction_service.handle_interaction(interaction=interaction, organisation=organisation, user=user)
    session.commit()

    return Response(status_code=status.HTTP_200_OK)
