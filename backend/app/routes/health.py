from fastapi import APIRouter, Request

router = APIRouter(tags=["Health"])


@router.get("")
def health_index(request: Request):
    return {
        "health": "good",
        "agent": request.headers.get("user-agent"),
        "ip": request.client.host if request.client else None,
    }
