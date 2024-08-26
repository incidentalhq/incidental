from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import CurrentOrganisation, CurrentUser
from app.exceptions import NotPermittedError
from app.models import FieldKind
from app.repos import FormRepo, LifecycleRepo
from app.schemas.actions import PatchFormFieldsSchema
from app.schemas.models import FormFieldSchema, FormSchema
from app.schemas.resources import PaginatedResults

router = APIRouter(tags=["Forms"])


@router.get("/search", response_model=PaginatedResults[FormSchema])
def form_search(user: CurrentUser, organisation: CurrentOrganisation, db: Session = Depends(get_db)):
    """Search for forms"""
    form_repo = FormRepo(session=db)
    forms = form_repo.search_forms(organisation=organisation)
    total = len(forms)

    return PaginatedResults(total=total, page=1, size=total, items=forms)


@router.get("/{id}", response_model=FormSchema)
def form_get(id: str, user: CurrentUser, organisation: CurrentOrganisation, db: Session = Depends(get_db)):
    """Get a single form"""
    form_repo = FormRepo(session=db)
    form = form_repo.get_form_by_id_or_raise(id=id)

    if not user.belongs_to(organisation=form.organisation):
        raise NotPermittedError()

    return form


@router.get("/{id}/fields", response_model=PaginatedResults[FormFieldSchema])
def form_fields(id: str, user: CurrentUser, organisation: CurrentOrganisation, db: Session = Depends(get_db)):
    """Get fields for a form"""
    form_repo = FormRepo(session=db)
    lifecycle_repo = LifecycleRepo(session=db)

    lifecycle = lifecycle_repo.get_lifecycle_for_organisation_or_raise(organisation=organisation)

    form = form_repo.get_form_by_id_or_raise(id=id)

    if not user.belongs_to(organisation=form.organisation):
        raise NotPermittedError()

    form_fields = form.form_fields
    filtered_fields = []

    for form_field in form_fields:
        if form_field.field.kind == FieldKind.INCIDENT_INITIAL_STATUS and lifecycle.is_triage_available is False:
            pass
        else:
            filtered_fields.append(form_field)

    total = len(filtered_fields)

    return PaginatedResults(total=total, page=1, size=total, items=filtered_fields)


@router.patch("/{id}/fields", status_code=status.HTTP_202_ACCEPTED, response_model=None)
def patch_form_fields(id: str, patch_in: PatchFormFieldsSchema, user: CurrentUser, db: Session = Depends(get_db)):
    """Patch the ordering of form fields"""
    form_repo = FormRepo(session=db)
    form = form_repo.get_form_by_id_or_raise(id=id)

    if not user.belongs_to(organisation=form.organisation):
        raise NotPermittedError()

    form_repo.patch_form_fields(form=form, patch_in=patch_in)
    db.commit()

    return Response()
