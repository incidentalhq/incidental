import re

import structlog
import typer
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from app.db import session_factory
from app.env import settings
from app.repos import OrganisationRepo, UserRepo
from app.services.factories import create_onboarding_service
from app.utils import setup_logger

setup_logger()

app = typer.Typer(no_args_is_help=True)
logger = structlog.get_logger(logger_name=__name__)


@app.command(help="Set password for user")
def set_password(email: str, password: str):
    db = session_factory()
    user_repo = UserRepo(db)

    user = user_repo.get_by_email_address(email)
    if not user:
        logger.error("Could not find user")
        return

    user.password = password
    db.commit()

    logger.info("Password updated")


@app.command(help="Archive all incident channels for an organisation")
def archive_org_channels(organisation_id: str, prefix: str = "inc-", dry_run: bool = True):
    """Use this during testing to archive old slack channels"""
    if settings.ENV != "development":
        raise Exception("Will only run on development environment")

    if dry_run:
        logger.info("Dry run mode")

    session = session_factory()
    organisation_repo = OrganisationRepo(session=session)
    organisation = organisation_repo.get_by_id(organisation_id)
    if not organisation:
        raise typer.BadParameter("Organisation does not exist")

    if not organisation.slack_bot_token:
        raise Exception("Organisation does not have a slack bot token")

    client = WebClient(token=organisation.slack_bot_token)
    auth_response = client.auth_test()
    logger.info("Associated slack workspace", name=auth_response.get("team"))

    prefix_pattern = re.escape(prefix)
    pattern = f"^{prefix_pattern}(.*)"
    response_list = client.conversations_list(
        types=["private_channel", "public_channel"], exclude_archived=True, limit=100
    )

    for response in response_list:
        channels = response.get("channels") or []
        logger.info("Found channels", total=len(channels))

        for channel in channels:
            if re.match(pattern, channel["name"]):
                if dry_run:
                    logger.info(f"I will archive {channel['name']}")
                else:
                    try:
                        logger.warning("Archiving channel", name=channel["name"])
                        client.conversations_join(channel=channel["id"])
                        client.conversations_archive(channel=channel["id"])
                    except SlackApiError as e:
                        logger.exception("Problem archiving channel", response=e.response)


@app.command()
def onboard(organisation_id: str):
    """Run the onboarding service for an organisation"""
    session = session_factory()
    organisation_repo = OrganisationRepo(session=session)
    organisation = organisation_repo.get_by_id_or_raise(id=organisation_id)

    onboarding_service = create_onboarding_service(session=session)
    onboarding_service.setup_organisation(organisation=organisation)

    session.commit()


if __name__ == "__main__":
    app()
