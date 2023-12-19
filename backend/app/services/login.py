import enum
import typing
from dataclasses import dataclass
from datetime import datetime

from app.models import User
from app.repos import UserRepo
from app.services.security import SecurityService


class LoginError(enum.Enum):
    INCORRECT_PASSWORD = enum.auto()
    EXCEEDED_MAX_LOGIN_ATTEMPTS = enum.auto()
    USER_NOT_FOUND = enum.auto()
    NOT_VERIFIED = enum.auto()


@dataclass
class LoginResult:
    success: bool
    user: typing.Optional[User]
    error: typing.Optional[LoginError]


class LoginService:
    def __init__(self, user_repo: UserRepo, security_service: SecurityService):
        self.user_repo = user_repo
        self.security_service = security_service

    def try_login(self, email_address: str, password: str) -> LoginResult:
        """
        Attempts to login a user using email and password
        """
        user = self.user_repo.get_by_email_address(email_address)

        # user not found
        if not user:
            return LoginResult(False, None, LoginError.USER_NOT_FOUND)

        # email address is not verified
        if not user.is_email_verified:
            return LoginResult(False, user, LoginError.NOT_VERIFIED)

        # too many login attempts
        if self.security_service.is_user_account_in_cool_off_period(user):
            return LoginResult(False, user, LoginError.EXCEEDED_MAX_LOGIN_ATTEMPTS)

        # cool off period has expired, so reset login attempts
        self.security_service.reset_cool_off_if_possible(user)

        # successful login
        if user.check_password(password):
            user.last_login_at = datetime.now()
            user.login_attempts = 0
            return LoginResult(True, user, None)

        # password incorrect
        user.last_login_attempt_at = datetime.now()
        user.login_attempts += 1

        return LoginResult(False, user, LoginError.INCORRECT_PASSWORD)
