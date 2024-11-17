"""Status page related models"""

import enum
import typing
from datetime import datetime
from typing import Optional

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

    @classmethod
    def ranked(cls, status: "ComponentStatus") -> int:
        """Return a rank for the status"""
        return {
            cls.OPERATIONAL: 0,
            cls.DEGRADED_PERFORMANCE: 1,
            cls.PARTIAL_OUTAGE: 2,
            cls.FULL_OUTAGE: 3,
        }[status]


class StatusPage(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp"

    organisation_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("organisation.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    page_type: Mapped[StatusPageKind] = mapped_column(Enum(StatusPageKind), nullable=False)
    custom_domain: Mapped[str | None] = mapped_column(String, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    public_url: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, nullable=False)
    has_active_incident: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # table properties
    __table_args__ = (UniqueConstraint("slug", name="ux_status_page_slug"),)

    # relationships
    organisation: Mapped["Organisation"] = relationship("Organisation", back_populates="status_pages")
    status_page_items: Mapped[list["StatusPageItem"]] = relationship(
        "StatusPageItem",
        back_populates="status_page",
        primaryjoin="and_(StatusPageItem.status_page_id == StatusPage.id, StatusPageItem.parent_id.is_(None))",
        order_by="StatusPageItem.rank.asc()",
    )
    status_page_incidents: Mapped[list["StatusPageIncident"]] = relationship(
        "StatusPageIncident", back_populates="status_page"
    )
    status_page_components: Mapped[list["StatusPageComponent"]] = relationship(
        "StatusPageComponent", back_populates="status_page"
    )
    status_page_component_groups: Mapped[list["StatusPageComponentGroup"]] = relationship(
        "StatusPageComponentGroup", back_populates="status_page"
    )


class StatusPageComponent(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_com"

    status_page_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page.id", ondelete="cascade"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    is_hidden: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_uptime_shown: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # relationships
    status_page: Mapped["StatusPage"] = relationship("StatusPage", back_populates="status_page_components")
    component_events: Mapped[list["StatusPageComponentEvent"]] = relationship(
        "StatusPageComponentEvent", back_populates="status_page_component"
    )
    status_page_item: Mapped[Optional["StatusPageItem"]] = relationship(
        "StatusPageItem", back_populates="status_page_component"
    )
    components_affected: Mapped[list["StatusPageComponentAffected"]] = relationship(
        "StatusPageComponentAffected", back_populates="status_page_component"
    )
    component_updates: Mapped[list["StatusPageComponentUpdate"]] = relationship(
        "StatusPageComponentUpdate", back_populates="status_page_component"
    )


class StatusPageComponentGroup(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_com_grp"

    name: Mapped[str] = mapped_column(String, nullable=False)
    status_page_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page.id", ondelete="cascade"), nullable=False, index=True
    )

    # relationships
    status_page_item: Mapped["StatusPageItem"] = relationship(
        "StatusPageItem", back_populates="status_page_component_group"
    )
    status_page: Mapped["StatusPage"] = relationship("StatusPage", back_populates="status_page_component_groups")


class StatusPageItem(Base, TimestampMixin):
    __prefix__ = "sp_it"

    parent_id: Mapped[str | None] = mapped_column(
        String(50), ForeignKey("status_page_item.id", ondelete="cascade"), nullable=True, index=True
    )
    status_page_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page.id", ondelete="cascade"), nullable=False, index=True
    )
    status_page_component_id: Mapped[str | None] = mapped_column(
        String(50), ForeignKey("status_page_component.id"), nullable=True
    )
    status_page_component_group_id: Mapped[str | None] = mapped_column(
        String(50), ForeignKey("status_page_component_group.id"), nullable=True
    )
    rank: Mapped[int] = mapped_column(Integer, nullable=False)

    # relationships
    status_page: Mapped["StatusPage"] = relationship("StatusPage", back_populates="status_page_items")
    status_page_component: Mapped["StatusPageComponent"] = relationship(
        "StatusPageComponent", back_populates="status_page_item"
    )
    status_page_component_group: Mapped["StatusPageComponentGroup"] = relationship(
        "StatusPageComponentGroup", back_populates="status_page_item"
    )

    # self referencing relationships
    parent: Mapped["StatusPageItem"] = relationship(
        "StatusPageItem", remote_side="StatusPageItem.id", back_populates="status_page_items"
    )
    status_page_items: Mapped[list["StatusPageItem"]] = relationship(
        "StatusPageItem", back_populates="parent", cascade="all, delete-orphan", order_by="StatusPageItem.rank.asc()"
    )


class StatusPageIncident(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_inc"

    status_page_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page.id", ondelete="cascade"), nullable=False, index=True
    )
    creator_id: Mapped[str] = mapped_column(String(50), ForeignKey("user.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)

    # relationship
    components_affected: Mapped[list["StatusPageComponentAffected"]] = relationship(
        "StatusPageComponentAffected", back_populates="status_page_incident"
    )
    creator: Mapped["User"] = relationship("User", back_populates="status_page_incidents_created")
    incident_updates: Mapped[list["StatusPageIncidentUpdate"]] = relationship(
        "StatusPageIncidentUpdate",
        back_populates="status_page_incident",
        order_by="StatusPageIncidentUpdate.published_at.desc()",
    )
    status_page: Mapped["StatusPage"] = relationship("StatusPage", back_populates="status_page_incidents")
    component_events: Mapped[list["StatusPageComponentEvent"]] = relationship(
        "StatusPageComponentEvent", back_populates="status_page_incident"
    )


class StatusPageComponentAffected(Base, TimestampMixin):
    __prefix__ = "sp_com_aff"

    status_page_incident_id: Mapped[str] = mapped_column(
        String, ForeignKey("status_page_incident.id"), nullable=False, index=True
    )
    status_page_component_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page_component.id"), nullable=False, index=True
    )
    status: Mapped[ComponentStatus] = mapped_column(Enum(ComponentStatus), nullable=False)

    # relationships
    status_page_incident: Mapped["StatusPageIncident"] = relationship(
        "StatusPageIncident", back_populates="components_affected"
    )
    status_page_component: Mapped["StatusPageComponent"] = relationship(
        "StatusPageComponent", back_populates="components_affected"
    )


class StatusPageIncidentUpdate(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_inc_upd"

    status_page_incident_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page_incident.id"), nullable=False, index=True
    )
    creator_id: Mapped[str] = mapped_column(String(50), ForeignKey("user.id"), nullable=False, index=True)
    message: Mapped[str] = mapped_column(String, nullable=True)
    status: Mapped[StatusPageIncidentStatus] = mapped_column(Enum(StatusPageIncidentStatus), nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # relationships
    status_page_incident: Mapped["StatusPageIncident"] = relationship(
        "StatusPageIncident", back_populates="incident_updates"
    )
    component_updates: Mapped[list["StatusPageComponentUpdate"]] = relationship(
        "StatusPageComponentUpdate", back_populates="status_page_incident_update"
    )
    creator: Mapped["User"] = relationship("User", back_populates="status_page_incident_updates_created")


class StatusPageComponentUpdate(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_com_upd"

    status_page_incident_update_id: Mapped[str] = mapped_column(
        String, ForeignKey("status_page_incident_update.id"), nullable=False, index=True
    )
    status_page_component_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page_component.id"), nullable=False, index=True
    )
    status: Mapped[ComponentStatus] = mapped_column(Enum(ComponentStatus), nullable=False)

    # relationships
    status_page_incident_update: Mapped["StatusPageIncidentUpdate"] = relationship(
        "StatusPageIncidentUpdate", back_populates="component_updates"
    )
    status_page_component: Mapped["StatusPageComponent"] = relationship(
        "StatusPageComponent", back_populates="component_updates"
    )


class StatusPageComponentEvent(Base, TimestampMixin, SoftDeleteMixin):
    __prefix__ = "sp_com_evt"

    status_page_incident_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page_incident.id"), nullable=False, index=True
    )
    status_page_component_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("status_page_component.id"), nullable=False, index=True
    )
    status: Mapped[ComponentStatus] = mapped_column(Enum(ComponentStatus), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # relationships
    status_page_incident: Mapped["StatusPageIncident"] = relationship(
        "StatusPageIncident", back_populates="component_events"
    )
    status_page_component: Mapped["StatusPageComponent"] = relationship(
        "StatusPageComponent", back_populates="component_events"
    )
