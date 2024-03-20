import enum

from sqlalchemy import ForeignKey, String, UnicodeText, UniqueConstraint
from sqlalchemy.orm import Mapped, backref, mapped_column, relationship

from app.db import Base

from .mixins import TimestampMixin


class MemberRole(str, enum.Enum):
    MEMBER = "MEMBER"


class OrganisationMember(Base, TimestampMixin):
    __prefix__ = "org_mem"

    user_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("user.id", ondelete="cascade"), nullable=False, index=True
    )
    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(UnicodeText, nullable=False)

    # relationships
    user = relationship("User", viewonly=True, uselist=False)
    organisation = relationship(
        "Organisation",
        backref=backref("organisation_members"),
        uselist=False,
        viewonly=True,
    )

    def __repr__(self):
        return f"<OrganisationMember user_id={self.user_id} org_id={self.organisation_id}>"

    __table_args__ = (UniqueConstraint("user_id", "organisation_id", name="ux_user_organisation"),)
