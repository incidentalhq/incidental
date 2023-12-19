from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/", response_model=str)
def health_index():
    return "OK"
