import typing

from sqlalchemy import ForeignKey, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .incident_severity import IncidentSeverity
    from .incident_status import IncidentStatus


class IncidentUpdate(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "inc_update"

    incident_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("incident.id", ondelete="cascade"), nullable=False, index=True
    )
    creator_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("user.id", ondelete="cascade"), nullable=False, index=True
    )
    summary: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    new_incident_status_id: Mapped[str | None] = mapped_column(
        String(50), ForeignKey("incident_status.id", ondelete="cascade"), nullable=True, index=True
    )
    new_incident_severity_id: Mapped[str | None] = mapped_column(
        String(50), ForeignKey("incident_severity.id", ondelete="cascade"), nullable=True, index=True
    )
    previous_incident_status_id: Mapped[str | None] = mapped_column(
        String(50), ForeignKey("incident_status.id", ondelete="cascade"), nullable=True, index=True
    )
    previous_incident_severity_id: Mapped[str | None] = mapped_column(
        String(50), ForeignKey("incident_severity.id", ondelete="cascade"), nullable=True, index=True
    )

    # relationships
    new_incident_status: Mapped["IncidentStatus"] = relationship(
        "IncidentStatus", foreign_keys="IncidentUpdate.new_incident_status_id"
    )
    new_incident_severity: Mapped["IncidentSeverity"] = relationship(
        "IncidentSeverity", foreign_keys="IncidentUpdate.new_incident_severity_id"
    )
    previous_incident_status: Mapped["IncidentStatus"] = relationship(
        "IncidentStatus", foreign_keys="IncidentUpdate.previous_incident_status_id"
    )
    previous_incident_severity: Mapped["IncidentSeverity"] = relationship(
        "IncidentSeverity", foreign_keys="IncidentUpdate.previous_incident_severity_id"
    )
