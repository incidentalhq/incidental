from sqlalchemy import select

from app.models import Lifecycle, Organisation
from app.schemas.actions import PatchLifecycleSchema

from .base_repo import BaseRepo


class LifecycleRepo(BaseRepo):
    def create_lifecycle(self, organisation: Organisation) -> Lifecycle:
        """Create default lifecycle for organisation"""
        model = Lifecycle()
        model.name = "Default"
        model.organisation_id = organisation.id
        model.is_default = True
        model.is_deletable = False
        model.is_triage_available = True
        self.session.add(model)
        self.session.flush()
        return model

    def get_lifecycle_for_organisation_or_raise(self, organisation: Organisation) -> Lifecycle:
        stmt = select(Lifecycle).where(Lifecycle.organisation_id == organisation.id).limit(1)

        return self.session.scalars(stmt).one()

    def get_lifecycle_by_id_or_raise(self, id: str) -> Lifecycle:
        stmt = select(Lifecycle).where(Lifecycle.id == id).limit(1)

        return self.session.scalars(stmt).one()

    def patch_lifecycle(self, lifecycle: Lifecycle, patch_in: PatchLifecycleSchema):
        for key, value in patch_in.model_dump(exclude_unset=True).items():
            setattr(lifecycle, key, value)
