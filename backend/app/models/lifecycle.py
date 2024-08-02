import typing

from sqlalchemy import Boolean, ForeignKey, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .organisation import Organisation


class Lifecycle(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "lc"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    is_triage_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    is_deletable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # relationships
    organisation: Mapped["Organisation"] = relationship("Organisation", back_populates="lifecycles")
