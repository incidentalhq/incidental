import enum

from sqlalchemy import Enum, ForeignKey, Integer, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin


class IncidentStatusCategoryEnum(str, enum.Enum):
    TRIAGE = "TRIAGE"
    ACTIVE = "ACTIVE"
    POST_INCIDENT = "POST_INCIDENT"
    CLOSED = "CLOSED"


class IncidentStatus(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "status"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    description: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    category: Mapped[IncidentStatusCategoryEnum] = mapped_column(
        Enum(IncidentStatusCategoryEnum, native_enum=False), nullable=False
    )
