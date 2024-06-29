from typing import Annotated

import structlog
from fastapi import APIRouter, Depends

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession, EventsService
from app.exceptions import NotPermittedError
from app.models import FormKind
from app.repos import AnnouncementRepo, FormRepo, IncidentRepo, TimestampRepo, UserRepo
from app.schemas.actions import (
    CreateIncidentSchema,
    IncidentSearchSchema,
    PaginationParamsSchema,
    PatchIncidentSchema,
    PatchIncidentTimestampsSchema,
    UpdateIncidentRoleSchema,
)
from app.schemas.models import IncidentSchema, IncidentUpdateSchema
from app.schemas.resources import PaginatedResults
from app.services.factories import create_incident_service
from app.services.incident import IncidentService

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Incidents"])


@router.get("/search", response_model=PaginatedResults[IncidentSchema])
async def incident_search(
    search_params: Annotated[IncidentSearchSchema, Depends(IncidentSearchSchema.as_query)],
    user: CurrentUser,
    db: DatabaseSession,
    organisation: CurrentOrganisation,
):
    """Search through organisation's incidents"""
    incident_repo = IncidentRepo(session=db)
    incidents = incident_repo.search_incidents(
        organisation=organisation,
        query=search_params.q,
        page=search_params.page,
        size=search_params.size,
        status_categories=search_params.status_category,
    )

    return incidents


@router.post("", response_model=IncidentSchema)
async def incident_create(
    user: CurrentUser,
    db: DatabaseSession,
    create_in: CreateIncidentSchema,
    organisation: CurrentOrganisation,
    events: EventsService,
):
    """Create a new incident"""
    form_repo = FormRepo(session=db)
    incident_repo = IncidentRepo(session=db)
    announcement_repo = AnnouncementRepo(session=db)
    incident_service = IncidentService(
        organisation=organisation, incident_repo=incident_repo, announcement_repo=announcement_repo, events=events
    )
    form = form_repo.get_form(organisation=organisation, form_type=FormKind.CREATE_INCIDENT)
    if not form:
        raise ValueError("Could not find create incident form")

    incident = incident_service.create_incident_from_schema(create_in=create_in, user=user)
    db.commit()

    return incident


@router.get("/{id}", response_model=IncidentSchema)
async def incident_get(id: str, db: DatabaseSession, user: CurrentUser):
    """Get an incident"""
    incident_repo = IncidentRepo(session=db)
    incident = incident_repo.get_incident_by_id_or_raise(id)

    if not user.belongs_to(organisation=incident.organisation):
        raise NotPermittedError()

    return incident


@router.patch("/{id}", response_model=IncidentSchema)
async def incident_patch(
    id: str, patch_in: PatchIncidentSchema, db: DatabaseSession, user: CurrentUser, events: EventsService
):
    """Patch an existing incident"""
    incident_repo = IncidentRepo(session=db)
    incident = incident_repo.get_incident_by_id_or_raise(id)

    if not user.belongs_to(organisation=incident.organisation):
        raise NotPermittedError()

    announcement_repo = AnnouncementRepo(session=db)
    incident_service = IncidentService(
        organisation=incident.organisation,
        incident_repo=incident_repo,
        announcement_repo=announcement_repo,
        events=events,
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
    """Get updates for an incident"""
    incident_repo = IncidentRepo(session=db)
    incident = incident_repo.get_incident_by_id_or_raise(id)

    if not user.belongs_to(organisation=incident.organisation):
        raise NotPermittedError()

    results = incident_repo.get_incident_updates(
        incident=incident,
        page=pagination.page,
        size=pagination.size,
    )

    return results


@router.patch("/{id}/timestamps")
async def incident_patch_timestamps(
    id: str, db: DatabaseSession, user: CurrentUser, patch_in: PatchIncidentTimestampsSchema
):
    """Patch timestamps for an incident"""
    incident_repo = IncidentRepo(session=db)
    timestamp_repo = TimestampRepo(session=db)
    incident = incident_repo.get_incident_by_id_or_raise(id)

    if not user.belongs_to(incident.organisation):
        raise NotPermittedError()

    timestamp_repo.bulk_update_incident_timestamps(incident=incident, put_in=patch_in)

    db.commit()

    return None


@router.put("/{id}/roles/")
async def incident_update_role(
    id: str, db: DatabaseSession, user: CurrentUser, put_in: UpdateIncidentRoleSchema, events: EventsService
):
    """Set role for an incident"""
    incident_repo = IncidentRepo(session=db)
    user_repo = UserRepo(session=db)
    incident = incident_repo.get_incident_by_id_or_raise(id)

    if not user.belongs_to(incident.organisation):
        raise NotPermittedError()

    role_assignee = user_repo.get_by_id_or_raise(put_in.user.id)
    role = incident_repo.get_incident_role_by_id_or_raise(put_in.role.id)

    if not user.belongs_to_any(role_assignee.organisations) or not user.belongs_to(role.organisation):
        raise NotPermittedError()

    incident_service = create_incident_service(session=db, organisation=incident.organisation, events=events)
    incident_service.assign_role(incident=incident, user=role_assignee, role=role)

    db.commit()

    return None
