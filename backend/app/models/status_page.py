"""Status page related models"""

import enum
import typing
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, UnicodeText, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

from .mixins import SoftDeleteMixin, TimestampMixin

if typing.TYPE_CHECKING:
    from .organisation import Organisation
    from .user import User


class StatusPageKind(str, enum.Enum):
    PUBLIC = "PUBLIC"
    CUSTOMER = "CUSTOMER"
    INTERNAL = "INTERNAL"


class StatusPageIncidentStatus(str, enum.Enum):
    INVESTIGATING = "INVESTIGATING"
    IDENTIFIED = "IDENTIFIED"
    MONITORING = "MONITORING"
    RESOLVED = "RESOLVED"


class ComponentStatus(str, enum.Enum):
    OPERATIONAL = "OPERATIONAL"
    DEGRADED_PERFORMANCE = "DEGRADED_PERFORMANCE"
    PARTIAL_OUTAGE = "PARTIAL_OUTAGE"
    FULL_OUTAGE = "FULL_OUTAGE"


class StatusPage(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    page_type: Mapped[StatusPageKind] = mapped_column(Enum(StatusPageKind), nullable=False)
    custom_domain: Mapped[str | None] = mapped_column(String, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    public_url: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, nullable=False)

    # table properties
    __table_args__ = (UniqueConstraint("slug", name="ux_status_page_slug"),)

    # relationships
    organisation: Mapped["Organisation"] = relationship("Organisation", back_populates="status_pages")
    status_page_items: Mapped["StatusPageItem"] = relationship("StatusPageItem", back_populates="status_page")
    status_page_incidents: Mapped[list["StatusPageIncident"]] = relationship(
        "StatusPageIncident", back_populates="status_page"
    )
    status_page_components: Mapped[list["Component"]] = relationship("Component", back_populates="status_page")


class Component(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_com"

    status_page_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    is_hidden: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_uptime_shown: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # relationships
    status_page: Mapped["StatusPage"] = relationship("StatusPage", back_populates="status_page_components")
    component_events: Mapped[list["ComponentEvent"]] = relationship("ComponentEvent", back_populates="component")


class ComponentGroup(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_com_grp"

    status_page_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)

    # relationships
    pass


class StatusPageItem(Base, TimestampMixin):
    __prefix__ = "sp_it"

    parent_id: Mapped[str | None] = mapped_column(
        String(50), ForeignKey("status_page_item.id", ondelete="set null"), index=True, nullable=True
    )
    status_page_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page.id", ondelete="cascade"), nullable=False, index=True
    )
    component_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("component.id"), nullable=True)
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str | None] = mapped_column(String, nullable=True)

    # relationships
    status_page: Mapped["StatusPage"] = relationship("StatusPage", back_populates="status_page_items")

    # Self-referencing relationships
    parent: Mapped["StatusPageItem"] = relationship(
        "StatusPageItem", remote_side="StatusPageItem.id", back_populates="children"
    )
    children: Mapped[list["StatusPageItem"]] = relationship(
        "StatusPageItem", back_populates="parent", cascade="all, delete-orphan"
    )


class StatusPageIncident(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_inc"

    status_page_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page.id", ondelete="cascade"), nullable=False, index=True
    )
    creator_id: Mapped[str] = mapped_column(String(50), ForeignKey("user.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)

    # relationship
    components_affected: Mapped[list["ComponentAffected"]] = relationship(
        "ComponentAffected", back_populates="status_page_incident"
    )
    creator: Mapped["User"] = relationship("User", back_populates="status_page_incidents_created")
    incident_updates: Mapped[list["StatusPageIncidentUpdate"]] = relationship(
        "StatusPageIncidentUpdate", back_populates="status_page_incident"
    )
    status_page: Mapped["StatusPage"] = relationship("StatusPage", back_populates="status_page_incidents")
    component_events: Mapped[list["ComponentEvent"]] = relationship(
        "ComponentEvent", back_populates="status_page_incident"
    )


class ComponentAffected(Base):
    __prefix__ = "sp_com_aff"

    status_page_incident_id: Mapped[str] = mapped_column(
        String, ForeignKey("status_page_incident.id"), nullable=False, index=True
    )
    component_id: Mapped[str] = mapped_column(String(50), ForeignKey("component.id"), nullable=False, index=True)
    status: Mapped[ComponentStatus] = mapped_column(Enum(ComponentStatus), nullable=False)

    # relationships
    status_page_incident: Mapped["StatusPageIncident"] = relationship(
        "StatusPageIncident", back_populates="components_affected"
    )


class StatusPageIncidentUpdate(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_inc_upd"

    status_page_incident_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page_incident.id"), nullable=False, index=True
    )
    creator_id: Mapped[str] = mapped_column(String(50), ForeignKey("user.id"), nullable=False, index=True)
    message: Mapped[str] = mapped_column(String, nullable=True)
    status: Mapped[StatusPageIncidentStatus] = mapped_column(Enum(StatusPageIncidentStatus), nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # relationships
    status_page_incident: Mapped["StatusPageIncident"] = relationship(
        "StatusPageIncident", back_populates="incident_updates"
    )
    component_updates: Mapped[list["ComponentUpdate"]] = relationship(
        "ComponentUpdate", back_populates="status_page_incident_update"
    )
    creator: Mapped["User"] = relationship("User", back_populates="status_page_incident_updates_created")


class ComponentUpdate(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_com_upd"

    status_page_incident_update_id: Mapped[str] = mapped_column(
        String, ForeignKey("status_page_incident_update.id"), nullable=False, index=True
    )
    component_id: Mapped[str] = mapped_column(String(50), ForeignKey("component.id"), nullable=False, index=True)
    status: Mapped[ComponentStatus] = mapped_column(Enum(ComponentStatus), nullable=False)

    # relationships
    status_page_incident_update: Mapped["StatusPageIncident"] = relationship(
        "StatusPageIncidentUpdate", back_populates="component_updates"
    )


class ComponentEvent(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_com_evt"

    status_page_incident_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page_incident.id"), nullable=False, index=True
    )
    component_id: Mapped[str] = mapped_column(String(50), ForeignKey("component.id"), nullable=False, index=True)
    status: Mapped[ComponentStatus] = mapped_column(Enum(ComponentStatus), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # relationships
    status_page_incident: Mapped["StatusPageIncident"] = relationship(
        "StatusPageIncident", back_populates="component_events"
    )
    component: Mapped["Component"] = relationship("Component", back_populates="component_events")
