from datetime import datetime, timezone

import structlog
from fastapi import APIRouter

from app.deps import CurrentUser, DatabaseSession
from app.exceptions import NotPermittedError
from app.repos import StatusPageRepo
from app.schemas.actions import CreateStatusPageIncidentUpdateSchema
from app.schemas.models import (
    StatusPageComponentEventSchema,
    StatusPageIncidentSchema,
    StatusPageIncidentUpdateSchema,
)
from app.schemas.resources import PaginatedResults

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Status Page Incidents"])


@router.get("/{id}", response_model=StatusPageIncidentSchema)
def get_status_page_incident(id: str, user: CurrentUser, db: DatabaseSession):
    """Get a status page incident by ID."""
    status_page_repo = StatusPageRepo(db)
    incident = status_page_repo.get_incident_or_raise(id)

    if not user.belongs_to(incident.status_page.organisation):
        raise NotPermittedError()

    return incident


@router.get("/{id}/updates", response_model=PaginatedResults[StatusPageIncidentUpdateSchema])
def get_status_page_incident_updates(id: str, user: CurrentUser, db: DatabaseSession):
    """Get a list of status page incident updates."""
    status_page_repo = StatusPageRepo(db)
    incident = status_page_repo.get_incident_or_raise(id)

    if not user.belongs_to(incident.status_page.organisation):
        raise NotPermittedError()

    return incident


@router.post("/{id}/updates", response_model=StatusPageIncidentUpdateSchema)
def create_status_page_incident_update(
    id: str, create_in: CreateStatusPageIncidentUpdateSchema, user: CurrentUser, db: DatabaseSession
):
    """Create a status page incident update."""
    status_page_repo = StatusPageRepo(db)
    incident = status_page_repo.get_incident_or_raise(id)

    if not user.belongs_to(incident.status_page.organisation):
        raise NotPermittedError()

    incident_update = status_page_repo.create_incident_update(user, incident, create_in)

    db.commit()

    return incident_update


@router.get("/{id}/events", response_model=PaginatedResults[StatusPageComponentEventSchema])
def get_status_page_incident_events(id: str, user: CurrentUser, db: DatabaseSession):
    """Get a list of status page component events."""
    status_page_repo = StatusPageRepo(db)
    incident = status_page_repo.get_incident_or_raise(id)

    if not user.belongs_to(incident.status_page.organisation):
        raise NotPermittedError()

    now = datetime.now(tz=timezone.utc)
    events = status_page_repo.get_status_page_events(
        status_page=incident.status_page, start_date=incident.created_at, end_date=now, incident=incident
    )

    page = PaginatedResults(total=len(events), page=1, size=len(events), items=events)
    return page
