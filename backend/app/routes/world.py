import structlog
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import User
from app.schemas.resources import WorldSchema

router = APIRouter(tags=["World"])
logger = structlog.get_logger(logger_name=__name__)


@router.get("/", response_model=WorldSchema)
def world_index(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get world"""
    world = {
        "user": user,
    }

    return world
