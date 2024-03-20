"""Identity management services"""


import structlog

from app.models import MemberRole, User
from app.repos import OrganisationRepo, UserRepo
from app.schemas.actions import CreateUserSchema

logger = structlog.get_logger(logger_name=__name__)


class IdentityService:
    def __init__(self, user_repo: UserRepo, organisation_repo: OrganisationRepo):
        self.user_repo = user_repo
        self.organisation_repo = organisation_repo

    def create_account(self, create_in: CreateUserSchema) -> User:
        """Create new user account"""
        user = self.user_repo.create_user(create_in=create_in)
        organisation = self.organisation_repo.create_organisation("Default")

        self.organisation_repo.create_member(user, organisation, role=MemberRole.MEMBER)

        logger.info("Created new account", user=user, organisation=organisation)

        return user
