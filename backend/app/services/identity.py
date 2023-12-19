"""Identity management services"""


import structlog
from passlib.totp import TOTP
from sqlalchemy.orm import Session

from app.models import User
from app.repos import UserRepo
from app.schemas.actions import CreateUserSchema

logger = structlog.get_logger(logger_name=__name__)


class IdentityService:
    def __init__(
        self,
        session: Session,
        user_repo: UserRepo,
    ):
        self.session = session
        self.user_repo = user_repo

    def create_account(self, item: CreateUserSchema) -> User:
        """
        Create a new user account
        """
        return self.create_admin_account(item)

    def create_admin_account(self, item: CreateUserSchema) -> User:
        """
        Create an owner account
        """
        user = self.user_repo.create_user(item)

        return user

    def generate_opt_code(self, user: User) -> str:
        """
        Generate an OTP code for a user
        """
        generator = TOTP(user.private_key, period=60)
        token = generator.generate()

        return token.token
