from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.actions import AuthUserSchema
from app.schemas.models import UserSchema

router = APIRouter(tags=["Form"])


@router.post("/search/", response_model=UserSchema)
def form_search(item: AuthUserSchema, db: Session = Depends(get_db)):
    """Search for forms"""
    pass
