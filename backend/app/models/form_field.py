import enum
import typing
from typing import Optional

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .custom_field import CustomField
    from .form import Form


class FormFieldKind(str, enum.Enum):
    # generic
    SINGLE_SELECT = "SINGLE_SELECT"
    MULTI_SELECT = "MULTI_SELECT"
    TEXT = "TEXT"
    TEXTAREA = "TEXTAREA"

    # specific
    INCIDENT_TYPE = "INCIDENT_TYPE"
    SEVERITY_TYPE = "SEVERITY_TYPE"
    INCIDENT_STATUS = "INCIDENT_STATUS"


class FormField(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "ff"

    form_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("form.id", ondelete="cascade"), nullable=False, index=True
    )
    custom_field_id: Mapped[Optional[str]] = mapped_column(
        String(50), ForeignKey("custom_field.id", ondelete="cascade"), nullable=True, index=True
    )
    kind: Mapped[FormFieldKind] = mapped_column(Enum(FormFieldKind, native_enum=False), nullable=False)
    label: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    description: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    can_remove: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    default_value: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)

    # relationships
    form: Mapped["Form"] = relationship("Form", back_populates="form_fields")
    custom_field: Mapped[Optional["CustomField"]] = relationship("CustomField", back_populates="form_fields")
