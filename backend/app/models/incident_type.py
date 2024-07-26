import typing

from sqlalchemy import Boolean, ForeignKey, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .field import Field
    from .organisation import Organisation


class IncidentType(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "type"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    description: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    is_editable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_deletable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # relationships
    organisation: Mapped["Organisation"] = relationship("Organisation", back_populates="incident_types")

    # fields that have not been deleted
    fields: Mapped[list["Field"]] = relationship(
        "Field",
        secondary="incident_type_field",
        secondaryjoin="and_(Field.id==incident_type_field.c.field_id, Field.deleted_at.is_(None))",
    )
