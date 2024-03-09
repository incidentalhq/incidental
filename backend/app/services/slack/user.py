from typing import Any

import structlog
from passlib.pwd import genword
from slack_sdk import WebClient

from app.models import Organisation, User
from app.repos import OrganisationRepo, UserRepo
from app.schemas.actions import CreateUserSchema
from app.schemas.resources import CreationResult

logger = structlog.get_logger(logger_name=__name__)


class UserIsABotError(Exception):
    pass


class SlackUserService:
    def __init__(self, token: str, user_repo: UserRepo, organisation_repo: OrganisationRepo):
        self.token = token
        self.client = WebClient(token=token)
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
        logger.info(
            "Created new user from slack information",
            user_id=user.id,
            organisation_id=organisation.id,
        )

        return user

    def get_or_create_user_from_slack_credentials_token(self) -> CreationResult:
        user_id_key = "https://slack.com/user_id"
        team_id_key = "https://slack.com/team_id"
        team_name_key = "https://slack.com/team_name"

        response = self.client.openid_connect_userInfo()
        if not isinstance(response.data, dict):
            raise ValueError("Response data must be dict")

        email = response.data.get("email", "")
        slack_user_id = response.data.get(user_id_key)
        name = response.data.get("name", "")

        # create user if not exists
        user = self.user_repo.get_by_email_address(email)
        if not user:
            user = self.user_repo.create_user(
                create_in=CreateUserSchema(
                    name=name,
                    email_address=email,
                    password=genword(length=16),
                    slack_user_id=slack_user_id,
                    is_email_verified=True,
                )
            )

        # create organisation for them
        team_id = response.data.get(team_id_key, "")
        team_name = response.data.get(team_name_key, "")

        organisation = self.organisation_repo.get_by_slack_team_id(team_id)
        is_new_organisation = True

        if not organisation:
            organisation = self.organisation_repo.create_organisation(
                name=team_name, slack_team_name=team_name, slack_team_id=team_id
            )
            is_new_organisation = True

        # add user to organisation
        member = self.organisation_repo.get_member(user, organisation)
        if not member:
            self.organisation_repo.add_member(user, organisation, role="member")

        return CreationResult(user=user, organisation=organisation, is_new_organisation=is_new_organisation)
