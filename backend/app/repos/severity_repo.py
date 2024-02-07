from typing import Sequence

from sqlalchemy import select

from app.models import IncidentSeverity, Organisation

from .base_repo import BaseRepo


class SeverityRepo(BaseRepo):
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
            IncidentSeverity.organisation_id == organisation.id, IncidentSeverity.deleted_at.is_(None)
        )

        return self.session.scalars(stmt).all()
