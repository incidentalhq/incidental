import enum
import typing

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .organisation import Organisation
    from .slack_message import SlackMessage


class AnnouncementFields(str, enum.Enum):
    TYPE = "TYPE"
    SEVERITY = "SEVERITY"
    STATUS = "STATUS"
    REPORTER = "REPORTER"
    INCIDENT_LEAD = "INCIDENT_LEAD"
    SLACK_CHANNEL = "SLACK_CHANNEL"


class AnnouncementActions(str, enum.Enum):
    HOMEPAGE = "HOMEPAGE"


class Announcement(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "ann"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    fields: Mapped[list[AnnouncementFields]] = mapped_column(JSONB, nullable=False, default=[])
    actions: Mapped[list[AnnouncementActions]] = mapped_column(JSONB, nullable=False, default=[])

    # relationships
    organisation: Mapped["Organisation"] = relationship("Organisation", back_populates="announcements")
    slack_messages: Mapped[list["SlackMessage"]] = relationship("SlackMessage", back_populates="announcement")
