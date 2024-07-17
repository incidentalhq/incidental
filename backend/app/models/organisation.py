import enum
import typing

from sqlalchemy import String, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import TimestampMixin

if typing.TYPE_CHECKING:
    from .announcement import Announcement
    from .field import Field
    from .incident import Incident
    from .incident_role import IncidentRole
    from .incident_severity import IncidentSeverity
    from .incident_type import IncidentType
    from .settings import Settings
    from .slack_message import SlackMessage
    from .timestamp import Timestamp
    from .user import User


class OrganisationTypes(str, enum.Enum):
    DEFAULT = "default"
    SLACK = "slack"


class Organisation(Base, TimestampMixin):
    __prefix__ = "org"

    name = mapped_column(UnicodeText, nullable=False)
    kind = mapped_column(UnicodeText, nullable=False, default=OrganisationTypes.DEFAULT)
    slug = mapped_column(String(100), nullable=False, unique=True)

    # slack specific columns
    slack_team_id = mapped_column(UnicodeText, nullable=True, unique=True)
    slack_team_name = mapped_column(UnicodeText, nullable=True)
    slack_bot_token = mapped_column(UnicodeText, nullable=True)

    # relationships
    fields: Mapped[list["Field"]] = relationship("Field", back_populates="organisation")
    incident_severities: Mapped[list["IncidentSeverity"]] = relationship(
        "IncidentSeverity", back_populates="organisation"
    )
    settings: Mapped["Settings"] = relationship("Settings", back_populates="organisation")
    users: Mapped[list["User"]] = relationship("User", secondary="organisation_member", back_populates="organisations")
    incident_roles: Mapped[list["IncidentRole"]] = relationship("IncidentRole", back_populates="organisation")
    slack_messages: Mapped[list["SlackMessage"]] = relationship("SlackMessage", back_populates="organisation")
    announcements: Mapped[list["Announcement"]] = relationship("Announcement", back_populates="organisation")
    incidents: Mapped[list["Incident"]] = relationship("Incident", back_populates="organisation")
    timestamps: Mapped[list["Timestamp"]] = relationship("Timestamp", back_populates="organisation")
    incident_types: Mapped[list["IncidentType"]] = relationship("IncidentType", back_populates="organisation")

    def __repr__(self):
        return f"<Organisation id={self.id} name={self.name}>"

    @property
    def slack_app_installed(self):
        return self.slack_bot_token is not None
