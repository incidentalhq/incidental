from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.exceptions import NotPermittedError
from app.models import User
from app.repos import OrganisationRepo
from app.schemas.actions import PatchOrganisationSettingsSchema
from app.schemas.models import OrganisationSchema, SettingsSchema
from app.schemas.resources import PaginatedResults

router = APIRouter(tags=["Organisations"])


@router.get("/search", response_model=PaginatedResults[OrganisationSchema])
def organisation_list(user: User = Depends(get_current_user)):
    """List organisations"""
    total = len(user.organisations)

    return PaginatedResults(total=total, page=1, size=total, items=user.organisations)


@router.get("/{id}", response_model=OrganisationSchema)
def organisation_show(id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get organisation information"""
    organisation_repo = OrganisationRepo(session=db)

    organisation = organisation_repo.get_by_id_or_raise(id=id)
    if not user.belongs_to(organisation=organisation):
        raise NotPermittedError()

    return organisation


@router.get("/{id}/settings", response_model=SettingsSchema)
def organisation_settings(id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get organisation settings"""
    organisation_repo = OrganisationRepo(session=db)
    organisation = organisation_repo.get_by_id_or_raise(id=id)
    if not user.belongs_to(organisation=organisation):
        raise NotPermittedError()

    return organisation.settings


@router.patch("/{id}/settings", response_model=SettingsSchema)
def organisation_settings_update(
    id: str,
    patch_in: PatchOrganisationSettingsSchema,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Patch organisation settings"""
    organisation_repo = OrganisationRepo(session=db)
    organisation = organisation_repo.get_by_id_or_raise(id=id)
    if not user.belongs_to(organisation=organisation):
        raise NotPermittedError()

    organisation_repo.patch_organisation_settings(organisation=organisation, patch_in=patch_in)
    db.commit()

    return organisation.settings
