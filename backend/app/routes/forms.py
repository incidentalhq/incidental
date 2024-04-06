from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import CurrentOrganisation, CurrentUser
from app.repos import FormRepo
from app.schemas.models import FormSchema

router = APIRouter(tags=["Forms"])


@router.get("/search", response_model=list[FormSchema])
def form_search(user: CurrentUser, organisation: CurrentOrganisation, db: Session = Depends(get_db)):
    """Search for forms"""
    form_repo = FormRepo(session=db)
    forms = form_repo.search_forms(organisation=organisation)

    return forms
