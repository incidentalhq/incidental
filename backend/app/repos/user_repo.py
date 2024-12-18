import secrets
from typing import Sequence

from sqlalchemy import select

from app.exceptions import FormFieldValidationError
from app.models import Organisation, OrganisationMember, User
from app.schemas.actions import CreateUserSchema, CreateUserViaSlackSchema

from .base_repo import BaseRepo


class UserRepo(BaseRepo):
    def get_by_id(self, id: str) -> User | None:
        stmt = select(User).where(User.id == id).limit(1)
        return self.session.scalar(stmt)

    def get_by_id_or_raise(self, id: str) -> User:
        stmt = select(User).where(User.id == id).limit(1)
        return self.session.scalars(stmt).one()

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

    def create_user(self, create_in: CreateUserSchema | CreateUserViaSlackSchema) -> User:
        user = self.get_by_email_address(create_in.email_address)
        if user:
            raise FormFieldValidationError("Sorry, that email address is already in use", "emailAddress")

        user = User()
        user.name = create_in.name
        user.password = create_in.password
        user.email_address = create_in.email_address.lower()
        user.auth_token = secrets.token_urlsafe(32)
        user.is_active = True

        if isinstance(create_in, CreateUserViaSlackSchema):
            user.is_email_verified = create_in.is_email_verified

        # slack specific
        user.slack_user_id = create_in.slack_user_id

        self.session.add(user)
        self.session.flush()

        return user

    def get_by_slack_user_id(self, slack_user_id: str) -> User | None:
        query = select(User).where(User.slack_user_id == slack_user_id).limit(1)
        return self.session.scalars(query).first()

    def get_all_organisation_members(self, organisation: Organisation) -> Sequence[OrganisationMember]:
        """Get all members of an organisation"""
        stmt = (
            select(OrganisationMember)
            .join(User)
            .where(OrganisationMember.organisation_id == organisation.id, User.is_active.is_(True))
        )

        return self.session.scalars(stmt).all()

    def get_organisation_member_by_email_address(
        self, organisation: Organisation, email_address: str
    ) -> OrganisationMember | None:
        """Get a member of an organisation by email address"""
        stmt = (
            select(OrganisationMember)
            .join(User)
            .where(
                OrganisationMember.organisation_id == organisation.id,
                User.is_active.is_(True),
                User.is_email_verified.is_(True),
                User.email_address == email_address.lower(),
            )
        )

        return self.session.scalar(stmt)
