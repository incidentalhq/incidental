import structlog
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import User
from app.repos import FormRepo, IncidentRepo, SeverityRepo
from app.schemas.resources import WorldSchema

router = APIRouter(tags=["World"])
logger = structlog.get_logger(logger_name=__name__)


@router.get("", response_model=WorldSchema)
def world_index(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get world"""
    incident_repo = IncidentRepo(session=db)
    severity_repo = SeverityRepo(session=db)
    form_repo = FormRepo(session=db)

    details = []
    for organisation in user.organisations:
        status_list = incident_repo.get_all_incident_statuses(organisation)
        severity_list = severity_repo.get_all(organisation)
        forms = form_repo.search_forms(organisation)
        incident_types = incident_repo.get_all_incident_types(organisation)
        roles = incident_repo.get_all_incident_roles(organisation)
        details.append(
            {
                "organisation": organisation,
                "status_list": status_list,
                "severity_list": severity_list,
                "forms": forms,
                "incident_types": incident_types,
                "roles": roles,
            }
        )

    world = {
        "user": user,
        "organisation_details": details,
    }

    return world
