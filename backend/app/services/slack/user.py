from typing import Any

import structlog
from passlib.pwd import genword
from slack_sdk import WebClient

from app.models import MemberRole, Organisation, OrganisationTypes, User
from app.repos import OrganisationRepo, UserRepo
from app.schemas.actions import CreateUserSchema
from app.schemas.resources import CreationResult, Credentials

logger = structlog.get_logger(logger_name=__name__)


class UserIsABotError(Exception):
    pass


class SlackUserService:
    def __init__(self, user_repo: UserRepo, organisation_repo: OrganisationRepo):
        self.user_repo = user_repo
        self.organisation_repo = organisation_repo

    def get_or_create_user_from_slack_id(self, slack_id: str, organisation: Organisation) -> User:
        """Get or create new user from slack user"""
        client = WebClient(token=organisation.slack_bot_token)

        # user already exists
        user = self.user_repo.get_by_slack_user_id(slack_user_id=slack_id)
        if user:
            return user

        # otherwise create a new user
        slack_user_response = client.users_info(user=slack_id)
        slack_user_response.validate()

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
        self.organisation_repo.create_member(user, organisation, role="member")
        logger.info(
            "Created new user from slack information",
            user_id=user.id,
            organisation_id=organisation.id,
        )

        return user

    def get_or_create_user_from_slack_user_credentials_token(self, token: str) -> CreationResult:
        """Used by slack login"""
        user_id_key = "https://slack.com/user_id"
        team_id_key = "https://slack.com/team_id"
        team_name_key = "https://slack.com/team_name"

        client = WebClient(token=token)
        response = client.openid_connect_userInfo()
        if not isinstance(response.data, dict):
            raise ValueError("Response data must be dict")

        email = response.data.get("email")
        slack_user_id = response.data.get(user_id_key)
        name = response.data.get("name", "")

        if not email:
            raise ValueError("Email address not returned in slack response")
        if not slack_user_id:
            raise ValueError("Slack user id not returned in slack response")

        # create user if not exists
        user = self.user_repo.get_by_slack_id_or_email_address(slack_id=slack_user_id, email=email)
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
                name=team_name, slack_team_name=team_name, slack_team_id=team_id, kind=OrganisationTypes.SLACK
            )
            is_new_organisation = True

        # add user to organisation
        self.organisation_repo.add_member_if_not_exists(user=user, organisation=organisation, role=MemberRole.MEMBER)

        return CreationResult(user=user, organisation=organisation, is_new_organisation=is_new_organisation)

    def update_slack_profile_from_app_install_credentials(self, user: User, credentials: Credentials) -> CreationResult:
        """
        1. First user
            - If sign up via slack
                - Existing org's access token set
            - If sign up via email:
                - Existing org updated with slack team details

        2. Second user
            - If sign up via slack
                - Added as member of existing org
            - If sign up via email
                - Added to default org
                - Additional added as a member of existing slack linked organisation
        """
        slack_team_id = credentials.original_data["team"]["id"]
        organisation = self.organisation_repo.get_by_slack_team_id(slack_team_id=slack_team_id)
        new_organisation = False

        if organisation:
            self.organisation_repo.add_member_if_not_exists(
                user=user, organisation=organisation, role=MemberRole.MEMBER
            )
        else:
            organisation = self.organisation_repo.create_organisation(
                name=credentials.original_data["team"]["name"],
                slack_team_id=slack_team_id,
                slack_team_name=credentials.original_data["team"]["name"],
                kind=OrganisationTypes.SLACK,
            )
            new_organisation = True
            self.organisation_repo.create_member(user=user, organisation=organisation, role=MemberRole.MEMBER)

        # set the token for this installation
        organisation.slack_bot_token = credentials.access_token

        # if the user did not originally sign up via slack
        if not user.slack_user_id:
            user.slack_user_id = credentials.original_data["authed_user"]["id"]

        return CreationResult(user=user, organisation=organisation, is_new_organisation=new_organisation)
