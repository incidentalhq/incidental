"""User model"""

import typing
from datetime import datetime

import bcrypt
from sqlalchemy import Boolean, DateTime, Integer, UnicodeText
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym
from sqlalchemy.orm.attributes import flag_modified

from app.db import Base

from .mixins import TimestampMixin

if typing.TYPE_CHECKING:
    from .organisation import Organisation


class User(Base, TimestampMixin):
    __prefix__ = "user"

    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    email_address: Mapped[str] = mapped_column(UnicodeText, nullable=False, unique=True)
    _password: Mapped[str] = mapped_column("password", UnicodeText, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    auth_token: Mapped[str] = mapped_column(UnicodeText, nullable=False, unique=True)
    is_super_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_billing_user = mapped_column(Boolean, nullable=False, default=False)
    language = mapped_column(UnicodeText, nullable=False, default="en-gb")
    _settings = mapped_column("settings", JSONB(none_as_null=True), nullable=False, default={})
    is_email_verified = mapped_column(Boolean, nullable=False, default=False)
    login_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_login_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login_attempt_at = mapped_column(DateTime(timezone=True), nullable=True)

    # slack specific
    slack_user_id = mapped_column(UnicodeText, nullable=True, unique=True)

    # relationships
    organisations: Mapped[list["Organisation"]] = relationship(
        "Organisation", secondary="organisation_member", back_populates="users"
    )
    incidents_created = relationship("Incident", back_populates="creator")
    status_page_incidents_created = relationship("StatusPageIncident", back_populates="creator")
    status_page_incident_updates_created = relationship("StatusPageIncidentUpdate", back_populates="creator")

    # user specific settings
    def _set_settings(self, value):
        self._settings = value
        flag_modified(self, "_settings")

    def _get_settings(self):
        return self._settings

    settings = synonym("_settings", descriptor=property(_get_settings, _set_settings))

    def _get_password(self):
        return self._password

    def _set_password(self, password: str) -> None:
        hashed_password = bcrypt.hashpw(password=password.encode("utf8"), salt=bcrypt.gensalt())
        self._password = hashed_password.decode("utf8")

    # Hide password encryption by exposing password field only.
    password = synonym("_password", descriptor=property(_get_password, _set_password))

    def __repr__(self):
        return "<User: id={} email={}>".format(self.id, self.email_address)

    def check_password(self, password: str) -> bool:
        if self.password is None:
            return False
        return bcrypt.checkpw(password=password.encode("utf8"), hashed_password=self._password.encode("utf8"))

    def belongs_to(self, organisation: "Organisation") -> bool:
        """Does user belong to the given organisation"""
        for org in self.organisations:
            if org.id == organisation.id:
                return True

        return False

    def belongs_to_any(self, organisations: list["Organisation"]) -> bool:
        """Does this user belong to at least one of the given organisations"""
        subject_org_ids = set([org.id for org in self.organisations])
        for org in organisations:
            if org.id in subject_org_ids:
                return True

        return False
