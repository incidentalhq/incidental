import structlog
from fastapi import APIRouter

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession
from app.repos import IncidentRepo
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
