import structlog
from fastapi import APIRouter

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession
from app.repos import StatusPageRepo
from app.schemas.actions import CreateStatusPageSchema
from app.schemas.models import StatusPageSchema
from app.schemas.resources import PaginatedResults

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Status Pages"])


@router.get("/search", response_model=PaginatedResults[StatusPageSchema])
async def status_pages_search(user: CurrentUser, db: DatabaseSession, organisation: CurrentOrganisation):
    """Get all status pages for this organisation"""

    status_page_repo = StatusPageRepo(session=db)
    status_pages = status_page_repo.search(organisation=organisation)

    return PaginatedResults(items=status_pages, total=len(status_pages), page=1, size=len(status_pages))


@router.post("", response_model=StatusPageSchema)
async def status_pages_create(
    create_in: CreateStatusPageSchema, user: CurrentUser, db: DatabaseSession, organisation: CurrentOrganisation
):
    """Create a new status page"""

    status_page_repo = StatusPageRepo(session=db)
    status_page = status_page_repo.create(organisation=organisation, create_in=create_in)

    db.commit()

    return status_page
