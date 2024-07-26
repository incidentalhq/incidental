import structlog
from fastapi import APIRouter, Response, status

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession
from app.exceptions import NotPermittedError
from app.repos import IncidentRepo
from app.schemas.actions import CreateIncidentTypeSchema, PatchIncidentTypeSchema
from app.schemas.models import IncidentTypeSchema
from app.schemas.resources import PaginatedResults

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Fields"])


@router.get("/search", response_model=PaginatedResults[IncidentTypeSchema])
async def incident_types_search(
    _: CurrentUser,
    db: DatabaseSession,
    organisation: CurrentOrganisation,
):
    """Get incident_types for organisation"""
    incident_repo = IncidentRepo(session=db)
    results = incident_repo.get_all_incident_types(organisation=organisation)

    return PaginatedResults(total=len(results), page=1, size=len(results), items=results)


@router.post("", response_model=IncidentTypeSchema)
async def incident_types_create(
    _: CurrentUser,
    db: DatabaseSession,
    create_in: CreateIncidentTypeSchema,
    organisation: CurrentOrganisation,
):
    """Create a new incident type"""
    incident_repo = IncidentRepo(session=db)
    incident_type = incident_repo.create_incident_type(
        organisation=organisation, name=create_in.name, description=create_in.description, fields=create_in.fields
    )

    db.commit()

    return incident_type


@router.patch("/{id}", response_model=IncidentTypeSchema)
async def incident_types_patch(
    id: str,
    user: CurrentUser,
    db: DatabaseSession,
    patch_in: PatchIncidentTypeSchema,
):
    """Patch existing incident type"""
    incident_repo = IncidentRepo(session=db)
    incident_type = incident_repo.get_incident_type_by_id_or_throw(id=id)

    if not user.belongs_to(incident_type.organisation):
        raise NotPermittedError()

    if not incident_type.is_editable:
        raise NotPermittedError("This incident type cannot be edited")

    incident_repo.patch_incident_type(incident_type=incident_type, patch_in=patch_in)

    db.commit()

    return incident_type


@router.delete("/{id}")
async def incident_types_delete(
    id: str,
    user: CurrentUser,
    db: DatabaseSession,
):
    """Delete incident type"""

    incident_repo = IncidentRepo(session=db)
    incident_type = incident_repo.get_incident_type_by_id_or_throw(id=id)

    if not user.belongs_to(incident_type.organisation):
        raise NotPermittedError()

    if not incident_type.is_deletable:
        raise NotPermittedError("This incident type cannot be deleted")

    incident_repo.delete_incident_type(incident_type=incident_type)

    db.commit()

    return Response(status_code=status.HTTP_202_ACCEPTED)
