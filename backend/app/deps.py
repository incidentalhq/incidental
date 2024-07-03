from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.exceptions import ApplicationException, NotPermittedError
from app.models import Organisation, User
from app.repos import OrganisationRepo
from app.services.events import Events

ORGANISATION_ID_HEADER = "x-organisation-id"

OrganisationId = Annotated[str | None, Header(alias=ORGANISATION_ID_HEADER)]
CurrentUser = Annotated[User, Depends(get_current_user)]
DatabaseSession = Annotated[Session, Depends(get_db)]


def get_organisation(organisation_id: OrganisationId, db: DatabaseSession, user: CurrentUser) -> Organisation:
    """Get the organisation set in the request's header"""
    organisation_repo = OrganisationRepo(session=db)
    if not organisation_id:
        raise ApplicationException(f"Request is missing {ORGANISATION_ID_HEADER} from headers")

    organisation = organisation_repo.get_by_id(organisation_id)
    if not organisation:
        raise ApplicationException("Organisation not found")

    if not user.belongs_to(organisation=organisation):
        raise NotPermittedError("You are not a member of this organisation")

    return organisation


def get_events():
    events = Events()
    yield events
    events.commit()


CurrentOrganisation = Annotated[Organisation, Depends(get_organisation)]
EventsService = Annotated[Events, Depends(get_events)]
