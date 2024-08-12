from typing import Any

import structlog
from slack_sdk import WebClient

from app.models import MemberRole, Organisation, OrganisationTypes, User
from app.repos import OrganisationRepo, UserRepo
from app.schemas.actions import CreateUserViaSlackSchema
from app.schemas.resources import CreationResult, Credentials, OrganisationCreationResult
from app.utils import generate_password

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
        password = generate_password()

        user = self.user_repo.create_user(
            create_in=CreateUserViaSlackSchema(
                name=name,
                email_address=email_address,
                password=password,
                slack_user_id=slack_id,
            )
        )
        self.organisation_repo.add_member_if_not_exists(user=user, organisation=organisation, role=MemberRole.MEMBER)
        logger.info(
            "Created new user from slack information",
            user_id=user.id,
            organisation_id=organisation.id,
        )

        return user

    def complete_slack_login(self, token: str) -> CreationResult:
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
                create_in=CreateUserViaSlackSchema(
                    name=name,
                    email_address=email,
                    password=generate_password(),
                    slack_user_id=slack_user_id,
                    is_email_verified=True,
                )
            )
        else:
            if not user.is_email_verified:
                user.is_email_verified = True

        team_id = response.data.get(team_id_key, "")
        team_name = response.data.get(team_name_key, "")

        join_result = self._handle_join_slack_organisation(user=user, team_id=team_id, team_name=team_name)

        return CreationResult(
            user=user, organisation=join_result.organisation, is_new_organisation=join_result.is_new_organisation
        )

    def complete_slack_app_install(self, user: User, credentials: Credentials) -> CreationResult:
        """When user installs the Slack app"""
        slack_team_id = credentials.original_data["team"]["id"]
        team_name = credentials.original_data["team"]["name"]

        join_result = self._handle_join_slack_organisation(user=user, team_id=slack_team_id, team_name=team_name)

        # set the token for this installation
        join_result.organisation.slack_bot_token = credentials.access_token

        # if the user did not originally sign up via slack
        if not user.slack_user_id:
            user.slack_user_id = credentials.original_data["authed_user"]["id"]

        return CreationResult(
            user=user, organisation=join_result.organisation, is_new_organisation=join_result.is_new_organisation
        )

    def _handle_join_slack_organisation(self, user: User, team_id: str, team_name: str) -> OrganisationCreationResult:
        """
        Figure out whether to:
            - add user to existing slack organisation if it exists
            - update user's 'default' organisation to a slack organisation
            - create a new slack organisation
        """
        organisation = self.organisation_repo.get_by_slack_team_id(team_id)

        # If slack organisation exists, add user as a member
        if organisation:
            self.organisation_repo.add_member_if_not_exists(
                user=user, organisation=organisation, role=MemberRole.MEMBER
            )
            return OrganisationCreationResult(organisation=organisation, is_new_organisation=False)

        # if user is in a default organisation, update that to a slack connected organisation
        for user_organisation in user.organisations:
            if user_organisation.kind == OrganisationTypes.DEFAULT:
                user_organisation.name = team_name
                user_organisation.slack_team_name = team_name
                user_organisation.slack_team_id = team_id
                user_organisation.kind = OrganisationTypes.SLACK
                self.organisation_repo.session.flush()

                return OrganisationCreationResult(organisation=user_organisation, is_new_organisation=False)

        # otherwise create a new organisation
        organisation = self.organisation_repo.create_organisation(
            name=team_name, slack_team_name=team_name, slack_team_id=team_id, kind=OrganisationTypes.SLACK
        )
        self.organisation_repo.add_member_if_not_exists(user=user, organisation=organisation, role=MemberRole.MEMBER)

        return OrganisationCreationResult(organisation=organisation, is_new_organisation=True)
