"""User model"""

from datetime import datetime

from passlib.context import CryptContext
from sqlalchemy import Boolean, DateTime, Integer, UnicodeText
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym
from sqlalchemy.orm.attributes import flag_modified

from app.db import Base

from .mixins import TimestampMixin

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base, TimestampMixin):
    __prefix__ = "user"

    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    email_address: Mapped[str] = mapped_column(UnicodeText, nullable=False, unique=True)
    _password = mapped_column("password", UnicodeText, nullable=False)
    is_active = mapped_column(Boolean, nullable=False, default=True)
    auth_token = mapped_column(UnicodeText, nullable=False, unique=True)
    is_super_admin = mapped_column(Boolean, default=False)
    is_billing_user = mapped_column(Boolean, default=False)
    language = mapped_column(UnicodeText, nullable=False, default="en-gb")
    _settings = mapped_column("settings", JSONB(none_as_null=True), nullable=False, default={})
    is_email_verified = mapped_column(Boolean, nullable=False, default=False)
    login_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_login_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    last_login_attempt_at = mapped_column(DateTime, nullable=True)

    # slack specific
    slack_user_id = mapped_column(UnicodeText, nullable=True, unique=True)

    # relationships
    organisations = relationship("Organisation", secondary="organisation_member", back_populates="users")
    incidents_created = relationship("Incident", back_populates="owner")

    # user specific settings
    def _set_settings(self, value):
        self._settings = value
        flag_modified(self, "_settings")

    def _get_settings(self):
        return self._settings

    settings = synonym("_settings", descriptor=property(_get_settings, _set_settings))

    def _get_password(self):
        return self._password

    def _set_password(self, password):
        self._password = pwd_context.hash(password)

    # Hide password encryption by exposing password field only.
    password = synonym("_password", descriptor=property(_get_password, _set_password))

    def __repr__(self):
        return "<User: id={} email={}>".format(self.id, self.email_address)

    def check_password(self, password: str) -> bool:
        if self.password is None:
            return False
        return pwd_context.verify(password, self._password)
