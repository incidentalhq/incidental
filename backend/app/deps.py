from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import User

OrganisationId = Annotated[str | None, Header(alias="x-organisation-id")]
CurrentUser = Annotated[User, Depends(get_current_user)]
DatabaseSession = Annotated[Session, Depends(get_db)]
