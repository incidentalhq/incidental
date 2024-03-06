from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, Query

from app.deps import CurrentUser, DatabaseSession, OrganisationId
from app.repos import AnnouncementRepo, IncidentRepo
from app.schemas.actions import IncidentSearchSchema, PaginationParamsSchema, PatchIncidentSchema
from app.schemas.models import IncidentSchema, IncidentUpdateSchema
from app.schemas.resources import PaginatedResults
from app.services.incident import IncidentService

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Incidents"])


@router.get("/search", response_model=PaginatedResults[IncidentSchema])
async def incident_search(
    search_params: Annotated[IncidentSearchSchema, Depends(IncidentSearchSchema.as_query)],
    user: CurrentUser,
    db: DatabaseSession,
    organisation_id: OrganisationId = None,
):
    incident_repo = IncidentRepo(session=db)
    incidents = incident_repo.search_incidents(
        organisation=user.organisations[0],
        query=search_params.q,
        page=search_params.page,
        size=search_params.size,
        status_categories=search_params.status_category,
    )

    return incidents


@router.post("", response_model=IncidentSchema)
async def incident_create(db: DatabaseSession):
    pass


@router.get("/{id}", response_model=IncidentSchema)
async def incident_get(id: str, db: DatabaseSession, user: CurrentUser):
    incident_repo = IncidentRepo(session=db)
    incident = incident_repo.get_incident_by_id(id)

    return incident


@router.patch("/{id}", response_model=IncidentSchema)
async def incident_patch(id: str, patch_in: PatchIncidentSchema, db: DatabaseSession, user: CurrentUser):
    incident_repo = IncidentRepo(session=db)
    incident = incident_repo.get_incident_by_id(id)
    announcement_repo = AnnouncementRepo(session=db)

    incident_service = IncidentService(
        organisation=user.organisations[0], incident_repo=incident_repo, announcement_repo=announcement_repo
    )
    incident_service.patch_incident(user=user, incident=incident, patch_in=patch_in)

    db.commit()

    return incident


@router.get("/{id}/updates", response_model=PaginatedResults[IncidentUpdateSchema])
async def incident_updates(
    pagination: Annotated[PaginationParamsSchema, Depends(PaginationParamsSchema)],
    id: str,
    db: DatabaseSession,
    user: CurrentUser,
):
    incident_repo = IncidentRepo(session=db)
    incident = incident_repo.get_incident_by_id(id)

    results = incident_repo.get_incident_updates(
        incident=incident,
        page=pagination.page,
        size=pagination.size,
    )

    return results
