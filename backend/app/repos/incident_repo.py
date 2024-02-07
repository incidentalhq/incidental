from typing import Sequence

from sqlalchemy import func, select

from app.models import (
    Incident,
    IncidentRole,
    IncidentRoleAssignment,
    IncidentRoleKind,
    IncidentSeverity,
    IncidentStatus,
    IncidentStatusCategoryEnum,
    IncidentType,
    Organisation,
    User,
)
from app.schemas.resources import PaginatedResults

from .base_repo import BaseRepo


class IncidentRepo(BaseRepo):
    def create_incident_type(self, organisation: Organisation, name: str, description: str) -> IncidentType:
        model = IncidentType()
        model.organisation_id = organisation.id
        model.name = name
        model.description = description

        self.session.add(model)
        self.session.flush()
        return model

    def search_incidents(
        self, organisation: Organisation, query: str | None, page: int = 1, size: int = 25
    ) -> PaginatedResults[Incident]:
        search_term = query

        # get total
        total_stmt = select(func.count(Incident.id)).where(
            Incident.deleted_at.is_(None), Incident.organisation_id == organisation.id
        )
        if query:
            total_stmt = total_stmt.where(Incident.name.ilike(search_term))
        total = self.session.scalar(total_stmt) or 0

        # get actual results
        stmt = select(Incident).where(Incident.deleted_at.is_(None), Incident.organisation_id == organisation.id)
        if query is not None:
            stmt = stmt.where(Incident.name.ilike(search_term))

        offset = (page - 1) * size
        stmt = stmt.offset(offset).limit(size)

        records = self.session.scalars(stmt).all()

        return PaginatedResults(total=total, page=page, size=size, items=records)

    def get_all(self, organisation: Organisation) -> Sequence[IncidentType]:
        stmt = select(IncidentType).where(
            IncidentType.organisation_id == organisation.id, IncidentType.deleted_at.is_(None)
        )

        return self.session.scalars(stmt).all()

    def get_severity_by_id(self, id: str) -> IncidentSeverity | None:
        stmt = select(IncidentSeverity).where(IncidentSeverity.id == id, IncidentSeverity.deleted_at.is_(None)).limit(1)
        return self.session.scalar(stmt)

    def get_type_by_id(self, id: str) -> IncidentType | None:
        stmt = select(IncidentType).where(IncidentType.id == id, IncidentType.deleted_at.is_(None)).limit(1)
        return self.session.scalar(stmt)

    def create_incident(
        self,
        organisation: Organisation,
        user: User,
        name: str,
        status: IncidentStatus,
        severity: IncidentSeverity,
        type: IncidentType,
        reference: str,
        slack_channel_id: str,
        slack_channel_name: str,
    ) -> Incident:
        model = Incident()
        model.organisation_id = organisation.id
        model.creator_id = user.id
        model.name = name
        model.incident_type_id = type.id
        model.incident_status_id = status.id
        model.incident_severity_id = severity.id
        model.reference = reference
        model.slack_channel_id = slack_channel_id
        model.slack_channel_name = slack_channel_name

        self.session.add(model)
        self.session.flush()

        return model

    def get_incident_status_by_id(self, id: str) -> IncidentStatus | None:
        stmt = select(IncidentStatus).where(IncidentStatus.id == id, IncidentStatus.deleted_at.is_(None)).limit(1)
        return self.session.scalar(stmt)

    def create_incident_status(
        self, organisation: Organisation, name: str, sort_order: int, category: IncidentStatusCategoryEnum
    ) -> IncidentStatus:
        """Create new incident status"""
        model = IncidentStatus()
        model.organisation_id = organisation.id
        model.name = name
        model.sort_order = sort_order
        model.category = category

        self.session.add(model)
        self.session.flush()

        return model

    def get_incident_status_by_name(self, organisation: Organisation, name: str) -> IncidentStatus | None:
        stmt = (
            select(IncidentStatus)
            .where(
                IncidentStatus.organisation_id == organisation.id,
                IncidentStatus.deleted_at.is_(None),
                IncidentStatus.name == name,
            )
            .limit(1)
        )

        return self.session.scalar(stmt)

    def get_total_incidents(self, organisation: Organisation) -> int:
        stmt = select(func.count(Incident.id)).where(Incident.organisation_id == organisation.id)

        return self.session.scalar(stmt) or 0

    def assign_role(self, incident: Incident, role: IncidentRole, user: User) -> IncidentRoleAssignment:
        model = IncidentRoleAssignment()
        model.user_id = user.id
        model.incident_role_id = role.id
        model.incident_id = incident.id

        self.session.add(model)
        self.session.flush()

        return model

    def get_role(self, organisation: Organisation, kind: IncidentRole) -> IncidentRole | None:
        stmt = (
            select(IncidentRole)
            .where(
                IncidentRole.organisation_id == organisation.id,
                IncidentRole.kind == kind,
                IncidentRole.deleted_at.is_(None),
            )
            .limit(1)
        )

        return self.session.scalar(stmt)

    def create_role(
        self, organisation: Organisation, name: str, description: str, kind: IncidentRoleKind, slack_reference: str
    ) -> IncidentRole:
        model = IncidentRole()
        model.organisation_id = organisation.id
        model.name = name
        model.description = description
        model.kind = kind
        model.slack_reference = slack_reference

        self.session.add(model)
        self.session.flush()

        return model
