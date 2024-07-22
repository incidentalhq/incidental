import enum
import typing

from sqlalchemy import Boolean, Enum, ForeignKey, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .form_field import FormField
    from .organisation import Organisation


class FormKind(enum.Enum):
    CREATE_INCIDENT = "CREATE_INCIDENT"
    UPDATE_INCIDENT = "UPDATE_INCIDENT"


class Form(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "frm"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    template: Mapped[str] = mapped_column(UnicodeText, nullable=True)
    type: Mapped[FormKind] = mapped_column(
        Enum(FormKind, native_enum=False),
        nullable=False,
    )

    # relationships
    form_fields: Mapped[list["FormField"]] = relationship(
        "FormField",
        primaryjoin="and_(FormField.form_id==Form.id, Form.deleted_at.is_(None))",
        order_by="asc(FormField.position)",
        viewonly=True,
    )
    organisation: Mapped["Organisation"] = relationship("Organisation", viewonly=True)
