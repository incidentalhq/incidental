from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import distinct, func, or_, select

from app.env import settings
from app.exceptions import FormFieldValidationError, ValidationError
from app.models import (
    ComponentStatus,
    Organisation,
    StatusPage,
    StatusPageComponent,
    StatusPageComponentAffected,
    StatusPageComponentEvent,
    StatusPageComponentGroup,
    StatusPageComponentUpdate,
    StatusPageIncident,
    StatusPageIncidentStatus,
    StatusPageIncidentUpdate,
    StatusPageItem,
    User,
)
from app.repos.base_repo import BaseRepo
from app.schemas.actions import (
    CreateStatusPageComponentSchema,
    CreateStatusPageGroupSchema,
    CreateStatusPageIncidentSchema,
    CreateStatusPageIncidentUpdateSchema,
    CreateStatusPageSchema,
    PaginationParamsSchema,
    PatchStatusPageComponentSchema,
    PatchStatusPageGroupSchema,
    PatchStatusPageSchema,
    UpdateStatusPageItemsRankSchema,
)
from app.schemas.resources import ComponentsCurrentStatusSchema, ComponentStatusSchema
from app.utils import generate_slug


class StatusPageRepo(BaseRepo):
    def search(self, organisation: Organisation) -> Sequence[StatusPage]:
        """Search for status pages within an organisation"""
        stmt = select(StatusPage).where(StatusPage.organisation_id == organisation.id)

        return self.session.scalars(stmt).all()

    def get_by_id_or_raise(self, id: str) -> StatusPage:
        """Get status page by ID"""
        stmt = select(StatusPage).where(StatusPage.id == id, StatusPage.deleted_at.is_(None))
        return self.session.execute(stmt).scalar_one()

    def get_by_slug_or_raise(self, slug: str) -> StatusPage:
        """Get status page by slug"""
        stmt = select(StatusPage).where(StatusPage.slug == slug, StatusPage.deleted_at.is_(None))
        return self.session.execute(stmt).scalar_one()

    def get_by_domain_or_raise(self, domain: str) -> StatusPage:
        """Get status page by domain"""
        stmt = select(StatusPage).where(StatusPage.custom_domain == domain, StatusPage.deleted_at.is_(None))
        return self.session.execute(stmt).scalar_one()

    def get_group_by_id_or_raise(self, id: str) -> StatusPageComponentGroup:
        stmt = (
            select(StatusPageComponentGroup)
            .join(StatusPageItem)
            .join(StatusPage)
            .where(
                StatusPageComponentGroup.id == id,
                StatusPage.deleted_at.is_(None),
                StatusPageComponentGroup.deleted_at.is_(None),
            )
        )
        return self.session.execute(stmt).scalar_one()

    def get_component_by_id_or_raise(self, id: str) -> StatusPageComponent:
        stmt = (
            select(StatusPageComponent)
            .join(StatusPage)
            .where(
                StatusPageComponent.id == id,
                StatusPage.deleted_at.is_(None),
                StatusPageComponent.deleted_at.is_(None),
            )
        )
        return self.session.execute(stmt).scalar_one()

    def get_item_by_id_or_raise(self, id: str) -> StatusPageItem:
        stmt = select(StatusPageItem).where(StatusPageItem.id == id)
        return self.session.execute(stmt).scalar_one()

    def create(self, organisation: Organisation, create_in: CreateStatusPageSchema) -> StatusPage:
        """Create new status page"""
        model = StatusPage()
        model.name = create_in.name
        model.organisation_id = organisation.id
        model.page_type = create_in.page_type
        model.slug = self._generate_slug(create_in.slug)
        model.public_url = f"https://{model.slug}.{settings.STATUS_PAGE_DOMAIN}"

        self.session.add(model)
        self.session.flush()

        for rank, create_item_in in enumerate(create_in.items):
            # A group
            if create_item_in.group and create_item_in.items:
                group = self._create_component_group(status_page=model, create_in=create_item_in.group)

                group_item = StatusPageItem()
                group_item.status_page_id = model.id
                group_item.status_page_component_group_id = group.id
                group_item.rank = rank

                self.session.add(group_item)
                self.session.flush()

                # add children
                for group_item_rank, sub_create_item_in in enumerate(create_item_in.items):
                    group_item_child = StatusPageItem()
                    group_item_child.parent_id = group_item.id
                    group_item_child.status_page_id = model.id
                    group_item_child.rank = group_item_rank

                    self.session.add(group_item_child)
                    self.session.flush()

                    if sub_create_item_in.component:
                        component = self._create_component(model, create_in=sub_create_item_in.component)
                        group_item_child.status_page_component_id = component.id

            if create_item_in.component:
                component = self._create_component(model, create_in=create_item_in.component)

                component_item = StatusPageItem()
                component_item.status_page_id = model.id
                component_item.status_page_component_id = component.id
                component_item.rank = rank

                self.session.add(component_item)
                self.session.flush()

        return model

    def _create_component_group(
        self, status_page: StatusPage, create_in: CreateStatusPageGroupSchema
    ) -> StatusPageComponentGroup:
        """Create a new component group"""
        group = StatusPageComponentGroup()
        group.status_page_id = status_page.id
        group.name = create_in.name
        self.session.add(group)
        self.session.flush()

        return group

    def _create_component(
        self, status_page: StatusPage, create_in: CreateStatusPageComponentSchema
    ) -> StatusPageComponent:
        """Create a new component"""
        model = StatusPageComponent()
        model.status_page_id = status_page.id
        model.name = create_in.name
        model.published_at = datetime.now(tz=timezone.utc)
        self.session.add(model)
        self.session.flush()

        return model

    def _generate_slug(self, name: str) -> str:
        """Generate a slug that is not currently in use"""
        base_slug = generate_slug(name)
        suffix = 1
        while True:
            slug = base_slug + "-" + str(suffix) if suffix > 1 else base_slug
            stmt = select(StatusPage).where(StatusPage.slug == slug).limit(1)
            page = self.session.execute(stmt).scalar_one_or_none()
            if not page:
                return slug

            suffix += 1

    def patch_group(self, group: StatusPageComponentGroup, patch_in: PatchStatusPageGroupSchema) -> None:
        """Update group"""
        for key, value in patch_in.model_dump(exclude_unset=True).items():
            setattr(group, key, value)

        self.session.flush()

    def patch_component(self, component: StatusPageComponent, patch_in: PatchStatusPageComponentSchema) -> None:
        """Update component"""
        for key, value in patch_in.model_dump(exclude_unset=True).items():
            setattr(component, key, value)

        self.session.flush()

    def update_items_rank(self, status_page: StatusPage, update_in: list[UpdateStatusPageItemsRankSchema]):
        for item_data in update_in:
            item = self.get_item_by_id_or_raise(id=item_data.id)
            item.rank = item_data.rank
            if item.parent:
                item.parent_id = None

            if item_data.status_page_items:
                for child_item_data in item_data.status_page_items:
                    child_item = self.get_item_by_id_or_raise(id=child_item_data.id)
                    child_item.rank = child_item_data.rank
                    child_item.parent_id = item.id

        self.session.flush()

    def create_group(self, status_page: StatusPage, create_in: CreateStatusPageGroupSchema) -> StatusPageComponentGroup:
        total_items = len(status_page.status_page_items)

        group = StatusPageComponentGroup()
        group.status_page_id = status_page.id
        group.name = create_in.name
        self.session.add(group)
        self.session.flush()

        item = StatusPageItem()
        item.status_page_id = status_page.id
        item.status_page_component_group_id = group.id
        item.rank = total_items
        self.session.add(item)
        self.session.flush()

        return group

    def create_component(
        self, status_page: StatusPage, create_in: CreateStatusPageComponentSchema
    ) -> StatusPageComponent:
        """Create new component"""
        total_items = len(status_page.status_page_items)

        component = StatusPageComponent()
        component.name = create_in.name
        component.status_page_id = status_page.id
        component.published_at = datetime.now(tz=timezone.utc)
        self.session.add(component)
        self.session.flush()

        item = StatusPageItem()
        item.status_page_id = status_page.id
        item.rank = total_items
        item.status_page_component_id = component.id
        self.session.add(item)
        self.session.flush()

        return component

    def delete_group(self, group: StatusPageComponentGroup) -> None:
        """Delete group"""

        # Check if group has children
        if group.status_page_item.status_page_items:
            raise ValidationError("Group has children")

        group.deleted_at = datetime.now(tz=timezone.utc)

        if group.status_page_item:
            self.session.delete(group.status_page_item)

        self.session.flush()

    def delete_component(self, component: StatusPageComponent) -> None:
        """Delete component"""
        component.deleted_at = datetime.now(tz=timezone.utc)

        # Delete the connected status page item
        if component.status_page_item:
            self.session.delete(component.status_page_item)

        self.session.flush()

    def get_status_page_events(
        self,
        status_page: StatusPage,
        start_date: datetime,
        end_date: datetime,
        incident: StatusPageIncident | None = None,
    ) -> Sequence[StatusPageComponentEvent]:
        """Get all events for a status page"""
        stmt = (
            select(StatusPageComponentEvent)
            .join(StatusPageComponent)
            .join(StatusPage)
            .where(
                StatusPageComponent.status_page_id == status_page.id,
                StatusPageComponentEvent.started_at >= start_date,
                or_(StatusPageComponentEvent.ended_at <= end_date, StatusPageComponentEvent.ended_at.is_(None)),
                StatusPageComponentEvent.deleted_at.is_(None),
            )
            .order_by(StatusPageComponentEvent.created_at.desc())
        )

        if incident:
            stmt = stmt.where(StatusPageComponentEvent.status_page_incident_id == incident.id)

        return self.session.execute(stmt).scalars().all()

    def create_incident(
        self, creator: User, status_page: StatusPage, create_in: CreateStatusPageIncidentSchema
    ) -> StatusPageIncident:
        """Create new incident"""

        # Create incident
        incident = StatusPageIncident()
        incident.status_page_id = status_page.id
        incident.name = create_in.name
        incident.status = create_in.status
        incident.creator_id = creator.id
        incident.published_at = datetime.now(tz=timezone.utc)
        self.session.add(incident)
        self.session.flush()

        # Create incident update
        update = StatusPageIncidentUpdate()
        update.status_page_incident = incident
        update.message = create_in.message
        update.published_at = datetime.now(tz=timezone.utc)
        update.creator_id = creator.id
        update.status = create_in.status
        self.session.add(update)
        self.session.flush()

        for component_id, status in create_in.affected_components.items():
            # Skip operational components
            if status == ComponentStatus.OPERATIONAL:
                continue

            # Add affected components
            affected = StatusPageComponentAffected()
            affected.status_page_incident = incident
            affected.status_page_component_id = component_id
            affected.status = status
            self.session.add(affected)
            self.session.flush()

            # add component update
            component_update = StatusPageComponentUpdate()
            component_update.status_page_component_id = component_id
            component_update.status = status
            component_update.status_page_incident_update = update
            self.session.add(component_update)
            self.session.flush()

            # add event
            event = StatusPageComponentEvent()
            event.status_page_component_id = component_id
            event.status = status
            event.status_page_incident = incident
            event.started_at = datetime.now(tz=timezone.utc)
            self.session.add(event)
            self.session.flush()

        return incident

    def get_component_status(self, status_page: StatusPage):
        stmt = (
            select(
                StatusPageComponentEvent.status_page_component_id,
                func.array_agg(distinct(StatusPageComponentEvent.status)),
            )
            .join(StatusPageIncident)
            .where(
                StatusPageIncident.status_page_id == status_page.id,
                StatusPageComponentEvent.deleted_at.is_(None),
                StatusPageIncident.deleted_at.is_(None),
                StatusPageComponentEvent.ended_at.is_(None),
            )
            .group_by(StatusPageComponentEvent.status_page_component_id)
        )

        result = self.session.execute(stmt).all()
        status_ordered = list(ComponentStatus)
        results: list[ComponentStatusSchema] = []

        for component_id, status_list in result:
            component = self.get_component_by_id_or_raise(component_id)
            indexes = map(status_ordered.index, status_list)
            most_serve_status = status_ordered[max(indexes)]
            item = ComponentStatusSchema(component=component, status=most_serve_status)
            results.append(item)

        return ComponentsCurrentStatusSchema(components=results)

    def get_incidents(
        self, status_page: StatusPage, pagination: PaginationParamsSchema, is_active: bool | None = None
    ) -> Sequence[StatusPageIncident]:
        """Get all incidents for a status page"""
        offset = (pagination.page - 1) * pagination.size
        stmt = (
            select(StatusPageIncident)
            .where(StatusPageIncident.status_page_id == status_page.id, StatusPageIncident.deleted_at.is_(None))
            .order_by(StatusPageIncident.published_at.desc())
            .offset(offset)
            .limit(pagination.size)
        )

        if is_active is True:
            stmt = stmt.where(
                StatusPageIncident.status != StatusPageIncidentStatus.RESOLVED,
            )
        if is_active is False:
            stmt = stmt.where(
                StatusPageIncident.status == StatusPageIncidentStatus.RESOLVED,
            )

        return self.session.execute(stmt).scalars().all()

    def get_incident_or_raise(self, id: str) -> StatusPageIncident:
        """Get incident by ID"""
        stmt = select(StatusPageIncident).where(StatusPageIncident.id == id, StatusPageIncident.deleted_at.is_(None))
        return self.session.execute(stmt).scalar_one()

    def create_incident_update(
        self, creator: User, incident: StatusPageIncident, create_in: CreateStatusPageIncidentUpdateSchema
    ):
        """Create new incident update"""
        now = datetime.now(tz=timezone.utc)
        incident.status = create_in.status

        # Create incident update
        update = StatusPageIncidentUpdate()
        update.status_page_incident = incident
        update.message = create_in.message
        update.published_at = datetime.now(tz=timezone.utc)
        update.creator_id = creator.id
        update.status = create_in.status
        self.session.add(update)
        self.session.flush()

        for component_id, status in create_in.affected_components.items():
            component = self.get_component_by_id_or_raise(component_id)

            # Update affected component status
            affected = self.get_affected_component(incident, component)
            if affected:
                old_rank = ComponentStatus.ranked(affected.status)
                new_rank = ComponentStatus.ranked(status)
                if new_rank > old_rank:
                    affected.status = status
            else:
                affected = StatusPageComponentAffected()
                affected.status_page_incident = incident
                affected.status_page_component_id = component_id
                affected.status = status
                self.session.add(affected)
                self.session.flush()

            # add component update
            component_update = StatusPageComponentUpdate()
            component_update.status_page_component_id = component_id
            component_update.status = status
            component_update.status_page_incident_update = update
            self.session.add(component_update)
            self.session.flush()

            # add event
            event = self.get_most_recent_component_not_ended_event(incident, component)
            if event:
                # If the status is operational, end the current event
                if status == ComponentStatus.OPERATIONAL:
                    event.ended_at = now
                    event.updated_at = now
                    self.session.flush()
                # If the status has changed, end the current event and create a new one
                elif event.status != status:
                    event.ended_at = now
                    event.updated_at = now
                    self.session.flush()

                    event = StatusPageComponentEvent()
                    event.status_page_component_id = component_id
                    event.status = status
                    event.status_page_incident = incident
                    event.started_at = now
                    self.session.add(event)
                    self.session.flush()
                # If the status has not changed, update the event
                else:
                    event.updated_at = now
                    self.session.flush()
            # If there is no event, create a new one
            else:
                if status != ComponentStatus.OPERATIONAL:
                    event = StatusPageComponentEvent()
                    event.status_page_component_id = component_id
                    event.status = status
                    event.status_page_incident = incident
                    event.started_at = now
                    self.session.add(event)
                    self.session.flush()

        return update

    def get_affected_component(
        self, incident: StatusPageIncident, component: StatusPageComponent
    ) -> StatusPageComponentAffected | None:
        """Get affected component"""
        stmt = select(StatusPageComponentAffected).where(
            StatusPageComponentAffected.status_page_incident_id == incident.id,
            StatusPageComponentAffected.status_page_component_id == component.id,
        )
        return self.session.execute(stmt).scalar_one_or_none()

    def get_most_recent_component_not_ended_event(
        self, incident: StatusPageIncident, component: StatusPageComponent
    ) -> StatusPageComponentEvent | None:
        """Get most recent component event that has not ended"""
        stmt = (
            select(StatusPageComponentEvent)
            .where(
                StatusPageComponentEvent.status_page_component_id == component.id,
                StatusPageComponentEvent.status_page_incident_id == incident.id,
                StatusPageComponentEvent.deleted_at.is_(None),
                StatusPageComponentEvent.ended_at.is_(None),
            )
            .order_by(StatusPageComponentEvent.created_at.desc())
            .limit(1)
        )
        return self.session.execute(stmt).scalar_one_or_none()

    def patch_status_page(self, status_page: StatusPage, patch_in: PatchStatusPageSchema):
        for key, value in patch_in.model_dump(exclude_unset=True).items():
            if key == "slug":
                if not self._check_slug_is_unique(value, status_page):
                    raise FormFieldValidationError("Slug is already in use", "slug")
                status_page.public_url = f"https://{value}.{settings.STATUS_PAGE_DOMAIN}"
                status_page.slug = value
            else:
                setattr(status_page, key, value)

        self.session.flush()

    def _check_slug_is_unique(self, slug: str, exclude_status_page: StatusPage) -> bool:
        """Check if a slug is unique"""
        stmt = select(StatusPage).where(StatusPage.slug == slug, StatusPage.id != exclude_status_page.id).limit(1)
        return not self.session.execute(stmt).scalar_one_or_none()
