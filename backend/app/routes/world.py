import structlog
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import User
from app.repos import IncidentRepo, SeverityRepo
from app.schemas.resources import WorldSchema

router = APIRouter(tags=["World"])
logger = structlog.get_logger(logger_name=__name__)


@router.get("/", response_model=WorldSchema)
def world_index(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get world"""
    incident_repo = IncidentRepo(session=db)
    severity_repo = SeverityRepo(session=db)

    status_list = incident_repo.get_all_incident_statuses(organisation=user.organisations[0])
    severity_list = severity_repo.get_all(organisation=user.organisations[0])

    world = {
        "user": user,
        "status_list": status_list,
        "severity_list": severity_list,
        "organisations": user.organisations,
    }

    return world
