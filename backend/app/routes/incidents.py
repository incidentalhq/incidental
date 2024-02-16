from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import User
from app.repos import IncidentRepo
from app.schemas.actions import IncidentSearchSchema
from app.schemas.models import IncidentSchema
from app.schemas.resources import PaginatedResults

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Incidents"])


@router.get("/search", response_model=PaginatedResults[IncidentSchema])
async def incident_search(
    search_params: Annotated[IncidentSearchSchema, Depends(IncidentSearchSchema.as_query)],
    organisation_id: Annotated[str | None, Header(alias="x-organisation-id")] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    incident_repo = IncidentRepo(session=db)
    incidents = incident_repo.search_incidents(
        organisation=user.organisations[0], query=search_params.q, page=search_params.page, size=search_params.size
    )

    return incidents


@router.post("")
async def incident_create(db: Session = Depends(get_db)):
    pass


@router.get("/{id}")
async def incident_get(id: str, db: Session = Depends(get_db)):
    pass
