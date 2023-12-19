import enum
import typing

from sqlalchemy import Enum, ForeignKey, String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .organisation import Organisation


class SlackBookmarkKind(str, enum.Enum):
    HOMEPAGE = "HOMEPAGE"
    LEAD = "LEAD"
    SEVERITY = "SEVERITY"
    STATUS = "STATUS"


class SlackBookmark(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "slk_bm"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    slack_bookmark_id: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    slack_channel_id: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    kind: Mapped[SlackBookmarkKind] = mapped_column(Enum(SlackBookmarkKind, native_enum=False), nullable=False)

    # relationships
    organisation: Mapped["Organisation"] = relationship("Organisation")
