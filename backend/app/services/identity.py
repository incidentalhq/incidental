"""Identity management services"""

import structlog
from pydantic import BaseModel, ConfigDict

from app.models import MemberRole, User
from app.repos import InviteRepo, OrganisationRepo, UserRepo
from app.schemas.actions import CreateUserSchema, CreateUserViaSlackSchema

logger = structlog.get_logger(logger_name=__name__)


class CreateAccountResult(BaseModel):
    user: User
    is_new_organisation: bool

    model_config = ConfigDict(arbitrary_types_allowed=True)


class IdentityService:
    def __init__(self, user_repo: UserRepo, organisation_repo: OrganisationRepo, invite_repo: InviteRepo):
        self.user_repo = user_repo
        self.organisation_repo = organisation_repo
        self.invite_repo = invite_repo

    def create_account(self, create_in: CreateUserSchema | CreateUserViaSlackSchema) -> CreateAccountResult:
        """Create new user account"""
        user = self.user_repo.create_user(create_in=create_in)

        invites = self.invite_repo.get_all_pending_invites_by_email_address(email_address=user.email_address)
        if len(invites):
            for invite in invites:
                self.organisation_repo.create_member(user, invite.organisation, role=invite.role)
                self.invite_repo.use_invite(invite, user)

            return CreateAccountResult(user=user, is_new_organisation=False)
        else:
            organisation = self.organisation_repo.create_organisation("Default")
            self.organisation_repo.create_member(user, organisation, role=MemberRole.MEMBER)

            return CreateAccountResult(user=user, is_new_organisation=True)
