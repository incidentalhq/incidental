import typing

from sqlalchemy import Boolean, ForeignKey, Integer, String, UnicodeText, false
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .field import Field
    from .form import Form


class FormField(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "ff"

    form_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("form.id", ondelete="cascade"), nullable=False, index=True
    )
    field_id: Mapped[str] = mapped_column(String(50), ForeignKey("field.id", ondelete="cascade"), index=True)
    label: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    description: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    rank: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_deletable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    default_value: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)

    # abilities
    can_have_default_value: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=false())
    can_have_description: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=false())
    can_change_required: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=false())

    # relationships
    form: Mapped["Form"] = relationship("Form", back_populates="form_fields")
    field: Mapped["Field"] = relationship("Field", back_populates="form_fields")
