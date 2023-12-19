from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.exceptions import FormFieldValidationError, ValidationError
from app.models import User
from app.repos import UserRepo
from app.schemas.actions import AuthUserSchema
from app.schemas.resources import UserSchema
from app.services.login import LoginError, LoginService
from app.services.security import SecurityService

router = APIRouter(tags=["User"])


@router.post("/auth/", response_model=UserSchema)
def authenticate_user(item: AuthUserSchema, db: Session = Depends(get_db)):
    """Auth user"""
    repo = UserRepo(db)
    security_service = SecurityService(db)

    login_service = LoginService(repo, security_service)
    result = login_service.try_login(item.email_address, item.password)

    db.commit()

    if not result.success:
        if result.error == LoginError.EXCEEDED_MAX_LOGIN_ATTEMPTS:
            raise ValidationError(
                "Exceeded login attempts, please wait 15 minutes before attempting again",
                "max_login_attempts",
            )
        elif result.error == LoginError.NOT_VERIFIED:
            raise ValidationError(
                "Your email address is not verified, please check your email",
                "not_verified",
            )

        raise FormFieldValidationError("Could not login, please try again", "general")

    return result.user


@router.get("/me/", response_model=UserSchema)
def me(
    user: User = Depends(get_current_user),
):
    """Get current user"""
    return user
