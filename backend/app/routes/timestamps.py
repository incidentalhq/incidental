from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, status

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession
from app.exceptions import ApplicationException, NotPermittedError
from app.repos import TimestampRepo
from app.schemas.actions import CreateTimestampSchema, PatchTimestampSchema
from app.schemas.models import TimestampSchema
from app.schemas.resources import PaginatedResults

logger = structlog.get_logger(logger_name=__name__)
router = APIRouter(tags=["Timestamps"])


@router.get("/search", response_model=PaginatedResults[TimestampSchema])
async def timestamp_search(user: CurrentUser, organisation: CurrentOrganisation, db: DatabaseSession):
    """ "Search through organisation's timestamps"""
    timestamp_repo = TimestampRepo(session=db)

    timestamps = timestamp_repo.get_timestamps_for_organisation(organisation=organisation)
    total = len(timestamps)
    results = PaginatedResults(total=total, page=1, size=total, items=timestamps)
    return results


@router.patch("/{id}", response_model=TimestampSchema)
async def timestamp_patch(id: str, patch_in: PatchTimestampSchema, db: DatabaseSession, user: CurrentUser):
    """Patch an existing timestamp"""
    timestamp_repo = TimestampRepo(session=db)
    timestamp = timestamp_repo.get_timestamp_by_id_or_raise(id=id)

    if not user.belongs_to(organisation=timestamp.organisation):
        raise NotPermittedError()

    timestamp_repo.patch_timestamp(timestamp=timestamp, patch_in=patch_in)

    db.commit()

    return timestamp


@router.delete("/{id}")
async def timestamp_delete(id: str, db: DatabaseSession, user: CurrentUser):
    """Delete a timestamp"""
    timestamp_repo = TimestampRepo(session=db)
    timestamp = timestamp_repo.get_timestamp_by_id_or_raise(id=id)
    if not timestamp:
        raise ApplicationException("Timestamp not found", status_code=status.HTTP_404_NOT_FOUND)

    if not user.belongs_to(timestamp.organisation):
        raise NotPermittedError()

    if not timestamp.can_delete:
        raise ApplicationException("Cannot delete this timestamp")

    timestamp.deleted_at = datetime.now(tz=timezone.utc)
    db.commit()

    return timestamp


@router.post("")
async def timestamp_create(
    db: DatabaseSession, user: CurrentUser, create_in: CreateTimestampSchema, organisation: CurrentOrganisation
):
    """Create a new custom timestamp"""
    timestamp_repo = TimestampRepo(session=db)
    timestamp = timestamp_repo.create_custom_timestamp(organisation=organisation, create_in=create_in)

    db.commit()

    return timestamp
