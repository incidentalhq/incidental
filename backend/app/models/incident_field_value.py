import typing

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .field import Field
    from .incident import Incident


class IncidentFieldValue(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "ifv"

    incident_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("incident.id", ondelete="cascade"), nullable=False, index=True
    )
    field_id: Mapped[str] = mapped_column(String(50), ForeignKey("field.id", ondelete="cascade"), index=True)

    # store values here, where value is stored depends on the field type
    value_text: Mapped[str | None] = mapped_column(String, nullable=True)
    value_textarea: Mapped[str | None] = mapped_column(String, nullable=True)
    value_single_select: Mapped[str | None] = mapped_column(String, nullable=True)
    value_multi_select: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)

    # relationships
    incident: Mapped["Incident"] = relationship("Incident", back_populates="incident_field_values")
    field: Mapped["Field"] = relationship("Field", back_populates="incident_field_values")
