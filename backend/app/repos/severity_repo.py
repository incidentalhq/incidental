from typing import Sequence

from sqlalchemy import func, select

from app.models import IncidentSeverity, Organisation
from app.schemas.actions import PatchSeveritySchema

from .base_repo import BaseRepo


class SeverityRepo(BaseRepo):
    def get_severity_by_name(self, organisation: Organisation, name: str) -> IncidentSeverity | None:
        stmt = (
            select(IncidentSeverity)
            .where(
                IncidentSeverity.name == name,
                IncidentSeverity.deleted_at.is_(None),
                IncidentSeverity.organisation_id == organisation.id,
            )
            .limit(1)
        )
        return self.session.scalar(stmt)

    def get_severity_by_id(self, id: str) -> IncidentSeverity | None:
        stmt = select(IncidentSeverity).where(IncidentSeverity.id == id, IncidentSeverity.deleted_at.is_(None)).limit(1)
        return self.session.scalar(stmt)

    def get_severity_by_id_or_raise(self, id: str) -> IncidentSeverity:
        stmt = select(IncidentSeverity).where(IncidentSeverity.id == id, IncidentSeverity.deleted_at.is_(None)).limit(1)
        return self.session.scalars(stmt).one()

    def create_severity(self, organisation: Organisation, name: str, description: str, rating: int) -> IncidentSeverity:
        model = IncidentSeverity()
        model.name = name
        model.organisation_id = organisation.id
        model.description = description
        model.rating = rating

        self.session.add(model)
        self.session.flush()

        return model

    def get_all(self, organisation: Organisation) -> Sequence[IncidentSeverity]:
        stmt = select(IncidentSeverity).where(
            IncidentSeverity.organisation_id == organisation.id,
            IncidentSeverity.deleted_at.is_(None),
        )

        return self.session.scalars(stmt).all()

    def get_next_rating(self, organisation: Organisation) -> int:
        highest = (
            select(func.max(IncidentSeverity.rating))
            .where(IncidentSeverity.organisation_id == organisation.id)
            .limit(1)
        )
        row = self.session.scalar(highest)
        if not row:
            return 0

        return row + 1

    def patch_severity(self, severity: IncidentSeverity, patch_in: PatchSeveritySchema) -> None:
        for field, value in patch_in.model_dump(exclude_unset=True).items():
            setattr(severity, field, value)

        self.session.flush()
