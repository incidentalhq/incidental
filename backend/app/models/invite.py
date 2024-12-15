"""Invite model"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.organisation_member import MemberRole

from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .organisation import Organisation
    from .user import User


class Invite(Base, TimestampMixin):
    __prefix__ = "inv"

    organisation_id: Mapped[str] = mapped_column(String(50), ForeignKey("organisation.id"), nullable=False, index=True)
    inviter_id: Mapped[str] = mapped_column(String(50), ForeignKey("user.id"), nullable=False, index=True)
    invitee_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("user.id"), nullable=True, index=True)
    email_address: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    role: Mapped[MemberRole] = mapped_column(Enum(MemberRole, native_enum=False), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)

    # relationships
    organisation: Mapped["Organisation"] = relationship("Organisation", back_populates="invites", uselist=True)
    inviter: Mapped["User"] = relationship(
        "User", foreign_keys=[inviter_id], back_populates="sent_invites", uselist=False
    )
    invitee: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[invitee_id], back_populates="received_invites", uselist=False
    )
