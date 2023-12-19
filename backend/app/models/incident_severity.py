import typing

from sqlalchemy import ForeignKey, Integer, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .incident import Incident


class IncidentSeverity(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sev"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    description: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # relationships
    organisation = relationship("Organisation", back_populates="incident_severities")
    incidents: Mapped[list["Incident"]] = relationship("Incident", back_populates="incident_severity")
