import secrets
from dataclasses import dataclass

from faker import Faker
from sqlalchemy.orm import Session

from app.db import session_factory
from app.models import MemberRole, Organisation, User
from app.repos import OrganisationRepo, UserRepo
from app.schemas.actions import CreateUserSchema

test_db: Session = session_factory()


def make_identifier(prefix: str) -> str:
    id = secrets.token_urlsafe(10)
    return f"{prefix}_{id}"


@dataclass
class MakeUserResult:
    user: User
    password: str


def make_user(
    is_email_verified: bool = True,
    is_super_admin: bool = False,
    organisation: Organisation | None = None,
) -> MakeUserResult:
    user_ident = make_identifier("user")
    user_repo = UserRepo(test_db)
    organisation_repo = OrganisationRepo(test_db)
    faker = Faker()
    password = faker.pystr()

    user = user_repo.create_user(
        CreateUserSchema(
            name=f"TestUser {user_ident}",
            email_address=f"{user_ident}@test.com",
            password=password,
        )
    )
    user.is_email_verified = is_email_verified
    user.is_super_admin = is_super_admin

    if organisation:
        organisation_repo.add_member_if_not_exists(user=user, organisation=organisation, role=MemberRole.MEMBER)

    test_db.commit()

    return MakeUserResult(user=user, password=password)


def make_organisation() -> Organisation:
    repo = OrganisationRepo(test_db)
    id = make_identifier("organisation")
    organisation = repo.create_organisation(name=id)
    test_db.commit()

    return organisation
