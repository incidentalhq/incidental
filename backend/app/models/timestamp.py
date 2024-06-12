import enum
import typing
from datetime import datetime
from typing import Any

from pydantic import BaseModel
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, UnicodeText
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .incident import Incident
    from .organisation import Organisation


class TimestampRule(BaseModel):
    on_event: str
    first: bool | None = None
    last: bool | None = None


class TimestampKind(str, enum.Enum):
    REPORTED_AT = "REPORTED_AT"
    ACCEPTED_AT = "ACCEPTED_AT"
    DECLINED_AT = "DECLINED_AT"
    MERGED_AT = "MERGED_AT"
    CANCELLED_AT = "CANCELLED_AT"
    RESOLVED_AT = "RESOLVED_AT"
    CLOSED_AT = "CLOSED_AT"
    CUSTOM = "CUSTOM"


class Timestamp(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "ts"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    description: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    kind: Mapped[TimestampKind] = mapped_column(Enum(TimestampKind, native_enum=False), nullable=False)
    rank: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    rules: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False, default=[])
    can_delete: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # relationships
    organisation: Mapped["Organisation"] = relationship("Organisation", back_populates="timestamps")
    timestamp_values: Mapped[list["TimestampValue"]] = relationship("TimestampValue", back_populates="timestamp")


class TimestampValue(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "tsv"

    timestamp_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("timestamp.id", ondelete="cascade"), nullable=False, index=True
    )
    incident_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("incident.id", ondelete="cascade"), nullable=False, index=True
    )
    value: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # relationships
    timestamp: Mapped["Timestamp"] = relationship("Timestamp", back_populates="timestamp_values")
    incident: Mapped["Incident"] = relationship("Incident", back_populates="timestamp_values")
