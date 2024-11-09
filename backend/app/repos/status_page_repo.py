from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import select

from app.env import settings
from app.exceptions import ValidationError
from app.models import (
    Organisation,
    StatusPage,
    StatusPageComponent,
    StatusPageComponentEvent,
    StatusPageComponentGroup,
    StatusPageItem,
)
from app.repos.base_repo import BaseRepo
from app.schemas.actions import (
    CreateStatusPageComponentSchema,
    CreateStatusPageGroupSchema,
    CreateStatusPageSchema,
    PatchStatusPageComponentSchema,
    PatchStatusPageGroupSchema,
    UpdateStatusPageItemsRankSchema,
)
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
        model.slug = self._generate_slug(create_in.name)
        model.public_url = settings.STATUS_PAGE_URL + "/" + model.slug

        self.session.add(model)
        self.session.flush()

        for rank, create_item_in in enumerate(create_in.items):
            # A group
            if create_item_in.group and create_item_in.items:
                group = self._create_component_group(create_in=create_item_in.group)

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

    def _create_component_group(self, create_in: CreateStatusPageGroupSchema) -> StatusPageComponentGroup:
        group = StatusPageComponentGroup()
        group.name = create_in.name
        self.session.add(group)
        self.session.flush()

        return group

    def _create_component(
        self, status_page: StatusPage, create_in: CreateStatusPageComponentSchema
    ) -> StatusPageComponent:
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
        self, status_page: StatusPage, start_date: datetime, end_date: datetime
    ) -> Sequence[StatusPageComponentEvent]:
        """Get all events for a status page"""
        stmt = (
            select(StatusPageComponentEvent)
            .join(StatusPageComponent)
            .join(StatusPage)
            .where(
                StatusPageComponent.status_page_id == status_page.id,
                StatusPageComponentEvent.started_at >= start_date,
                StatusPageComponentEvent.ended_at <= end_date,
                StatusPageComponentEvent.deleted_at.is_(None),
            )
            .order_by(StatusPageComponentEvent.created_at.desc())
        )
        return self.session.execute(stmt).scalars().all()
