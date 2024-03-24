from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.exceptions import ApplicationException
from app.models import Organisation, User
from app.repos import OrganisationRepo

OrganisationId = Annotated[str | None, Header(alias="x-organisation-id")]
CurrentUser = Annotated[User, Depends(get_current_user)]
DatabaseSession = Annotated[Session, Depends(get_db)]


def get_organisation(organisation_id: OrganisationId, db: DatabaseSession) -> Organisation:
    organisation_repo = OrganisationRepo(session=db)
    if not organisation_id:
        raise ApplicationException("X-Organisation-Id not in headers")

    organisation = organisation_repo.get_by_id(organisation_id)
    if not organisation:
        raise ApplicationException("Organisation not found")

    return organisation


CurrentOrganisation = Annotated[Organisation, Depends(get_organisation)]
