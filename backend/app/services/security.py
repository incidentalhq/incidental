"""Security services"""

from datetime import datetime, timedelta

import structlog
from passlib.totp import TOTP, TokenError
from sqlalchemy.orm import Session

from app.env import settings
from app.exceptions import ErrorCodes, ValidationError
from app.models import User

logger = structlog.get_logger(logger_name=__name__)

# the max times a user is allowed to attempt a login
MAX_LOGIN_ATTEMPTS = 4

COOL_OFF_PERIOD = timedelta(minutes=15)

OTP_CODE_EXPIRE_IN_SECONDS = 120


class SecurityService:
    def __init__(
        self,
        session: Session,
    ):
        self.session = session

    def _get_user_key(self, user: User) -> bytes:
        return f"{settings.APP_SECRET}:{user.id}".encode("utf8")

    def generate_otp_code(self, user: User) -> str:
        """
        Generate an OTP code for a user
        """
        key = self._get_user_key(user)
        generator = TOTP(key=key, period=OTP_CODE_EXPIRE_IN_SECONDS, format="raw")
        token = generator.generate()

        return token.token

    def validate_otp_code(self, user: User, code: str) -> None:
        """Validate the OTP code"""
        key = self._get_user_key(user)
        totp = TOTP(key=key, period=OTP_CODE_EXPIRE_IN_SECONDS, format="raw")

        if self._is_user_account_in_cool_off_period(user):
            raise ValidationError(
                "Max login attempts attempted on account, please wait 15m before trying again",
                ErrorCodes.EXCEEDED_MAX_LOGIN_ATTEMPTS,
            )

        self._reset_cool_off_if_possible(user)

        try:
            totp.match(code)
        except TokenError:
            logger.warning("otp code not correct", user=user)
            user.last_login_attempt_at = datetime.now()
            user.login_attempts += 1

            raise ValidationError("OTP code is incorrect, please try again", ErrorCodes.INCORRECT_CODE)

        user.login_attempts = 0

    def _is_user_account_in_cool_off_period(self, user: User) -> bool:
        """
        Has the user's account reached max attempts, and are we still within the cool off window
        """
        if (
            user.login_attempts >= MAX_LOGIN_ATTEMPTS
            and user.last_login_attempt_at
            and datetime.now() - user.last_login_attempt_at <= COOL_OFF_PERIOD
        ):
            return True
        else:
            return False

    def _reset_cool_off_if_possible(self, user: User) -> bool:
        """
        If max attempts was reached, but we're outside the cool off window, reset the login attempts
        """
        if (
            user.login_attempts >= MAX_LOGIN_ATTEMPTS
            and user.last_login_attempt_at
            and datetime.now() - user.last_login_attempt_at > COOL_OFF_PERIOD
        ):
            user.login_attempts = 0
            return True
        else:
            return False
