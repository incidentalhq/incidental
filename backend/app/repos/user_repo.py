import secrets

from sqlalchemy import select

from app.exceptions import ErrorCodes, FormFieldValidationError, ValidationError
from app.models import User
from app.schemas.actions import CreateUserSchema

from .base_repo import BaseRepo


class UserRepo(BaseRepo):
    def get_by_id(self, id: int) -> User | None:
        return self.session.query(User).get(id)

    def get_by_id_or_throw(self, id: int) -> User:
        user = self.session.query(User).get(id)
        if not user:
            raise ValidationError("Could not find user", code=ErrorCodes.MODEL_NOT_FOUND)
        return user

    def get_by_email_address(self, email: str) -> User | None:
        return self.session.query(User).filter(User.email_address == email.lower()).first()

    def get_by_slack_id_or_email_address(self, slack_id: str, email: str) -> User | None:
        """Find by either slack id or email address. Prioritise slack ID"""
        if user := self.get_by_slack_user_id(slack_user_id=slack_id):
            return user
        if user := self.get_by_email_address(email=email):
            return user
        return None

    def get_user_by_auth_token(self, token: str) -> User | None:
        user = self.session.query(User).filter(User.auth_token == token).first()

        return user

    def create_user(self, create_in: CreateUserSchema) -> User:
        user = self.get_by_email_address(create_in.email_address)
        if user:
            raise FormFieldValidationError("Sorry, that email address is already in use", "emailAddress")

        user = User()
        user.name = create_in.name
        user.password = create_in.password
        user.email_address = create_in.email_address.lower()
        user.auth_token = secrets.token_urlsafe(32)
        user.is_email_verified = create_in.is_email_verified
        user.is_active = True

        # slack specific
        user.slack_user_id = create_in.slack_user_id

        self.session.add(user)
        self.session.flush()

        return user

    def get_by_slack_user_id(self, slack_user_id: str) -> User | None:
        query = select(User).where(User.slack_user_id == slack_user_id).limit(1)
        return self.session.scalars(query).first()
