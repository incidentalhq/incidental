import enum
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Enum, UnicodeText, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base

from .mixins import TimestampMixin


class JobStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    PROCESSED = "PROCESSED"
    ERROR = "ERROR"


class Job(Base, TimestampMixin):
    __prefix__ = "job"

    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    queue: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus, native_enum=False), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default={}, server_default="{}")
    result: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    exception: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    is_retryable: Mapped[bool] = mapped_column(Boolean, server_default=func.false())

    # timestamps
    processing_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    errored_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Job id={self.id}  name={self.name} queue={self.queue} status={self.status}>"
