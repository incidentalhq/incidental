from sqlalchemy import ForeignKey, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import TimestampMixin


class Settings(Base, TimestampMixin):
    __prefix__ = "set"

    organisation_id = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )

    slack_channel_name_format: Mapped[str] = mapped_column(UnicodeText, nullable=False, default="inc-{YYYY}-{MM}-{DD}")
    incident_reference_format: Mapped[str] = mapped_column(UnicodeText, nullable=False, default="inc-{id}")

    slack_announcement_channel_id: Mapped[str] = mapped_column(UnicodeText, nullable=True)
    slack_announcement_channel_name: Mapped[str] = mapped_column(UnicodeText, nullable=True)

    # relationships
    organisation = relationship("Organisation", back_populates="settings")
