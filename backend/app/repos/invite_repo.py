from datetime import datetime
from typing import Sequence

from sqlalchemy import or_, select

from app.models import Invite, Organisation, User
from app.models.organisation_member import MemberRole

from .base_repo import BaseRepo


class InviteRepo(BaseRepo):
    def get_by_id_or_raise(self, id: str) -> Invite:
        """Get by id"""
        stmt = select(Invite).where(Invite.id == id)
        invite = self.session.execute(stmt).scalar_one()
        return invite

    def create_invite(
        self,
        organisation: Organisation,
        user: User,
        email_address: str,
        expires_at: datetime | None = None,
        role: MemberRole = MemberRole.MEMBER,
    ) -> Invite:
        """Create an invite"""
        invite = Invite(
            organisation_id=organisation.id,
            inviter_id=user.id,
            email_address=email_address,
            expires_at=expires_at,
            role=role,
        )

        self.session.add(invite)
        self.session.flush()

        return invite

    def get_pending_invites_by_email_address(self, organisation: Organisation, email_address: str) -> Sequence[Invite]:
        """Get all pending invites by email address in an organisation"""
        stmt = select(Invite).where(
            Invite.email_address == email_address,
            Organisation.id == organisation.id,
            Invite.is_used.is_(False),
            or_(
                Invite.expires_at.is_(None),
                Invite.expires_at > datetime.now(),
            ),
        )

        invites = self.session.scalars(stmt).all()
        return invites

    def get_pending_invites_in_organisation(self, organisation: Organisation) -> Sequence[Invite]:
        """Get all pending invites in an organisation"""
        stmt = (
            select(Invite)
            .where(
                Invite.organisation_id == organisation.id,
                Invite.invitee_id.is_(None),
                Invite.is_used.is_(False),
                or_(
                    Invite.expires_at.is_(None),
                    Invite.expires_at > datetime.now(),
                ),
            )
            .order_by(Invite.created_at.desc())
        )
        invites = self.session.scalars(stmt).all()

        return invites

    def get_all_pending_invites_by_email_address(self, email_address: str) -> Sequence[Invite]:
        """Get all pending invites by email address across all organisations"""
        stmt = select(Invite).where(
            Invite.email_address == email_address,
            Invite.is_used.is_(False),
            or_(
                Invite.expires_at.is_(None),
                Invite.expires_at > datetime.now(),
            ),
        )

        invites = self.session.scalars(stmt).all()
        return invites

    def delete_invite(self, invite: Invite):
        """Delete an invite"""
        self.session.delete(invite)
        self.session.flush()

    def use_invite(self, invite: Invite, user: User):
        """Use an invite"""
        invite.invitee_id = user.id
        invite.is_used = True

        self.session.flush()
        return invite
