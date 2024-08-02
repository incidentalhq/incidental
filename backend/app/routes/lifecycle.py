from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import CurrentOrganisation, CurrentUser
from app.repos import LifecycleRepo
from app.schemas.actions import PatchLifecycleSchema
from app.schemas.models import LifecycleSchema

router = APIRouter(tags=["Forms"])


@router.get("", response_model=LifecycleSchema)
def lifecycle_get(user: CurrentUser, organisation: CurrentOrganisation, db: Session = Depends(get_db)):
    """Get lifecycle for organisation"""
    lifecycle_repo = LifecycleRepo(session=db)
    lifecycle = lifecycle_repo.get_lifecycle_for_organisation_or_raise(organisation=organisation)

    return lifecycle


@router.patch("/{id}", response_model=LifecycleSchema)
def lifecycle_patch(id: str, patch_in: PatchLifecycleSchema, user: CurrentUser, db: Session = Depends(get_db)):
    """Get lifecycle for organisation"""
    lifecycle_repo = LifecycleRepo(session=db)
    lifecycle = lifecycle_repo.get_lifecycle_by_id_or_raise(id=id)

    lifecycle_repo.patch_lifecycle(lifecycle=lifecycle, patch_in=patch_in)
    db.commit()

    return lifecycle
