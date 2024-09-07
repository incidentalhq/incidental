from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Literal, Sequence

from sqlalchemy import Row, and_, delete, func, select

from app.exceptions import FormFieldValidationError, ValidationError
from app.models import (
    Field,
    Incident,
    IncidentFieldValue,
    IncidentRole,
    IncidentRoleAssignment,
    IncidentRoleKind,
    IncidentSeverity,
    IncidentStatus,
    IncidentStatusCategoryEnum,
    IncidentType,
    IncidentTypeField,
    IncidentUpdate,
    InterfaceKind,
    Organisation,
    User,
)
from app.schemas.actions import (
    ExtendedPatchIncidentSchema,
    PatchIncidentFieldValuesSchema,
    PatchIncidentSchema,
    PatchIncidentTypeSchema,
    UpdateIncidentRoleSchema,
)
from app.schemas.models import ModelIdSchema
from app.schemas.resources import PaginatedResults

from .base_repo import BaseRepo


@dataclass
class AssignRoleResult:
    assignment: IncidentRoleAssignment
    type: Literal["no_change"] | Literal["user_changed"] | Literal["new_assignment"]


class IncidentRepo(BaseRepo):
    def get_incident_by_id(self, id: str) -> Incident | None:
        stmt = select(Incident).where(Incident.id == id).limit(1)
        return self.session.scalar(stmt)

    def get_incident_by_id_or_raise(self, id: str) -> Incident:
        """Get incident, raise if not found"""
        stmt = select(Incident).where(Incident.id == id).limit(1)
        return self.session.scalars(stmt).one()

    def create_incident_type(
        self,
        organisation: Organisation,
        name: str,
        description: str,
        is_editable: bool = True,
        is_deletable: bool = True,
        fields: list[ModelIdSchema] | None = None,
        is_default: bool = False,
    ) -> IncidentType:
        model = IncidentType()
        model.organisation_id = organisation.id
        model.name = name
        model.description = description
        model.is_deletable = is_deletable
        model.is_editable = is_editable
        model.is_default = is_default
        self.session.add(model)
        self.session.flush()

        if fields:
            for field_item in fields:
                field = self.session.query(Field).get(field_item.id)
                if field:
                    rel = IncidentTypeField()
                    rel.incident_type_id = model.id
                    rel.field_id = field.id
                    self.session.add(rel)
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

    def get_incident_type_by_id_or_throw(self, id: str) -> IncidentType:
        stmt = select(IncidentType).where(IncidentType.id == id, IncidentType.deleted_at.is_(None)).limit(1)
        return self.session.scalars(stmt).one()

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
        reference_id: int,
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
        model.reference_id = reference_id
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
        rank: int,
        category: IncidentStatusCategoryEnum,
        description: str | None = None,
    ) -> IncidentStatus:
        """Create new incident status"""
        model = IncidentStatus()
        model.organisation_id = organisation.id
        model.name = name
        model.rank = rank
        model.category = category
        model.description = description

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

    def get_incident_statuses_by_category(
        self, organisation: Organisation, category: IncidentStatusCategoryEnum
    ) -> Sequence[IncidentStatus]:
        """Get all incident status by category, ordered by rank"""
        stmt = (
            select(IncidentStatus)
            .where(
                IncidentStatus.organisation_id == organisation.id,
                IncidentStatus.deleted_at.is_(None),
                IncidentStatus.category == category,
            )
            .order_by(IncidentStatus.rank.asc())
        )

        return self.session.scalars(stmt).all()

    def get_total_incidents(self, organisation: Organisation) -> int:
        stmt = select(func.count(Incident.id)).where(Incident.organisation_id == organisation.id)

        return self.session.scalar(stmt) or 0

    def assign_role(self, incident: Incident, role: IncidentRole, user: User) -> AssignRoleResult:
        # if that role has already been assigned, update the user
        for role_assignment in incident.incident_role_assignments:
            if role_assignment.incident_role.id == role.id:
                if role_assignment.user_id == user.id:
                    return AssignRoleResult(assignment=role_assignment, type="no_change")
                else:
                    role_assignment.user_id = user.id
                    return AssignRoleResult(assignment=role_assignment, type="user_changed")

        # otherwise create a new role assignment
        model = IncidentRoleAssignment()
        model.user_id = user.id
        model.incident_role_id = role.id
        model.incident_id = incident.id

        self.session.add(model)
        self.session.flush()

        return AssignRoleResult(assignment=model, type="new_assignment")

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

    def get_incident_role_by_slack_reference(
        self, organisation: Organisation, slack_reference: str
    ) -> IncidentRole | None:
        """Find a role by it's slack reference"""
        stmt = (
            select(IncidentRole)
            .where(
                IncidentRole.organisation_id == organisation.id,
                IncidentRole.deleted_at.is_(None),
                IncidentRole.slack_reference == slack_reference,
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
        is_editable: bool = True,
        is_deletable: bool = True,
    ) -> IncidentRole:
        model = IncidentRole()
        model.organisation_id = organisation.id
        model.name = name
        model.description = description
        model.kind = kind
        model.slack_reference = slack_reference
        model.is_editable = is_editable
        model.is_deletable = is_deletable

        self.session.add(model)
        self.session.flush()

        return model

    def get_incident_by_slack_channel_id(self, id: str) -> Incident | None:
        """Get the incident associated with a slack channel"""
        stmt = select(Incident).where(Incident.slack_channel_id == id, Incident.deleted_at.is_(None)).limit(1)

        return self.session.scalar(stmt)

    def get_all_incident_statuses(self, organisation: Organisation) -> Sequence[IncidentStatus]:
        """Get all statuses for an organisation ordered by rank"""
        stmt = (
            select(IncidentStatus)
            .where(IncidentStatus.organisation_id == organisation.id, IncidentStatus.deleted_at.is_(None))
            .order_by(IncidentStatus.rank.asc())
        )

        return self.session.scalars(stmt).all()

    def get_all_incident_roles(self, organisation: Organisation) -> Sequence[IncidentRole]:
        """Get all roles for an organisation"""
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

    def patch_incident(self, incident: Incident, patch_in: ExtendedPatchIncidentSchema | PatchIncidentSchema) -> None:
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

    def get_incident_role_by_id_or_raise(self, id: str) -> IncidentRole:
        stmt = select(IncidentRole).where(IncidentRole.id == id).limit(1)

        return self.session.scalars(stmt).one()

    def remove_role_assignment(self, incident: Incident, role: IncidentRole) -> None:
        """Remove role assignment for incident"""
        # if that role has already been assigned, update the user
        for role_assignment in incident.incident_role_assignments:
            if role_assignment.incident_role.id == role.id:
                self.session.delete(role_assignment)
                self.session.flush()
                return

        raise ValidationError("Role assignment was not found")

    def update_role(self, role: IncidentRole, update_in: UpdateIncidentRoleSchema) -> None:
        """Update role"""

        # check this slack reference isn't already in use
        if in_use_slack_reference := self.get_incident_role_by_slack_reference(
            organisation=role.organisation, slack_reference=update_in.slack_reference
        ):
            if in_use_slack_reference.id != role.id:
                raise FormFieldValidationError("This slack reference is already in use", attribute="slackReference")

        role.name = update_in.name
        role.description = update_in.description
        role.slack_reference = update_in.slack_reference

        if update_in.guide:
            role.guide = update_in.guide

        self.session.flush()

    def delete_role(self, role: IncidentRole) -> None:
        """Delete role"""
        role.deleted_at = datetime.now(tz=timezone.utc)
        self.session.flush()

    def get_incident_field_values(self, incident: Incident) -> Sequence[IncidentFieldValue]:
        """Get all field values for an incident"""
        stmt = select(IncidentFieldValue).where(
            IncidentFieldValue.incident_id == incident.id, IncidentFieldValue.deleted_at.is_(None)
        )

        return self.session.scalars(stmt).all()

    def get_incident_fields_with_values(self, incident: Incident) -> Sequence[Row[tuple[Field, IncidentFieldValue]]]:
        """Get all custom fields for an incident based on it's type, then join on value"""
        stmt = (
            select(Field, IncidentFieldValue)
            .join(IncidentTypeField)
            .join(
                IncidentFieldValue,
                onclause=and_(
                    IncidentFieldValue.incident_id == incident.id,
                    IncidentFieldValue.field_id == Field.id,
                ),
                isouter=True,
            )
            .where(
                IncidentTypeField.incident_type_id == incident.incident_type_id,
            )
        )

        return self.session.execute(stmt).all()

    def patch_incident_type(self, incident_type: IncidentType, patch_in: PatchIncidentTypeSchema):
        """Patch IncidentType"""
        for key, value in patch_in.model_dump(exclude_unset=True).items():
            if key == "fields":
                self._update_incident_type_fields(incident_type=incident_type, fields=value)
            else:
                setattr(incident_type, key, value)

        self.session.flush()

    def _update_incident_type_fields(self, incident_type: IncidentType, fields: list[dict[str, str]]) -> None:
        """Patch the fields which are available for an incident type"""
        # remove existing associations
        stmt = delete(IncidentTypeField).where(IncidentTypeField.incident_type_id == incident_type.id)
        self.session.execute(stmt)

        # add new fields
        for field_item in fields:
            field = self.session.query(Field).get(field_item["id"])
            if field:
                model = IncidentTypeField()
                model.incident_type_id = incident_type.id
                model.field_id = field.id
                self.session.add(model)
                self.session.flush()

    def patch_incident_custom_fields(self, incident: Incident, patch_in: PatchIncidentFieldValuesSchema) -> None:
        """Patch incident field value schema"""
        for item in patch_in.root:
            field_stmt = select(Field).where(Field.id == item.field.id).limit(1)
            field = self.session.scalars(field_stmt).one()

            self._create_or_update_incident_field_value(incident=incident, field=field, value=item.value)

    def _create_or_update_incident_field_value(
        self, incident: Incident, field: Field, value: str | list[str]
    ) -> IncidentFieldValue:
        field_value = self.get_incident_field_value(incident=incident, field=field)

        # create new incident field value if it doesn't exist
        if not field_value:
            field_value = IncidentFieldValue()
            field_value.incident_id = incident.id
            field_value.field_id = field.id
            self.session.add(field_value)

        match field.interface_kind:
            case InterfaceKind.SINGLE_SELECT:
                field_value.value_single_select = value  # type: ignore
            case InterfaceKind.MULTI_SELECT:
                field_value.value_multi_select = value  # type: ignore
            case InterfaceKind.TEXT:
                field_value.value_text = value  # type: ignore
            case InterfaceKind.TEXTAREA:
                field_value.value_text = value  # type: ignore
            case _:
                raise ValueError("Unkown interface kind")

        self.session.flush()
        return field_value

    def get_incident_field_value(self, incident: Incident, field: Field) -> IncidentFieldValue | None:
        stmt = (
            select(IncidentFieldValue)
            .where(
                IncidentFieldValue.incident_id == incident.id,
                IncidentFieldValue.field_id == field.id,
                IncidentFieldValue.deleted_at.is_(None),
            )
            .limit(1)
        )
        return self.session.scalar(stmt)

    def delete_incident_type(self, incident_type: IncidentType) -> None:
        incident_type.deleted_at = datetime.now(tz=timezone.utc)
        self.session.flush()
