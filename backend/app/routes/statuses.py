import structlog
from fastapi import APIRouter

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession
from app.repos import IncidentRepo
from app.schemas.models import IncidentStatusSchema
from app.schemas.resources import PaginatedResults

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Incident statuses"])


@router.get("/search", response_model=PaginatedResults[IncidentStatusSchema])
async def status_search(user: CurrentUser, db: DatabaseSession, organisation: CurrentOrganisation):
    """Search for all statues within the organisation"""
    incident_repo = IncidentRepo(session=db)

    statuses = incident_repo.get_all_incident_statuses(organisation=organisation)
    total = len(statuses)

    return PaginatedResults(total=total, page=1, size=total, items=statuses)
