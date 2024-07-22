import typing
from typing import Optional

from sqlalchemy import ForeignKey, Integer, String, UnicodeText, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .incident_field_value import IncidentFieldValue
    from .incident_role import IncidentRoleKind
    from .incident_role_assignment import IncidentRoleAssignment
    from .incident_severity import IncidentSeverity
    from .incident_status import IncidentStatus
    from .incident_type import IncidentType
    from .organisation import Organisation
    from .timestamp import TimestampValue
    from .user import User


class Incident(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "inc"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    incident_type_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("incident_type.id", ondelete="cascade"), nullable=False, index=True
    )
    incident_status_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("incident_status.id", ondelete="cascade"), nullable=False, index=True
    )
    creator_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("user.id", ondelete="cascade"), nullable=False, index=True
    )
    incident_severity_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("incident_severity.id", ondelete="cascade"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    reference: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    reference_id: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(UnicodeText, nullable=True)

    # slack specific
    slack_channel_id: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    slack_channel_name: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)

    # relationships
    creator: Mapped["User"] = relationship("User", back_populates="incidents_created")
    incident_type: Mapped["IncidentType"] = relationship("IncidentType")
    incident_status: Mapped["IncidentStatus"] = relationship("IncidentStatus")
    incident_severity: Mapped["IncidentSeverity"] = relationship("IncidentSeverity", back_populates="incidents")
    incident_role_assignments: Mapped[list["IncidentRoleAssignment"]] = relationship(
        "IncidentRoleAssignment", back_populates="incident"
    )
    organisation: Mapped["Organisation"] = relationship("Organisation", back_populates="incidents")
    timestamp_values: Mapped[list["TimestampValue"]] = relationship("TimestampValue", back_populates="incident")
    incident_field_values: Mapped[list["IncidentFieldValue"]] = relationship(
        "IncidentFieldValue", back_populates="incident"
    )

    __table_args__ = (
        UniqueConstraint("reference_id", "organisation_id", name="ux_incident_reference_id_organisation_id"),
    )

    def get_user_for_role(self, kind: "IncidentRoleKind") -> Optional["User"]:
        for assignment in self.incident_role_assignments:
            if assignment.incident_role.kind == kind:
                return assignment.user

        return None
