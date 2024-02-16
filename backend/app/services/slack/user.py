from typing import Any

import structlog
from passlib.pwd import genword
from slack_sdk import WebClient

from app.models import Organisation, User
from app.repos import OrganisationRepo, UserRepo
from app.schemas.actions import CreateUserSchema

logger = structlog.get_logger(logger_name=__name__)


class UserIsABotError(Exception):
    pass


class SlackUserService:
    def __init__(self, bot_token: str, user_repo: UserRepo, organisation_repo: OrganisationRepo):
        self.bot_token = bot_token
        self.client = WebClient(token=bot_token)
        self.user_repo = user_repo
        self.organisation_repo = organisation_repo

    def get_or_create_user_from_slack_id(self, slack_id: str, organisation: Organisation) -> User:
        """Get or create new user from slack user"""

        # user already exists
        user = self.user_repo.get_by_slack_user_id(slack_user_id=slack_id)
        if user:
            return user

        # otherwise create a new user
        slack_user_response = self.client.users_info(user=slack_id)
        slack_user_response.validate()
        logger.info("slack user", u=slack_user_response.data)

        user_data = slack_user_response.get("user", dict[str, Any]())

        # is bot user
        is_bot = user_data.get("is_bot", False)
        if is_bot:
            raise UserIsABotError()

        name = user_data["real_name"]
        email_address = user_data["profile"]["email"]
        password = genword(length=14)

        user = self.user_repo.create_user(
            create_in=CreateUserSchema(
                name=name,
                email_address=email_address,
                password=password,
                slack_user_id=slack_id,
            )
        )
        self.organisation_repo.add_member(user, organisation, role="member")
        logger.info("Created new user from slack information", user_id=user.id, organisation_id=organisation.id)

        return user
