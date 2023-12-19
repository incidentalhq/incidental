from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, status

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession
from app.exceptions import ApplicationException
from app.repos import SeverityRepo
from app.schemas.actions import CreateSeveritySchema, PatchSeveritySchema
from app.schemas.models import IncidentSeveritySchema

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Severities"])


@router.post("", response_model=IncidentSeveritySchema)
async def severity_create(
    user: CurrentUser, db: DatabaseSession, create_in: CreateSeveritySchema, organisation: CurrentOrganisation
):
    if not user.belongs_to(organisation=organisation):
        raise ApplicationException("User is not part of organisation", status_code=status.HTTP_403_FORBIDDEN)

    severity_repo = SeverityRepo(session=db)

    rating = None
    if not create_in.rating:
        rating = severity_repo.get_next_rating(organisation=organisation)
    else:
        rating = create_in.rating

    severity = severity_repo.create_severity(
        organisation=organisation, name=create_in.name, description=create_in.description, rating=rating
    )

    db.commit()

    return severity


@router.patch("/{id}", response_model=IncidentSeveritySchema)
async def severity_patch(id: str, patch_in: PatchSeveritySchema, db: DatabaseSession, user: CurrentUser):
    severity_repo = SeverityRepo(session=db)
    severity = severity_repo.get_severity_by_id(id=id)
    if not severity:
        raise ApplicationException("Severity not found", status_code=status.HTTP_404_NOT_FOUND)

    severity_repo.patch_severity(severity=severity, patch_in=patch_in)

    db.commit()

    return severity


@router.delete("/{id}", response_model=IncidentSeveritySchema)
async def severity_delete(id: str, db: DatabaseSession, user: CurrentUser):
    severity_repo = SeverityRepo(session=db)
    severity = severity_repo.get_severity_by_id(id=id)
    if not severity:
        raise ApplicationException("Severity not found", status_code=status.HTTP_404_NOT_FOUND)

    if len(severity.incidents) > 0:
        raise ApplicationException("This severity is currently in use", status_code=status.HTTP_400_BAD_REQUEST)

    severity.deleted_at = datetime.now(tz=timezone.utc)

    db.commit()

    return severity
