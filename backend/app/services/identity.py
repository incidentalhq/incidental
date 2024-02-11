"""Identity management services"""

from dataclasses import dataclass

import structlog
from passlib.pwd import genword
from slack_sdk import WebClient
from sqlalchemy.orm import Session

from app.models import Organisation, User
from app.repos import OrganisationRepo, UserRepo
from app.schemas.actions import CreateUserSchema

from .oauth_connector import Credentials

logger = structlog.get_logger(logger_name=__name__)


@dataclass
class CreationResult:
    user: User
    organisation: Organisation
    is_new_organisation: bool


class IdentityService:
    def __init__(self, session: Session, user_repo: UserRepo, organisation_repo: OrganisationRepo):
        self.session = session
        self.user_repo = user_repo
        self.organisation_repo = organisation_repo

    def get_or_create_from_slack_credentials(self, credentials: Credentials) -> CreationResult:
        client = WebClient(token=credentials.access_token)

        user_id_key = "https://slack.com/user_id"
        team_id_key = "https://slack.com/team_id"
        team_name_key = "https://slack.com/team_name"

        response = client.openid_connect_userInfo()
        logger.info("user.info", r=response.data)

        if not isinstance(response.data, dict):
            raise ValueError("Response data must be dict")

        email = response.data.get("email")
        slack_user_id = response.data.get(user_id_key)
        name = response.data.get("name")

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
        team_id = response.data.get(team_id_key)
        team_name = response.data.get(team_name_key)

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

        return CreationResult(user, organisation, is_new_organisation)
