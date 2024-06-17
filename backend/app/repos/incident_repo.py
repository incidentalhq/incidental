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
    IncidentUpdate,
    Organisation,
    User,
)
from app.schemas.actions import ExtendedPatchIncidentSchema
from app.schemas.resources import PaginatedResults

from .base_repo import BaseRepo


class IncidentRepo(BaseRepo):
    def get_incident_by_id(self, id: str) -> Incident | None:
        stmt = select(Incident).where(Incident.id == id).limit(1)
        return self.session.scalar(stmt)

    def get_incident_by_id_or_raise(self, id: str) -> Incident:
        """Get incident, raise if not found"""
        stmt = select(Incident).where(Incident.id == id).limit(1)
        return self.session.scalars(stmt).one()

    def create_incident_type(self, organisation: Organisation, name: str, description: str) -> IncidentType:
        model = IncidentType()
        model.organisation_id = organisation.id
        model.name = name
        model.description = description

        self.session.add(model)
        self.session.flush()
        return model

    def search_incidents(
        self,
        organisation: Organisation,
        query: str | None = None,
        status_categories: list[IncidentStatusCategoryEnum] | None = None,
        page: int = 1,
        size: int = 25,
    ) -> PaginatedResults[Incident]:
        search_term = query

        # get total
        total_stmt = select(func.count(Incident.id)).where(
            Incident.deleted_at.is_(None), Incident.organisation_id == organisation.id
        )
        if query:
            total_stmt = total_stmt.where(Incident.name.ilike(search_term))
        if status_categories:
            total_stmt = total_stmt.join(IncidentStatus).where(IncidentStatus.category.in_(status_categories))

        total = self.session.scalar(total_stmt) or 0

        # get actual results
        stmt = select(Incident).where(Incident.deleted_at.is_(None), Incident.organisation_id == organisation.id)
        if query is not None:
            stmt = stmt.where(Incident.name.ilike(search_term))
        if status_categories:
            stmt = stmt.join(IncidentStatus).where(IncidentStatus.category.in_(status_categories))

        offset = (page - 1) * size
        stmt = stmt.order_by(Incident.created_at.desc()).offset(offset).limit(size)

        records = self.session.scalars(stmt).all()

        return PaginatedResults(total=total, page=page, size=size, items=records)

    def get_all_incidents(self, organisation: Organisation) -> Sequence[Incident]:
        stmt = select(Incident).where(Incident.organisation_id == organisation.id, Incident.deleted_at.is_(None))

        return self.session.scalars(stmt).all()

    def get_all_incident_types(self, organisation: Organisation) -> Sequence[IncidentType]:
        stmt = select(IncidentType).where(
            IncidentType.organisation_id == organisation.id, IncidentType.deleted_at.is_(None)
        )

        return self.session.scalars(stmt).all()

    def get_incident_severity_by_id_or_throw(self, id: str) -> IncidentSeverity:
        stmt = select(IncidentSeverity).where(IncidentSeverity.id == id, IncidentSeverity.deleted_at.is_(None)).limit(1)
        return self.session.scalars(stmt).one()

    def get_incident_type_by_id(self, id: str) -> IncidentType | None:
        stmt = select(IncidentType).where(IncidentType.id == id, IncidentType.deleted_at.is_(None)).limit(1)
        return self.session.scalar(stmt)

    def get_incident_type_by_name(self, organisation: Organisation, name: str) -> IncidentType | None:
        stmt = (
            select(IncidentType)
            .where(
                IncidentType.name == name,
                IncidentType.deleted_at.is_(None),
                IncidentType.organisation_id == organisation.id,
            )
            .limit(1)
        )
        return self.session.scalar(stmt)

    def create_incident(
        self,
        organisation: Organisation,
        user: User,
        name: str,
        summary: str,
        status: IncidentStatus,
        severity: IncidentSeverity,
        type: IncidentType,
        reference: str,
        slack_channel_id: str | None = None,
        slack_channel_name: str | None = None,
    ) -> Incident:
        model = Incident()
        model.organisation_id = organisation.id
        model.creator_id = user.id
        model.name = name
        model.description = summary
        model.incident_type_id = type.id
        model.incident_status_id = status.id
        model.incident_severity_id = severity.id
        model.reference = reference
        model.slack_channel_id = slack_channel_id
        model.slack_channel_name = slack_channel_name

        self.session.add(model)
        self.session.flush()

        return model

    def get_incident_status_by_id_or_throw(self, id: str) -> IncidentStatus:
        stmt = select(IncidentStatus).where(IncidentStatus.id == id, IncidentStatus.deleted_at.is_(None)).limit(1)
        return self.session.scalars(stmt).one()

    def create_incident_status(
        self,
        organisation: Organisation,
        name: str,
        sort_order: int,
        category: IncidentStatusCategoryEnum,
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
        # if that role has already been assigned, update the user
        for role_assignment in incident.incident_role_assignments:
            if role_assignment.incident_role.id == role.id:
                role_assignment.user_id = user.id
                return role_assignment

        # otherwise create a new role assignment
        model = IncidentRoleAssignment()
        model.user_id = user.id
        model.incident_role_id = role.id
        model.incident_id = incident.id

        self.session.add(model)
        self.session.flush()

        return model

    def get_incident_role(self, organisation: Organisation, kind: IncidentRoleKind) -> IncidentRole | None:
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

    def create_incident_role(
        self,
        organisation: Organisation,
        name: str,
        description: str,
        kind: IncidentRoleKind,
        slack_reference: str,
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

    def get_incident_by_slack_channel_id(self, id: str) -> Incident | None:
        stmt = select(Incident).where(Incident.slack_channel_id == id, Incident.deleted_at.is_(None)).limit(1)

        return self.session.scalar(stmt)

    def get_all_incident_statuses(self, organisation: Organisation) -> Sequence[IncidentStatus]:
        stmt = select(IncidentStatus).where(
            IncidentStatus.organisation_id == organisation.id, IncidentStatus.deleted_at.is_(None)
        )

        return self.session.scalars(stmt).all()

    def get_all_incident_roles(self, organisation: Organisation) -> Sequence[IncidentRole]:
        stmt = select(IncidentRole).where(
            IncidentRole.organisation_id == organisation.id, IncidentRole.deleted_at.is_(None)
        )
        return self.session.scalars(stmt).all()

    def create_incident_update(
        self,
        incident: Incident,  # must be current state of incident before updates to sev or status
        creator: User,
        new_status: IncidentStatus | None = None,
        new_severity: IncidentSeverity | None = None,
        summary: str | None = None,
    ) -> IncidentUpdate:
        """Create new incident update"""
        if new_status is None and new_severity is None and summary is None:
            raise ValueError("status, severity or summary must be the set")

        model = IncidentUpdate()
        model.incident_id = incident.id
        model.creator_id = creator.id
        model.summary = summary

        if new_severity and new_severity.id != incident.incident_severity_id:
            model.new_incident_severity_id = new_severity.id
            model.previous_incident_severity_id = incident.incident_severity_id
            incident.incident_severity_id = new_severity.id

        if new_status and new_status.id != incident.incident_status_id:
            model.new_incident_status_id = new_status.id
            model.previous_incident_status_id = incident.incident_status_id
            incident.incident_status_id = new_status.id

        self.session.add(model)
        self.session.flush()

        return model

    def get_incident_updates(
        self, incident: Incident, page: int = 1, size: int = 25
    ) -> PaginatedResults[IncidentUpdate]:
        """Get incident updates"""
        stmt = select().where(IncidentUpdate.incident_id == incident.id, IncidentUpdate.deleted_at.is_(None))

        # get total
        total_stmt = stmt.add_columns(func.count(IncidentUpdate.id))
        total = self.session.scalar(total_stmt)

        # get paginated results
        offset = (page - 1) * size
        results_stmt = (
            stmt.add_columns(IncidentUpdate)
            .order_by(IncidentUpdate.created_at.desc())
            .offset(offset=offset)
            .limit(limit=size)
        )
        results = self.session.scalars(results_stmt).all()

        return PaginatedResults(total=total, page=page, size=size, items=results)

    def patch_incident(self, incident: Incident, patch_in: ExtendedPatchIncidentSchema) -> None:
        for field, value in patch_in.model_dump(exclude_unset=True).items():
            if field == "incident_status":
                incident.incident_status_id = value["id"]
            elif field == "incident_severity":
                incident.incident_severity_id = value["id"]
            else:
                setattr(incident, field, value)

        self.session.flush()

    def get_incident_update_by_id(self, id: str) -> IncidentUpdate | None:
        """Get incident update"""
        stmt = select(IncidentUpdate).where(IncidentUpdate.id == id, IncidentUpdate.deleted_at.is_(None))

        return self.session.scalar(stmt)
