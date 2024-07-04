import structlog
from fastapi import APIRouter

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession
from app.exceptions import FormFieldValidationError, NotPermittedError
from app.models import IncidentRoleKind
from app.repos import IncidentRepo
from app.schemas.actions import CreateIncidentRoleSchema, UpdateIncidentRoleSchema
from app.schemas.models import IncidentRoleSchema
from app.schemas.resources import PaginatedResults

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Severities"])


@router.get("/search", response_model=PaginatedResults[IncidentRoleSchema])
async def roles_search(user: CurrentUser, db: DatabaseSession, organisation: CurrentOrganisation):
    """Search for all roles within the organisation"""
    incident_repo = IncidentRepo(session=db)

    roles = incident_repo.get_all_incident_roles(organisation=organisation)
    total = len(roles)

    return PaginatedResults(total=total, page=1, size=total, items=roles)


@router.post("", response_model=IncidentRoleSchema)
async def role_create(
    create_in: CreateIncidentRoleSchema,
    user: CurrentUser,
    db: DatabaseSession,
    organisation: CurrentOrganisation,
):
    """Create a new role"""
    incident_repo = IncidentRepo(session=db)

    existing_role = incident_repo.get_incident_role_by_slack_reference(
        organisation=organisation, slack_reference=create_in.slack_reference
    )

    if existing_role:
        raise FormFieldValidationError("That slack reference is already in use", attribute="slackReference")

    role = incident_repo.create_incident_role(
        organisation=organisation,
        name=create_in.name,
        description=create_in.description,
        kind=IncidentRoleKind.CUSTOM,
        slack_reference=create_in.slack_reference,
    )

    db.commit()

    return role


@router.put("/{id}", response_model=IncidentRoleSchema)
async def role_update(id: str, update_in: UpdateIncidentRoleSchema, user: CurrentUser, db: DatabaseSession):
    """Update a role"""
    incident_repo = IncidentRepo(session=db)
    role = incident_repo.get_incident_role_by_id_or_raise(id)

    if not user.belongs_to(role.organisation):
        raise NotPermittedError()

    incident_repo.update_role(role=role, update_in=update_in)

    db.commit()

    return role


@router.delete("/{id}")
async def role_delete(id: str, user: CurrentUser, db: DatabaseSession):
    """Delete a role"""
    incident_repo = IncidentRepo(session=db)
    role = incident_repo.get_incident_role_by_id_or_raise(id)

    if not user.belongs_to(role.organisation):
        raise NotPermittedError()

    incident_repo.delete_role(role=role)

    db.commit()

    return None
