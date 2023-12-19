import re

import structlog
import typer
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from app.db import session_factory
from app.env import settings
from app.repos import OrganisationRepo, UserRepo
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
    if settings.ENV != "development":
        raise Exception("Will only run on development environment")

    session = session_factory()
    organisation_repo = OrganisationRepo(session=session)
    organisation = organisation_repo.get_by_id(organisation_id)
    if not organisation:
        raise typer.BadParameter("Organisation does not exist")

    if not organisation.slack_bot_token:
        raise Exception("Organisation does not have a slack bot token")

    client = WebClient(token=organisation.slack_bot_token)

    prefix_pattern = re.escape(prefix)
    pattern = f"^{prefix_pattern}(.*)"
    response = client.conversations_list(types=["private_channel", "public_channel"], exclude_archived=True)
    channels = response.get("channels") or []
    logger.info("Found channels", total=len(channels))

    for channel in channels:
        if re.match(pattern, channel["name"]):
            if dry_run:
                logger.info(f"I will archive {channel['name']}")
            else:
                try:
                    logger.warning("Archiving channel", name=channel["name"])
                    client.conversations_archive(channel=channel["id"])
                except SlackApiError as e:
                    logger.exception("Problem archiving channel", response=e.response)


if __name__ == "__main__":
    app()
