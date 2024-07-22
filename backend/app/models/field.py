import enum
import typing

from sqlalchemy import Boolean, Enum, ForeignKey, String, UnicodeText
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .form_field import FormField
    from .incident_field_value import IncidentFieldValue
    from .organisation import Organisation


class InterfaceKind(str, enum.Enum):
    """What we display the field as in the UI"""

    SINGLE_SELECT = "SINGLE_SELECT"
    MULTI_SELECT = "MULTI_SELECT"
    TEXT = "TEXT"
    TEXTAREA = "TEXTAREA"


class FieldKind(str, enum.Enum):
    """What type of data this field will contain"""

    USER_DEFINED = "USER_DEFINED"  # from `available_options` field

    # core options
    INCIDENT_NAME = "INCIDENT_NAME"
    INCIDENT_TYPE = "INCIDENT_TYPE"
    INCIDENT_SEVERITY = "INCIDENT_SEVERITY"
    INCIDENT_STATUS = "INCIDENT_STATUS"
    INCIDENT_SUMMARY = "INCIDENT_SUMMARY"


class Field(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "field"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    description: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    interface_kind: Mapped[InterfaceKind] = mapped_column(Enum(InterfaceKind, native_enum=False), nullable=False)
    available_options: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    kind: Mapped[FieldKind] = mapped_column(Enum(FieldKind, native_enum=False), nullable=False)

    is_deletable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_editable: Mapped[bool] = mapped_column(Boolean, nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False)

    # relationships
    organisation: Mapped["Organisation"] = relationship("Organisation", back_populates="fields")
    form_fields: Mapped[list["FormField"]] = relationship("FormField", back_populates="field")
    incident_field_values: Mapped["IncidentFieldValue"] = relationship("IncidentFieldValue", back_populates="field")
