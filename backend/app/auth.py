from fastapi import Depends, Header, HTTPException
from starlette.status import HTTP_401_UNAUTHORIZED

from app.db import get_db
from app.repos import UserRepo


async def get_current_user(db: None = Depends(get_db), authorization: str = Header(None)):
    auth_token = None
    if authorization and "bearer" in authorization.lower():
        auth_token = authorization.split(" ")[1]
    else:
        auth_token = authorization

    if not auth_token:
        raise HTTPException(HTTP_401_UNAUTHORIZED, "You must be logged in")

    repo = UserRepo(db)
    user = repo.get_user_by_auth_token(auth_token)
    if not user:
        raise HTTPException(HTTP_401_UNAUTHORIZED, "Invalid token")

    if not user.is_active:
        raise HTTPException(HTTP_401_UNAUTHORIZED, "This account is not active")

    if not user.is_email_verified:
        raise HTTPException(HTTP_401_UNAUTHORIZED, "Email address has not been verified")

    return user
