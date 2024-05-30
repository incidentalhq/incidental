from fastapi import APIRouter, Request
from sqlalchemy import select, text

from app.deps import DatabaseSession

router = APIRouter(tags=["Health"])


@router.get("")
def health_index(request: Request, db: DatabaseSession):
    results = db.execute(text("select 1")).scalar()

    return {
        "health": "good",
        "agent": request.headers.get("user-agent"),
        "ip": request.client.host if request.client else None,
        "db": results == 1,
    }
