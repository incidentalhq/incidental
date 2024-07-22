from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin


class IncidentTypeField(Base, TimestampMixin, SoftDeleteMixin):
    """Which fields are available for an incident type"""

    __prefix__ = "itf"

    incident_type_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("incident_type.id", ondelete="cascade"), nullable=False, index=True
    )
    field_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("field.id", ondelete="cascade"), nullable=False, index=True
    )
