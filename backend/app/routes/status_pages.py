import collections
from datetime import datetime, timedelta, timezone
from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, Query, Response, status

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession
from app.exceptions import NotPermittedError, ValidationError
from app.repos import StatusPageRepo
from app.schemas.actions import (
    CreateStatusPageComponentSchema,
    CreateStatusPageGroupSchema,
    CreateStatusPageIncidentSchema,
    CreateStatusPageSchema,
    PaginationParamsSchema,
    PatchStatusPageComponentSchema,
    PatchStatusPageGroupSchema,
    UpdateStatusPageItemsRankSchema,
)
from app.schemas.models import (
    StatusPageComponentEventSchema,
    StatusPageComponentGroupSchema,
    StatusPageComponentSchema,
    StatusPageIncidentSchema,
    StatusPageSchema,
    StatusPageWithEventsSchema,
)
from app.schemas.resources import PaginatedResults

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Status Pages"])


@router.get(
    "/search",
    response_model=PaginatedResults[StatusPageSchema],
    response_model_exclude_defaults=True,
    response_model_exclude_none=True,
)
async def status_pages_search(user: CurrentUser, db: DatabaseSession, organisation: CurrentOrganisation):
    """Get all status pages for this organisation"""
    status_page_repo = StatusPageRepo(session=db)
    status_pages = status_page_repo.search(organisation=organisation)

    return PaginatedResults(items=status_pages, total=len(status_pages), page=1, size=len(status_pages))


@router.post(
    "", response_model=StatusPageSchema, response_model_exclude_none=True, response_model_exclude_defaults=True
)
async def status_pages_create(
    create_in: CreateStatusPageSchema, user: CurrentUser, db: DatabaseSession, organisation: CurrentOrganisation
):
    """Create a new status page"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.create(organisation=organisation, create_in=create_in)

    db.commit()

    return status_page


@router.get(
    "/status",
    response_model=StatusPageWithEventsSchema,
    response_model_exclude_defaults=True,
    response_model_exclude_none=True,
)
async def get_status_page_status(
    db: DatabaseSession,
    slug: str | None = Query(None),
    domain: str | None = Query(None),
):
    """Public status page"""
    status_page_repo = StatusPageRepo(session=db)

    if slug:
        status_page = status_page_repo.get_by_slug_or_raise(slug=slug)

    if domain:
        status_page = status_page_repo.get_by_domain_or_raise(domain=domain)

    if not slug and not domain:
        raise ValidationError("Either slug or domain must be provided")

    # Get events for the last 90 days
    start_date = datetime.now(tz=timezone.utc) - timedelta(days=90)
    end_date = datetime.now(tz=timezone.utc)

    # Get all events for this status page
    events = status_page_repo.get_status_page_events(status_page=status_page, start_date=start_date, end_date=end_date)
    # Calculate downtime for each component
    downtime_by_component: dict[str, float] = collections.defaultdict(float)

    for event in events:
        event_downtime = (
            event.ended_at - event.started_at if event.ended_at else datetime.now(tz=timezone.utc) - event.started_at
        )
        downtime_by_component[event.status_page_component_id] += event_downtime.total_seconds()

    # Calculate uptime for each component as a percentage
    uptime_by_component: dict[str, float] = {}
    for component_id, downtime in downtime_by_component.items():
        uptime = 1 - downtime / (end_date - start_date).total_seconds()
        uptime_by_component[component_id] = uptime

    response = StatusPageWithEventsSchema(
        status_page=StatusPageSchema.model_validate(status_page),
        events=[StatusPageComponentEventSchema.model_validate(event) for event in events],
        uptimes=uptime_by_component,
    )

    return response


@router.get(
    "/{status_page_id}",
    response_model=StatusPageSchema,
    response_model_exclude_defaults=True,
    response_model_exclude_none=True,
)
async def get_status_page(status_page_id: str, user: CurrentUser, db: DatabaseSession):
    """Get a single status page by ID"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.get_by_id_or_raise(id=status_page_id)

    if not user.belongs_to(status_page.organisation):
        raise NotPermittedError()

    return status_page


@router.patch("/{status_page_id}/group/{group_id}", response_model=StatusPageComponentGroupSchema)
async def patch_status_page_group(
    status_page_id: str, group_id: str, patch_in: PatchStatusPageGroupSchema, user: CurrentUser, db: DatabaseSession
):
    """Update group information"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.get_by_id_or_raise(id=status_page_id)

    if not user.belongs_to(status_page.organisation):
        raise NotPermittedError()

    group = status_page_repo.get_group_by_id_or_raise(id=group_id)

    status_page_repo.patch_group(group=group, patch_in=patch_in)

    db.commit()

    return group


@router.patch("/{status_page_id}/component/{component_id}", response_model=StatusPageComponentSchema)
async def patch_status_page_component(
    status_page_id: str,
    component_id: str,
    patch_in: PatchStatusPageComponentSchema,
    user: CurrentUser,
    db: DatabaseSession,
):
    """Update component information"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.get_by_id_or_raise(id=status_page_id)

    if not user.belongs_to(status_page.organisation):
        raise NotPermittedError()

    component = status_page_repo.get_component_by_id_or_raise(id=component_id)

    status_page_repo.patch_component(component=component, patch_in=patch_in)

    db.commit()

    return component


@router.put("/{status_page_id}/components/rank", response_model=StatusPageSchema)
async def status_page_patch_item_rank(
    status_page_id: str,
    update_in: list[UpdateStatusPageItemsRankSchema],
    user: CurrentUser,
    db: DatabaseSession,
):
    """Update components rank"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.get_by_id_or_raise(id=status_page_id)

    if not user.belongs_to(status_page.organisation):
        raise NotPermittedError()

    status_page_repo.update_items_rank(status_page=status_page, update_in=update_in)

    db.commit()

    return status_page


@router.post("/{status_page_id}/group", response_model=StatusPageComponentGroupSchema)
async def status_page_create_group(
    status_page_id: str,
    create_in: CreateStatusPageGroupSchema,
    user: CurrentUser,
    db: DatabaseSession,
):
    """Create new group"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.get_by_id_or_raise(id=status_page_id)

    if not user.belongs_to(status_page.organisation):
        raise NotPermittedError()

    group = status_page_repo.create_group(status_page=status_page, create_in=create_in)

    db.commit()

    return group


@router.post("/{status_page_id}/component", response_model=StatusPageComponentSchema)
async def status_page_create_component(
    status_page_id: str,
    create_in: CreateStatusPageComponentSchema,
    user: CurrentUser,
    db: DatabaseSession,
):
    """Create new component"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.get_by_id_or_raise(id=status_page_id)

    if not user.belongs_to(status_page.organisation):
        raise NotPermittedError()

    component = status_page_repo.create_component(status_page=status_page, create_in=create_in)

    db.commit()

    return component


@router.delete("/{status_page_id}/group/{group_id}")
async def status_page_delete_group(status_page_id: str, group_id: str, user: CurrentUser, db: DatabaseSession):
    """Delete group"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.get_by_id_or_raise(id=status_page_id)
    group = status_page_repo.get_group_by_id_or_raise(id=group_id)

    if not user.belongs_to(status_page.organisation):
        raise NotPermittedError()

    status_page_repo.delete_group(group=group)

    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/{status_page_id}/component/{component_id}")
async def status_page_delete_component(status_page_id: str, component_id: str, user: CurrentUser, db: DatabaseSession):
    """Delete component"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.get_by_id_or_raise(id=status_page_id)
    component = status_page_repo.get_component_by_id_or_raise(id=component_id)

    if not user.belongs_to(status_page.organisation):
        raise NotPermittedError()

    status_page_repo.delete_component(component=component)

    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{status_page_id}/incidents")
async def status_page_create_incident(
    status_page_id: str, create_in: CreateStatusPageIncidentSchema, user: CurrentUser, db: DatabaseSession
):
    """Create new incident for a status page"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.get_by_id_or_raise(id=status_page_id)

    if not user.belongs_to(status_page.organisation):
        raise NotPermittedError()

    incident = status_page_repo.create_incident(creator=user, status_page=status_page, create_in=create_in)

    db.commit()

    return incident


@router.get("/{status_page_id}/components/status")
async def status_page_component_get_component_status(status_page_id: str, user: CurrentUser, db: DatabaseSession):
    """Get status of all components for a status page"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.get_by_id_or_raise(id=status_page_id)

    if not user.belongs_to(status_page.organisation):
        raise NotPermittedError()

    response = status_page_repo.get_component_status(status_page=status_page)

    return response


@router.get("/{status_page_id}/incidents", response_model=PaginatedResults[StatusPageIncidentSchema])
async def status_page_get_incidents(
    status_page_id: str,
    pagination: Annotated[PaginationParamsSchema, Depends(PaginationParamsSchema)],
    user: CurrentUser,
    db: DatabaseSession,
    is_active: bool | None = Query(None, alias="isActive"),
):
    """Get all incidents for a status page"""
    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.get_by_id_or_raise(id=status_page_id)

    if not user.belongs_to(status_page.organisation):
        raise NotPermittedError()

    print(is_active)

    incidents = status_page_repo.get_incidents(status_page=status_page, pagination=pagination, is_active=is_active)
    response = PaginatedResults(items=incidents, total=len(incidents), page=pagination.page, size=pagination.size)

    return response
