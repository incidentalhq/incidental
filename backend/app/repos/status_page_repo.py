from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import select

from app.env import settings
from app.models import Organisation, StatusPage, StatusPageComponent, StatusPageComponentGroup, StatusPageItem
from app.repos.base_repo import BaseRepo
from app.schemas.actions import CreateStatusPageComponent, CreateStatusPageComponentGroup, CreateStatusPageSchema
from app.utils import generate_slug


class StatusPageRepo(BaseRepo):
    def search(self, organisation: Organisation) -> Sequence[StatusPage]:
        """Search for status pages within an organisation"""
        stmt = select(StatusPage).where(StatusPage.organisation_id == organisation.id)

        return self.session.scalars(stmt).all()

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

    def _create_component_group(self, create_in: CreateStatusPageComponentGroup) -> StatusPageComponentGroup:
        group = StatusPageComponentGroup()
        group.name = create_in.name
        self.session.add(group)
        self.session.flush()

        return group

    def _create_component(self, status_page: StatusPage, create_in: CreateStatusPageComponent) -> StatusPageComponent:
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
