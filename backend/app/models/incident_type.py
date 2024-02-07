from sqlalchemy import ForeignKey, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin


class IncidentType(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "type"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    description: Mapped[str] = mapped_column(UnicodeText, nullable=False)
