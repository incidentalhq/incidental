import structlog
from passlib.pwd import genword
from slack_sdk import WebClient

from app.models import Organisation, User
from app.repos import OrganisationRepo, UserRepo
from app.schemas.actions import CreateUserSchema

logger = structlog.get_logger(logger_name=__name__)


class SlackUserService:
    def __init__(
        self, bot_token: str, user_repo: UserRepo, organisation_repo: OrganisationRepo, user_token: str | None = None
    ):
        self.bot_token = bot_token
        self.user_token = user_token
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

        name = slack_user_response.data["user"]["real_name"]
        email_address = slack_user_response.data["user"]["profile"]["email"]
        password = genword(15)

        user = self.user_repo.create_user(
            create_in=CreateUserSchema(
                name=name, email_address=email_address, password=password, slack_user_id=slack_id
            )
        )

        self.organisation_repo.add_member(user, organisation)

        return user
