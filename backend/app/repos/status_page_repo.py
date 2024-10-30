from typing import Sequence

from sqlalchemy import select

from app.env import settings
from app.models import Organisation, StatusPage, User
from app.repos.base_repo import BaseRepo
from app.schemas.actions import CreateStatusPageSchema
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

        for create_item_in in create_in.items:
            if create_item_in.group:
                pass

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
