from datetime import datetime

from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped, mapped_column


class TimestampMixin:
    """Adds timestamp fields to model"""

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class SoftDeleteMixin:
    """Adds a soft delete field"""

    deleted_at: Mapped[datetime] | None = mapped_column(
        DateTime, nullable=True, default=None
    )
