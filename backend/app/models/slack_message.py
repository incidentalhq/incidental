import enum
import typing

from sqlalchemy import Enum, ForeignKey, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .announcement import Announcement
    from .organisation import Organisation


class SlackMessageKind(str, enum.Enum):
    CHANNEL_PINNED_POST = "CHANNEL_PINNED_POST"
    INCIDENT_UPDATE = "INCIDENT_UPDATE"
    ANNOUNCEMENT_POST = "ANNOUNCEMENT_POST"


class SlackMessage(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "slk_msg"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    announcement_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("announcement.id", ondelete="cascade"), nullable=True, index=True
    )
    slack_message_ts: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    slack_channel_id: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    kind: Mapped[SlackMessageKind] = mapped_column(Enum(SlackMessageKind, native_enum=False), nullable=False)

    # relationships
    announcement: Mapped["Announcement"] = relationship("Announcement", back_populates="slack_messages")
    organisation: Mapped["Organisation"] = relationship("Organisation", back_populates="slack_messages")
