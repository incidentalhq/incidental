from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from starlette.status import HTTP_401_UNAUTHORIZED

from app.db import get_db
from app.exceptions import ApplicationException, ErrorCodes
from app.repos import UserRepo


async def get_current_user(db: Session = Depends(get_db), authorization: str = Header(None)):
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
        raise ApplicationException(
            "Invalid token", code=ErrorCodes.INVALID_AUTH_TOKEN, status_code=HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        raise ApplicationException(
            "This account is not active", code=ErrorCodes.INACTIVE_ACCOUNT, status_code=HTTP_401_UNAUTHORIZED
        )

    if not user.is_email_verified:
        raise ApplicationException(
            "Email address has not been verified",
            code=ErrorCodes.ACCOUNT_NOT_VERIFIED,
            status_code=HTTP_401_UNAUTHORIZED,
        )

    return user
