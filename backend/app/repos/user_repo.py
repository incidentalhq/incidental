import secrets
import typing

from sqlalchemy.orm import Session

from app.exceptions import ErrorCodes, FormFieldValidationError, ValidationError
from app.models import User
from app.schemas.actions import CreateUserSchema


class UserRepo:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, id: int) -> User | None:
        return self.session.query(User).get(id)

    def get_by_id_or_throw(self, id: int) -> User:
        user = self.session.query(User).get(id)
        if not user:
            raise ValidationError(
                "Could not find user", code=ErrorCodes.MODEL_NOT_FOUND
            )
        return user

    def get_by_email_address(self, email: str) -> typing.Optional[User]:
        return (
            self.session.query(User).filter(User.email_address == email.lower()).first()
        )

    def get_user_by_auth_token(self, token: str) -> User:
        user = self.session.query(User).filter(User.auth_token == token).first()

        return user

    def create_user(self, data: CreateUserSchema) -> User:
        user = self.get_by_email_address(data.email_address)

        if user:
            raise FormFieldValidationError(
                "Sorry, that email address is already in use", "emailAddress"
            )

        user = User()
        user.name = data.name
        user.password = data.password
        user.email_address = data.email_address.lower()
        user.auth_token = secrets.token_urlsafe(32)
        user.is_email_verified = False
        user.is_active = True

        self.session.add(user)
        self.session.flush()

        return user
