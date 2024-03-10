import structlog
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import CurrentUser
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
from app.schemas.actions import OAuth2AuthorizationResultSchema
from app.schemas.models import UserSchema
from app.schemas.slack import (
    SlackCommandDataSchema,
    SlackEventCallbackSchema,
    SlackEventSchema,
    SlackInteractionSchema,
    SlackUrlVerificationHandshakeSchema,
)
from app.services.incident import IncidentService
from app.services.oauth_connector import OAuthConnectorService
from app.services.onboarding import OnboardingService
from app.services.slack.command import SlackCommandService
from app.services.slack.events import SlackEventsService
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
    token = connector.complete(code=result.code)

    user_repo = UserRepo(session=session)
    organisation_repo = OrganisationRepo(session=session)
    form_repo = FormRepo(session=session)
    severity_repo = SeverityRepo(session=session)
    incident_repo = IncidentRepo(session=session)
    announcement_repo = AnnouncementRepo(session=session)

    slack_user_service = SlackUserService(
        token=token.access_token, user_repo=user_repo, organisation_repo=organisation_repo
    )
    create_result = slack_user_service.get_or_create_user_from_slack_credentials_token()

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
async def slack_oauth_complete(
    result: OAuth2AuthorizationResultSchema, user: CurrentUser, session: Session = Depends(get_db)
):
    """Complete installation of slack app"""
    connector = _create_oauth_connector()
    token = connector.complete(code=result.code)

    organisation_repo = OrganisationRepo(session=session)
    organisation = organisation_repo.get_by_slack_team_id(token.original_data["team"]["id"])
    if organisation:
        organisation.slack_bot_token = token.access_token
        session.commit()
        return Response(status_code=status.HTTP_202_ACCEPTED)

    # otherwise, we might have signed up with user + password
    organisation = user.organisations[0]
    organisation.slack_bot_token = token.access_token

    session.commit()

    return Response(status_code=status.HTTP_202_ACCEPTED)


@router.post("/events")
async def slack_events(slack_event: SlackEventSchema, session: Session = Depends(get_db)):
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

        slack_user_service = SlackUserService(
            token=organisation.slack_bot_token,
            user_repo=user_repo,
            organisation_repo=organisation_repo,
        )

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
    background_tasks: BackgroundTasks,
    command: SlackCommandDataSchema = Depends(SlackCommandDataSchema.as_form),
    session: Session = Depends(get_db),
):
    """Main endpoint to handle slack slash command /inc and /incident"""
    user_repo = UserRepo(session=session)
    organisation_repo = OrganisationRepo(session=session)
    form_repo = FormRepo(session=session)
    severity_repo = SeverityRepo(session=session)
    incident_repo = IncidentRepo(session=session)
    user_repo = UserRepo(session=session)
    announcement_repo = AnnouncementRepo(session=session)

    organisation = organisation_repo.get_by_slack_team_id(command.team_id)
    if not organisation:
        raise ApplicationException("Could not find related organisation")

    slack_user_service = SlackUserService(
        token=organisation.slack_bot_token,
        user_repo=user_repo,
        organisation_repo=organisation_repo,
    )
    incident_service = IncidentService(
        organisation=organisation, incident_repo=incident_repo, announcement_repo=announcement_repo
    )

    user = slack_user_service.get_or_create_user_from_slack_id(slack_id=command.user_id, organisation=organisation)

    slack_command_service = SlackCommandService(
        organisation=organisation,
        form_repo=form_repo,
        severity_repo=severity_repo,
        incident_repo=incident_repo,
        user_repo=user_repo,
        slack_user_service=slack_user_service,
        incident_service=incident_service,
    )

    try:
        # TODO: use celery to run async jobs
        def task(session: Session):
            slack_command_service.handle_command(command=command, user=user)
            session.commit()

        background_tasks.add_task(task, session)

    except Exception:
        logger.exception("There was an error sending slack message")

    return Response(status_code=status.HTTP_200_OK)


@router.post("/interaction")
def slack_interaction(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_db),
    interaction: SlackInteractionSchema = Depends(SlackInteractionSchema.as_form),
):
    organisation_repo = OrganisationRepo(session=session)
    form_repo = FormRepo(session=session)
    incident_repo = IncidentRepo(session=session)
    user_repo = UserRepo(session=session)
    announcement_repo = AnnouncementRepo(session=session)
    severity_repo = SeverityRepo(session=session)

    organisation = organisation_repo.get_by_slack_team_id(interaction.payload["team"]["id"])
    if not organisation:
        logger.error("Unhandled interaction event for team", team_id=interaction.payload["team"]["id"])
        return Response(status_code=status.HTTP_200_OK)

    incident_service = IncidentService(
        organisation=organisation, incident_repo=incident_repo, announcement_repo=announcement_repo
    )
    slack_user_service = SlackUserService(
        token=organisation.slack_bot_token,
        user_repo=user_repo,
        organisation_repo=organisation_repo,
    )
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

    # TODO: use celery to run async jobs
    def task():
        slack_interaction_service.handle_interaction(interaction=interaction, organisation=organisation, user=user)
        session.commit()

    background_tasks.add_task(task)

    return Response(status_code=status.HTTP_200_OK)
