import enum
import typing
from typing import Any

from sqlalchemy import Enum, ForeignKey, String, UnicodeText
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .form_field import FormField
    from .organisation import Organisation


class CustomFieldKind(str, enum.Enum):
    SINGLE_SELECT = "SINGLE_SELECT"
    MULTI_SELECT = "MULTI_SELECT"
    TEXT = "TEXT"
    TEXTAREA = "TEXTAREA"


class CustomField(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "cf"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    description: Mapped[str] = mapped_column(UnicodeText, nullable=True)
    kind: Mapped[CustomFieldKind] = mapped_column(Enum(CustomFieldKind, native_enum=False), nullable=False)
    available_options: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    # relationships
    organisation: Mapped["Organisation"] = relationship("Organisation", back_populates="custom_fields")
    form_fields: Mapped[list["FormField"]] = relationship("FormField", back_populates="custom_field")
