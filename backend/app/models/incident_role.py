import enum

from sqlalchemy import Boolean, Enum, ForeignKey, String, UnicodeText, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin


class IncidentRoleKind(str, enum.Enum):
    REPORTER = "REPORTER"
    LEAD = "LEAD"
    CUSTOM = "CUSTOM"


class IncidentRole(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "role"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    description: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    guide: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    slack_reference: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    kind: Mapped[IncidentRoleKind] = mapped_column(Enum(IncidentRoleKind, native_enum=False), nullable=False)
    is_deletable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_editable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # relationships
    organisation = relationship("Organisation", back_populates="incident_roles")

    __table_args__ = (
        UniqueConstraint("organisation_id", "slack_reference", name="uix_incident_role_org_slack_reference"),
        UniqueConstraint("organisation_id", "name", name="uix_incident_role_org_name"),
    )
