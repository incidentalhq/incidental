import typing

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import TimestampMixin

if typing.TYPE_CHECKING:
    from .incident import Incident
    from .incident_role import IncidentRole
    from .user import User


class IncidentRoleAssignment(Base, TimestampMixin):
    __prefix__ = "ra"

    user_id: Mapped[str] = mapped_column(String(50), ForeignKey("user.id", ondelete="cascade"), nullable=False)
    incident_id: Mapped[str] = mapped_column(String(50), ForeignKey("incident.id", ondelete="cascade"), nullable=False)
    incident_role_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("incident_role.id", ondelete="cascade"), nullable=False
    )

    # relationships
    incident: Mapped["Incident"] = relationship("Incident", back_populates="incident_role_assignments")
    user: Mapped["User"] = relationship("User")
    incident_role: Mapped["IncidentRole"] = relationship("IncidentRole")

    __table_args__ = (UniqueConstraint("user_id", "incident_id", "incident_role_id", name="ux_user_incident_role"),)
